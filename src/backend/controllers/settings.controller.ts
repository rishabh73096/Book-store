import { connectDB } from "@/backend/config/db";
import { SiteSettings, type ISiteSettings } from "@/backend/models/SiteSettings";
import type { SettingsInput } from "@/lib/validations/settings";

export async function getSettings(): Promise<ISiteSettings> {
  await connectDB();
  const existing = await SiteSettings.findOne().lean<(ISiteSettings & { _id: unknown }) | null>();
  const doc = existing ?? (await SiteSettings.create({})).toObject();
  const { _id, ...rest } = doc as ISiteSettings & { _id: unknown; __v?: number };
  void _id;
  delete (rest as { __v?: number }).__v;
  return rest;
}

export async function updateSettings(input: SettingsInput) {
  await connectDB();
  return SiteSettings.findOneAndUpdate({}, input, { upsert: true, new: true });
}
