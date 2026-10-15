import Link from "next/link";
import { BookCover } from "@/components/site/book-cover";
import { QuickAdd } from "@/components/site/quick-add";
import { Tilt } from "@/components/site/tilt";
import { formatPrice } from "@/lib/format";
import type { SiteBook } from "@/lib/site-data";

export function BookCard({ book, index, priority }: { book: SiteBook; index?: number; priority?: boolean }) {
  return (
    <article className="flex h-full flex-col">
      <Link href={`/books/${book.slug}`} aria-label={`${book.title} — view book`} className="block">
        <Tilt>
          <BookCover
            title={book.title}
            image={book.images[0]}
            priority={priority}
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 34vw, 62vw"
          />
        </Tilt>
      </Link>
      <div className="mt-5 flex flex-1 flex-col border-t border-ink/15 pt-3">
        <p className="t-meta flex justify-between text-ink/70">
          <span>{book.category}</span>
          {index !== undefined && <span aria-hidden>{String(index + 1).padStart(2, "0")}</span>}
        </p>
        <h3 className="t-h3 mt-2">
          <Link href={`/books/${book.slug}`} className="hover:text-plum">
            {book.title}
          </Link>
        </h3>
        {(book.shortDescription || book.description) && (
          <p className="mt-2 line-clamp-3 text-[0.95rem] text-ink/75">{book.shortDescription || book.description}</p>
        )}
        <p className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-4 text-[0.95rem]">
          <span>
            {formatPrice(book.price)}
            {book.mrp > book.price && <s className="ml-2 text-ink/60">{formatPrice(book.mrp)}</s>}
          </span>
          <Link href={`/books/${book.slug}`} className="site-link hidden sm:inline">
            View book
          </Link>
        </p>
        <QuickAdd
          book={{ bookId: book.id, slug: book.slug, title: book.title, price: book.price, image: book.images[0] ?? "", stock: book.stock }}
        />
      </div>
    </article>
  );
}
