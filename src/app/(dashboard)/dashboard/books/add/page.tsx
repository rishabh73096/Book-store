import type { Metadata } from "next";
import { BookForm } from "@/components/dashboard/books/book-form";

export const metadata: Metadata = { title: "Add book", robots: { index: false, follow: false } };

export default function AddBookPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Add book</h1>
      <BookForm />
    </div>
  );
}
