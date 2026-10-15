import { Schema, models, model } from "mongoose";

export interface ISiteSettings {
  authorName: string;
  tagline: string;
  heroHeading: string;
  heroText: string;
  authorImage: string;
  aboutTitle: string;
  aboutBody: string;
  shortBio: string;
  statement: string;
  writingJourney: string;
  influences: string;
  insideBooks: string;
  email: string;
  phone: string;
  address: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  shippingCharge: number;
  freeShippingAbove: number;
}

const str = { type: String, default: "", trim: true };

const SiteSettingsSchema = new Schema<ISiteSettings>({
  authorName: { ...str, default: "" },
  tagline: { ...str, default: "" },
  heroHeading: { ...str, default: "" },
  heroText: { ...str, default: "" },
  authorImage: str,
  aboutTitle: { ...str, default: "" },
  aboutBody: { type: String, default: "" },
  shortBio: { type: String, default: "" },
  statement: { type: String, default: "" },
  writingJourney: { type: String, default: "" },
  influences: { type: String, default: "" },
  insideBooks: { type: String, default: "" },
  email: str,
  phone: str,
  address: str,
  whatsapp: str,
  facebook: str,
  instagram: str,
  shippingCharge: { type: Number, default: 50, min: 0 },
  freeShippingAbove: { type: Number, default: 500, min: 0 },
});

export const SiteSettings =
  models.SiteSettings || model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
