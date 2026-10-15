import { z } from "zod";

export const bookSchema = z
  .object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  author: z.string().trim().max(100).default(""),
  description: z.string().trim().max(10000).default(""),
  shortDescription: z.string().trim().max(300).default(""),
  excerpt: z.string().trim().max(5000).default(""),
  format: z.string().trim().max(40).default(""),
  price: z.number().int("Price must be a whole number of rupees").min(1, "Price must be at least ₹1"),
  mrp: z.number().int("MRP must be a whole number").min(0).default(0),
  images: z
      .array(z.string().refine((v) => /^https?:\/\//.test(v) || v.startsWith("/"), "Invalid image URL"))
      .max(10)
      .default([]),
  stock: z.number().int().min(0).default(0),
  isbn: z.string().trim().max(30).default(""),
  language: z.string().trim().max(40).default("English"),
  pages: z.number().int().min(0).default(0),
  category: z.string().trim().max(60).default(""),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  })
  .refine((b) => b.mrp === 0 || b.mrp >= b.price, {
    message: "MRP can't be lower than the selling price (use 0 for no MRP).",
    path: ["mrp"],
  })
  .refine((b) => !b.published || b.images.length > 0, {
    message: "Add at least one cover image before publishing, or save as draft.",
    path: ["images"],
  });

export type BookInput = z.infer<typeof bookSchema>;
