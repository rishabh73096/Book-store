import { Schema, models, model } from "mongoose";

export interface IBook {
  title: string;
  slug: string;
  author: string;
  description: string;
  shortDescription: string;
  excerpt: string;
  format: string;
  price: number;
  mrp: number;
  images: string[];
  stock: number;
  isbn: string;
  language: string;
  pages: number;
  category: string;
  featured: boolean;
  published: boolean;
  createdAt: Date;
}

const BookSchema = new Schema<IBook>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  author: { type: String, default: "", trim: true },
  description: { type: String, default: "" },
  shortDescription: { type: String, default: "", trim: true },
  excerpt: { type: String, default: "" },
  format: { type: String, default: "", trim: true },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, default: 0, min: 0 },
  images: { type: [String], default: [] },
  stock: { type: Number, default: 0, min: 0 },
  isbn: { type: String, default: "", trim: true },
  language: { type: String, default: "English", trim: true },
  pages: { type: Number, default: 0, min: 0 },
  category: { type: String, default: "", trim: true },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// In dev, hot reload keeps the first compiled model; drop it so schema changes are picked up.
delete models.Book;
export const Book = model<IBook>("Book", BookSchema);
