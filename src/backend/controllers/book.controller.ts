import { connectDB } from "@/backend/config/db";
import { Book, type IBook } from "@/backend/models/Book";
import type { BookInput } from "@/lib/validations/book";

type BookDoc = IBook & { _id: unknown };

export async function getBooks({ publishedOnly = false, featuredOnly = false, limit = 0 } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (publishedOnly) filter.published = true;
  if (featuredOnly) filter.featured = true;
  return Book.find(filter).sort({ createdAt: -1 }).limit(limit).lean<BookDoc[]>();
}

export async function getBookBySlug(slug: string) {
  await connectDB();
  return Book.findOne({ slug, published: true }).lean<BookDoc | null>();
}

export async function getBookById(id: string) {
  await connectDB();
  try {
    return await Book.findById(id).lean<BookDoc | null>();
  } catch {
    return null;
  }
}

export async function createBook(input: BookInput) {
  await connectDB();
  return Book.create(input);
}

export async function updateBook(id: string, input: BookInput) {
  await connectDB();
  return Book.findByIdAndUpdate(id, input, { new: true });
}

export async function deleteBook(id: string) {
  await connectDB();
  return !!(await Book.findByIdAndDelete(id));
}

export async function getBookStats() {
  await connectDB();
  const [total, published, lowStock] = await Promise.all([
    Book.countDocuments(),
    Book.countDocuments({ published: true }),
    Book.countDocuments({ stock: { $lte: 5 } }),
  ]);
  return { total, published, lowStock };
}

// Plain-object shape that is safe to hand to client components.
export function serializeBook(book: BookDoc) {
  return {
    id: String(book._id),
    title: book.title,
    slug: book.slug,
    author: book.author,
    description: book.description,
    shortDescription: book.shortDescription ?? "",
    excerpt: book.excerpt ?? "",
    format: book.format ?? "",
    price: book.price,
    mrp: book.mrp,
    images: book.images,
    stock: book.stock,
    isbn: book.isbn,
    language: book.language,
    pages: book.pages,
    category: book.category,
    featured: book.featured,
    published: book.published,
  };
}

export type SerializedBook = ReturnType<typeof serializeBook>;
