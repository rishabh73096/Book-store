import { readFile } from "node:fs/promises";
import path from "node:path";
import { getBooks, serializeBook, type SerializedBook } from "@/backend/controllers/book.controller";
import { getSettings } from "@/backend/controllers/settings.controller";
import type { ISiteSettings } from "@/backend/models/SiteSettings";

// Server-only data access for the public site. Only real, published content is returned:
// a book without a cover image is never shown, and an unreachable database simply
// yields an empty catalogue (pages render their genuine "nothing yet" states).

export type SiteSettings = ISiteSettings;
export type SiteBook = SerializedBook;

// Facts we know for certain; every other text field stays empty until the owner fills it in.
const DEFAULTS: SiteSettings = {
  authorName: "Suraj",
  tagline: "",
  heroHeading: "",
  heroText: "",
  authorImage: "",
  aboutTitle: "",
  aboutBody: "",
  shortBio: "",
  statement: "",
  writingJourney: "",
  influences: "",
  insideBooks: "",
  email: "",
  phone: "",
  address: "",
  whatsapp: "",
  facebook: "",
  instagram: "",
  shippingCharge: 50,
  freeShippingAbove: 500,
};

// Local content folder (see content/README.md): shown while the database has nothing yet.
async function readLocal<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "content", file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  let real: Partial<SiteSettings> = {};
  try {
    real = await getSettings();
  } catch {
    // No database reachable — defaults only.
  }
  const local = await readLocal<Partial<SiteSettings>>("site.json", {});
  const merged: Record<string, unknown> = { ...DEFAULTS };
  for (const [key, value] of Object.entries({ ...local, ...Object.fromEntries(Object.entries(real).filter(([, v]) => v !== "" && v != null)) })) {
    if (value !== "" && value !== undefined && value !== null) merged[key] = value;
  }
  return merged as unknown as SiteSettings;
}

export async function getSiteBooks(): Promise<SiteBook[]> {
  let fromDb: SiteBook[] = [];
  try {
    fromDb = (await getBooks({ publishedOnly: true })).map(serializeBook).filter((b) => b.images.length > 0);
  } catch {
    // database unreachable — fall back to the local content folder
  }
  if (fromDb.length > 0) return fromDb;
  const local = await readLocal<Partial<SiteBook>[]>("books.json", []);
  return local
    .map((b) => ({ shortDescription: "", description: "", excerpt: "", format: "", language: "English", pages: 0, isbn: "", mrp: 0, category: "", featured: false, published: true, author: "", images: [], stock: 0, price: 0, ...b }) as SiteBook)
    .filter((b) => b.title && b.slug && b.images.length > 0);
}

export async function getSiteBook(slug: string): Promise<SiteBook | null> {
  return (await getSiteBooks()).find((b) => b.slug === slug) ?? null;
}

export function paragraphs(text: string) {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function socialLinks(s: SiteSettings) {
  return [
    s.instagram && { href: s.instagram, label: "Instagram" },
    s.facebook && { href: s.facebook, label: "Facebook" },
    s.whatsapp && { href: `https://wa.me/${s.whatsapp}`, label: "WhatsApp" },
  ].filter(Boolean) as { href: string; label: string }[];
}
