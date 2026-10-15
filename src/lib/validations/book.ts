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
  price: z.number().min(0, "Price must be 0 or more"),
  mrp: z.number().min(0).default(0),
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
  .refine((b) => !b.published || b.images.length > 0, {
    message: "Add at least one cover image before publishing, or save as draft.",
    path: ["images"],
  });

export type BookInput = z.infer<typeof bookSchema>;
