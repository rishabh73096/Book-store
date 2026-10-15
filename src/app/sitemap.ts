import type { MetadataRoute } from "next";
import { getSiteBooks, siteUrl } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const books = await getSiteBooks();
  const pages = ["", "/about", "/books", "/contact", "/privacy", "/terms"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const bookPages = books.map((b) => ({ url: `${base}/books/${b.slug}`, changeFrequency: "weekly" as const, priority: 0.8 }));
  return [...pages, ...bookPages];
}
