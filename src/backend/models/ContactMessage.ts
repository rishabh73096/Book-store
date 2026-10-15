import { Schema, models, model } from "mongoose";

export type ContactStatus = "pending" | "resolved" | "rejected";

export interface IContactMessage {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  status: ContactStatus;
  createdAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["pending", "resolved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export const ContactMessage =
  models.ContactMessage || model<IContactMessage>("ContactMessage", ContactMessageSchema);
