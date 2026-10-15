import { z } from "zod";

const text = (max: number) => z.string().trim().max(max).default("");

export const settingsSchema = z.object({
  authorName: text(100),
  tagline: text(200),
  heroHeading: text(200),
  heroText: text(500),
  authorImage: text(500),
  aboutTitle: text(200),
  aboutBody: text(10000),
  shortBio: text(1000),
  statement: text(1000),
  writingJourney: text(10000),
  influences: text(5000),
  insideBooks: text(5000),
  email: text(200),
  phone: text(30),
  address: text(300),
  whatsapp: text(20).refine((v) => !v || /^\d{10,15}$/.test(v), "Digits only with country code, e.g. 919876543210"),
  facebook: text(300),
  instagram: text(300),
  shippingCharge: z.number().min(0).default(0),
  freeShippingAbove: z.number().min(0).default(0),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
