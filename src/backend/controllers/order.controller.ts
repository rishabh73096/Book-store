import { isValidObjectId } from "mongoose";
import { connectDB } from "@/backend/config/db";
import { Book } from "@/backend/models/Book";
import { Order, type IOrder, type OrderStatus } from "@/backend/models/Order";
import { getSettings } from "@/backend/controllers/settings.controller";
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

// Idempotent: called from both the browser callback and the webhook. Stock is only
// reduced the first time an order moves out of pending_payment/failed into paid.
export async function markOrderPaid(razorpayOrderId: string, razorpayPaymentId: string) {
  await connectDB();
  const order = await Order.findOneAndUpdate(
    { razorpayOrderId, status: { $in: ["pending_payment", "failed"] } },
    { status: "paid", razorpayPaymentId },
    { new: true }
  );
  if (!order) {
    return Order.findOne({ razorpayOrderId }).lean<OrderDoc | null>();
  }
  for (const item of order.items) {
    await Book.updateOne({ _id: item.book }, { $inc: { stock: -item.quantity } });
  }
  return order.toObject() as OrderDoc;
}

export async function markOrderFailed(razorpayOrderId: string) {
  await connectDB();
  await Order.updateOne({ razorpayOrderId, status: "pending_payment" }, { status: "failed" });
}

export async function getOrders({ paidOnly = false } = {}) {
  await connectDB();
  const filter = paidOnly ? { status: { $ne: "pending_payment" } } : {};
  return Order.find(filter).sort({ createdAt: -1 }).lean<OrderDoc[]>();
}

export async function getOrderByNumber(orderNumber: string) {
  await connectDB();
  return Order.findOne({ orderNumber }).lean<OrderDoc | null>();
}

export async function updateOrder(id: string, input: { status?: OrderStatus; trackingNote?: string }) {
  await connectDB();
  try {
    return await Order.findByIdAndUpdate(id, input, { new: true });
  } catch {
    return null;
  }
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
