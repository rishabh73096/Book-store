import { connectDB } from "@/backend/config/db";
import {
  ContactMessage,
  type ContactStatus,
  type IContactMessage,
} from "@/backend/models/ContactMessage";
import type { ContactFormValues } from "@/lib/validations/contact";

export async function createContactMessage(input: ContactFormValues) {
  await connectDB();
  return ContactMessage.create(input);
}

export async function getContactMessages() {
  await connectDB();
  return ContactMessage.find()
    .sort({ createdAt: -1 })
    .lean<(IContactMessage & { _id: unknown })[]>();
}

export async function getContactStats() {
  await connectDB();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [total, today, last7Days, last30Days] = await Promise.all([
    ContactMessage.countDocuments(),
    ContactMessage.countDocuments({ createdAt: { $gte: startOfToday } }),
    ContactMessage.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ContactMessage.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  return { total, today, last7Days, last30Days };
}

export async function setContactStatus(id: string, status: ContactStatus) {
  await connectDB();
  const message = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true });
  return message ? { id: String(message._id), status: message.status } : null;
}
