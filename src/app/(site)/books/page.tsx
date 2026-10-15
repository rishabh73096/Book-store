import type { Metadata } from "next";
import Link from "next/link";
import { BookBrowser } from "@/components/site/book-browser";
import { EditorialImage, EDITORIAL } from "@/components/site/editorial-image";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { getSiteBooks, getSiteSettings } from "@/lib/site-data";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: `Books by ${s.authorName}`,
    description: `Browse every book by ${s.authorName} and order directly from the author's site.`,
    alternates: { canonical: "/books" },
  };
}

export default async function BooksPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [books, s] = await Promise.all([getSiteBooks(), getSiteSettings()]);

  return (
    <div className="container-site py-12 md:py-20">
      <header className="mb-12 md:mb-16">
        <p className="t-meta text-ink/75">The collection</p>
        <h1 className="t-hero rise-in mt-5">Books</h1>
      </header>

      {books.length > 0 ? (
        <BookBrowser books={books} initialCategory={category} />
      ) : (
        <div className="grid items-center gap-10 md:grid-cols-12">
          <EditorialImage image={EDITORIAL.stack} decorative sizes="(min-width: 768px) 33vw, 100vw" className="aspect-[4/5] md:col-span-4" imgClassName="object-[50%_30%]" />
          <div className="md:col-span-6 md:col-start-6">
            <h2 className="t-h2">The first books are on their way.</h2>
            <p className="measure mt-5 text-lg text-ink/80">
              {s.authorName}&apos;s books will appear here as soon as they are published. Leave your email and you&apos;ll hear first.
            </p>
            <div className="mt-8 max-w-lg"><NewsletterForm /></div>
            <p className="mt-8"><Link href="/about" className="site-link">Meet the author</Link></p>
          </div>
        </div>
      )}
    </div>
  );
}
