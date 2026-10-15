import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookForm } from "@/components/dashboard/books/book-form";
import { getBookById } from "@/backend/controllers/book.controller";

export const metadata: Metadata = { title: "Edit book", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit book</h1>
      <BookForm
        bookId={id}
        initial={{
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
        }}
      />
    </div>
  );
}
