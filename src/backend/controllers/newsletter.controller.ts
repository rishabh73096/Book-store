import { connectDB } from "@/backend/config/db";
import {
  NewsletterSubscriber,
  type INewsletterSubscriber,
} from "@/backend/models/NewsletterSubscriber";

export async function subscribe(email: string) {
  await connectDB();
  // Idempotent: subscribing twice is not an error and does not reveal who is subscribed.
  await NewsletterSubscriber.updateOne(
    { email },
    { $setOnInsert: { email, subscribedAt: new Date() } },
    { upsert: true }
  );
}

export async function getSubscribers() {
  await connectDB();
  return NewsletterSubscriber.find()
    .sort({ subscribedAt: -1 })
    .lean<(INewsletterSubscriber & { _id: unknown })[]>();
}
