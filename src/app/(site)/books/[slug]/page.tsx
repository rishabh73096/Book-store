import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/site/add-to-cart-button";
import { StickyBuyBar } from "@/components/site/sticky-buy-bar";
import { BookCard } from "@/components/site/book-card";
import { BookGallery } from "@/components/site/book-gallery";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { getSiteBook, getSiteBooks, getSiteSettings, paragraphs, siteUrl } from "@/lib/site-data";
import { formatPrice } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getSiteBook(slug);
  if (!book) return { title: "Book not found" };
  const description = (book.shortDescription || book.description || `${book.title} by ${book.author}`).slice(0, 160);
  return {
    title: book.title,
    description,
    alternates: { canonical: `/books/${book.slug}` },
    openGraph: {
      type: "book",
      title: book.title,
      description,
      url: `/books/${book.slug}`,
      images: book.images[0] ? [{ url: book.images[0], alt: `Cover of ${book.title}` }] : undefined,
    },
  };
}

export default async function BookDetailsPage({ params }: Props) {
  const { slug } = await params;
  const [book, books, settings] = await Promise.all([getSiteBook(slug), getSiteBooks(), getSiteSettings()]);
  if (!book) notFound();

  const related = [
    ...books.filter((b) => b.id !== book.id && b.category === book.category),
    ...books.filter((b) => b.id !== book.id && b.category !== book.category),
  ].slice(0, 4);
  const base = siteUrl();

  const details: [string, string | number][] = [
    ["Author", book.author],
    ["Category", book.category],
    ["Format", book.format],
    ["Language", book.language],
    ["Pages", book.pages || ""],
    ["ISBN", book.isbn],
  ];
  const synopsis = paragraphs(book.description);
  const excerpt = book.excerpt ? book.excerpt.split("\n") : [];

  const jsonLd = {
      "@context": "https://schema.org",
      "@type": ["Product", "Book"],
      name: book.title,
      description: book.shortDescription || book.description || undefined,
      image: book.images,
      inLanguage: book.language || undefined,
      numberOfPages: book.pages || undefined,
      isbn: book.isbn || undefined,
      author: book.author ? { "@type": "Person", name: book.author } : undefined,
      url: `${siteUrl()}/books/${book.slug}`,
      offers: {
        "@type": "Offer",
        price: book.price,
        priceCurrency: "INR",
        availability: book.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url: `${siteUrl()}/books/${book.slug}`,
      },
  };

  return (
    <article className="container-site py-10 md:py-16">
      <JsonLd data={jsonLd} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: base },
            { "@type": "ListItem", position: 2, name: "Books", item: `${base}/books` },
            { "@type": "ListItem", position: 3, name: book.title, item: `${base}/books/${book.slug}` },
          ],
        }}
      />
      <nav aria-label="Breadcrumb" className="t-meta mb-8 text-ink/70">
        <Link href="/books" className="site-link">Books</Link> <span aria-hidden>/</span> {book.title}
      </nav>

      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <BookGallery title={book.title} images={book.images} />
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <p className="t-meta text-ink/70">{book.category || "Book"}</p>
          <h1 className="t-h1 rise-in mt-4">{book.title}</h1>
          {book.author && <p className="mt-3 text-lg text-ink/80">by {book.author}</p>}

          <p className="mt-8 flex items-baseline gap-3 font-display text-4xl">
            {formatPrice(book.price)}
            {book.mrp > book.price && <s className="text-2xl text-ink/50">{formatPrice(book.mrp)}</s>}
          </p>
          {book.stock > 0 && (
            <p className="mt-2 text-[0.95rem] text-ink/70">
              {book.stock <= 5 ? `Only ${book.stock} left` : "In stock"} ·{" "}
              {settings.freeShippingAbove > 0 ? `Free shipping on orders above ${formatPrice(settings.freeShippingAbove)}` : "Shipping calculated at checkout"}
            </p>
          )}

          <div className="mt-8 border-y border-ink/15 py-8">
            <AddToCartButton
              book={{
                bookId: book.id,
                slug: book.slug,
                title: book.title,
                price: book.price,
                image: book.images[0] ?? "",
                stock: book.stock,
              }}
            />
          </div>

          <section aria-labelledby="delivery" className="mt-8">
            <h2 id="delivery" className="t-meta text-ink/75">Delivery &amp; payment</h2>
            <ul className="mt-3 flex flex-col gap-1 text-[0.95rem]">
              <li>
                {settings.freeShippingAbove > 0
                  ? `Shipping ${formatPrice(settings.shippingCharge)}, free on orders above ${formatPrice(settings.freeShippingAbove)}.`
                  : `Flat shipping of ${formatPrice(settings.shippingCharge)} per order.`}
              </li>
              <li>Pay securely by UPI, card or netbanking through Razorpay.</li>
              <li>Delivery address is collected at checkout.</li>
            </ul>
          </section>

          {synopsis.length > 0 && (
            <section aria-labelledby="synopsis" className="mt-12">
              <h2 id="synopsis" className="t-meta text-ink/70">Synopsis</h2>
              <div className="measure mt-4 flex flex-col gap-4 text-lg">
                {synopsis.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </section>
          )}

          <section aria-labelledby="details" className="mt-12">
            <h2 id="details" className="t-meta text-ink/70">Publication details</h2>
            <dl className="mt-4 grid grid-cols-[max-content_1fr] gap-x-8 gap-y-2 border-t border-ink/15 pt-4">
              {details.filter(([, v]) => v !== "").map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-ink/70">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      {excerpt.length > 0 && (
        <Reveal variant="wipe" className="mx-auto mt-20 max-w-3xl zine-card p-8 sm:p-12">
          <h2 className="t-meta text-ink/70">Excerpt</h2>
          <blockquote className="mt-6 font-display text-2xl leading-[1.55]">
            {excerpt.map((line, i) => (line.trim() === "" ? <br key={i} /> : <p key={i}>{line}</p>))}
          </blockquote>
        </Reveal>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-24 border-t border-ink/15 pt-10">
          <h2 id="related" className="t-h2 mb-10">You might also like</h2>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {related.map((b, i) => (
              <li key={b.id}>
                <BookCard book={b} index={i} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <StickyBuyBar
        book={{ bookId: book.id, slug: book.slug, title: book.title, price: book.price, image: book.images[0] ?? "", stock: book.stock }}
      />
    </article>
  );
}
