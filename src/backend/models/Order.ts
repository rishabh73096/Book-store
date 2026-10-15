import { Schema, models, model } from "mongoose";

export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface IOrderItem {
  book: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IOrder {
  orderNumber: string;
  items: IOrderItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  trackingNote: string;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    book: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  items: { type: [OrderItemSchema], required: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ORDER_STATUSES, default: "pending_payment" },
  razorpayOrderId: { type: String, default: "", index: true },
  razorpayPaymentId: { type: String, default: "" },
  trackingNote: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const Order = models.Order || model<IOrder>("Order", OrderSchema);
