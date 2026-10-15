import { isValidObjectId } from "mongoose";
import { connectDB } from "@/backend/config/db";
import { Book } from "@/backend/models/Book";
import { Order, type IOrder, type OrderStatus } from "@/backend/models/Order";
import { NEXT_STATUSES, STATUS_LABEL } from "@/lib/order-status";
import { getSettings } from "@/backend/controllers/settings.controller";
import { MAX_QTY_PER_BOOK } from "@/lib/limits";
import { createRazorpayOrder, getRazorpayKeyId } from "@/backend/lib/razorpay";
import type { CheckoutInput } from "@/lib/validations/order";

export class OrderError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type OrderDoc = IOrder & { _id: unknown };

function newOrderNumber() {
  return `BK${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0")}`;
}

// Prices are always re-read from the database — the client only says which books and how many.
export async function createCheckout(input: CheckoutInput) {
  if (input.items.some((i) => !isValidObjectId(i.bookId))) {
    throw new OrderError("These books can't be ordered online yet. Please check back soon.");
  }
  await connectDB();

  const merged = new Map<string, number>();
  for (const item of input.items) {
    merged.set(item.bookId, (merged.get(item.bookId) ?? 0) + item.quantity);
  }

  for (const qty of merged.values()) {
    if (qty > MAX_QTY_PER_BOOK) {
      throw new OrderError(`You can buy at most ${MAX_QTY_PER_BOOK} copies of a book per order`);
    }
  }

  const books = await Book.find({ _id: { $in: [...merged.keys()] }, published: true });
  if (books.length !== merged.size) {
    throw new OrderError("Some books in your cart are no longer available");
  }

  const items = books.map((book) => {
    const quantity = merged.get(String(book._id)) ?? 0;
    if (book.stock < quantity) {
      throw new OrderError(
        book.stock === 0 ? `"${book.title}" is out of stock` : `Only ${book.stock} copies of "${book.title}" left`
      );
    }
    return {
      book: String(book._id),
      title: book.title,
      image: book.images[0] ?? "",
      price: book.price,
      quantity,
    };
  });

  const settings = await getSettings();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping =
    settings.freeShippingAbove > 0 && subtotal >= settings.freeShippingAbove
      ? 0
      : settings.shippingCharge;
  const total = subtotal + shipping;

  const orderNumber = newOrderNumber();
  const rzp = await createRazorpayOrder(total, orderNumber);

  await Order.create({
    orderNumber,
    items,
    customer: input.customer,
    subtotal,
    shipping,
    total,
    status: "pending_payment",
    razorpayOrderId: rzp.id,
  });

  return {
    orderNumber,
    razorpayOrderId: rzp.id,
    amount: rzp.amount,
    currency: rzp.currency,
    keyId: getRazorpayKeyId(),
    customer: input.customer,
  };
}

// Idempotent: called from both the browser callback and the webhook. The status flip is atomic,
// so only one caller proceeds to take stock. Stock is taken per line with a "stock >= qty" guard:
// if someone else bought the last copy first, the order stays paid (we hold the money) but is
// flagged for the admin to refund or contact the customer.
export async function markOrderPaid(razorpayOrderId: string, razorpayPaymentId: string, paidPaise?: number) {
  await connectDB();

  const existing = await Order.findOne({ razorpayOrderId });
  if (!existing) return null;
  if (paidPaise !== undefined && Math.round(existing.total * 100) !== paidPaise) {
    if (existing.status === "pending_payment" || existing.status === "failed") {
      existing.trackingNote = `AMOUNT MISMATCH: expected ${existing.total * 100} paise, gateway reported ${paidPaise}. Check Razorpay payment ${razorpayPaymentId}.`;
      await existing.save();
    }
    return existing.toObject() as OrderDoc;
  }

  const order = await Order.findOneAndUpdate(
    { razorpayOrderId, status: { $in: ["pending_payment", "failed"] } },
    { status: "paid", razorpayPaymentId },
    { new: true }
  );
  if (!order) return existing.toObject() as OrderDoc;

  const shortages: string[] = [];
  for (const item of order.items) {
    const res = await Book.updateOne({ _id: item.book, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } });
    if (res.modifiedCount === 1) item.stockTaken = true;
    else shortages.push(`${item.title} (wanted ${item.quantity})`);
  }
  if (shortages.length > 0) {
    order.trackingNote = `STOCK SHORTAGE: ${shortages.join(", ")}. Payment was received — refund or contact the customer.`;
  }
  await order.save();
  return order.toObject() as OrderDoc;
}

export async function markOrderFailed(razorpayOrderId: string) {
  await connectDB();
  await Order.updateOne({ razorpayOrderId, status: "pending_payment" }, { status: "failed" });
}

export async function getOrders({ paidOnly = false } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = paidOnly ? { status: { $ne: "pending_payment" } } : {};
  return Order.find(filter).sort({ createdAt: -1 }).limit(500).lean<OrderDoc[]>();
}

export async function getOrderByNumber(orderNumber: string) {
  await connectDB();
  return Order.findOne({ orderNumber }).lean<OrderDoc | null>();
}

export async function updateOrder(id: string, input: { status?: OrderStatus; trackingNote?: string }) {
  await connectDB();
  if (!isValidObjectId(id)) return null;

  const order = await Order.findById(id);
  if (!order) return null;

  if (input.trackingNote !== undefined) order.trackingNote = input.trackingNote;

  if (input.status && input.status !== order.status) {
    const allowed = NEXT_STATUSES[order.status as OrderStatus];
    if (!allowed.includes(input.status)) {
      throw new OrderError(`An order that is "${STATUS_LABEL[order.status as OrderStatus]}" can't be changed to "${STATUS_LABEL[input.status]}".`, 409);
    }
    // Atomic guard: only apply if nobody changed the status meanwhile.
    const moved = await Order.updateOne({ _id: id, status: order.status }, { status: input.status });
    if (moved.modifiedCount !== 1) throw new OrderError("This order was just updated by someone else. Refresh and try again.", 409);
    order.status = input.status;

    // Cancelling an order whose stock was taken returns that stock exactly once.
    if (input.status === "cancelled") {
      for (const item of order.items) {
        if (item.stockTaken) {
          await Book.updateOne({ _id: item.book }, { $inc: { stock: item.quantity } });
          item.stockTaken = false;
        }
      }
    }
  }

  await Order.updateOne({ _id: id }, { trackingNote: order.trackingNote, items: order.items });
  return order;
}

export async function getOrderStats() {
  await connectDB();
  const paidStatuses = ["paid", "shipped", "delivered"];
  const [total, toShip, revenueAgg] = await Promise.all([
    Order.countDocuments({ status: { $ne: "pending_payment" } }),
    Order.countDocuments({ status: "paid" }),
    Order.aggregate([
      { $match: { status: { $in: paidStatuses } } },
      { $group: { _id: null, revenue: { $sum: "$total" } } },
    ]),
  ]);
  return { total, toShip, revenue: (revenueAgg[0]?.revenue as number | undefined) ?? 0 };
}

export function serializeOrder(order: OrderDoc) {
  return {
    id: String(order._id),
    orderNumber: order.orderNumber,
    items: order.items.map((i) => ({
      title: i.title,
      price: i.price,
      quantity: i.quantity,
    })),
    customer: order.customer,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    status: order.status,
    razorpayPaymentId: order.razorpayPaymentId,
    trackingNote: order.trackingNote,
    createdAt: order.createdAt.toISOString(),
  };
}

export type SerializedOrder = ReturnType<typeof serializeOrder>;
