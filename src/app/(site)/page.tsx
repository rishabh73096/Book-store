import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, ShieldCheck, Truck } from "lucide-react";
import { BookCard } from "@/components/site/book-card";
import { BookCover } from "@/components/site/book-cover";
import { EditorialImage, EDITORIAL } from "@/components/site/editorial-image";
import { JsonLd } from "@/components/site/json-ld";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { Reveal } from "@/components/site/reveal";
import { Tilt } from "@/components/site/tilt";
import { formatPrice } from "@/lib/format";
import { getSiteBooks, getSiteSettings, paragraphs, siteUrl, socialLinks } from "@/lib/site-data";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: { absolute: `${s.authorName} — Author and online bookstore` },
    description: `The official website of ${s.authorName}: discover the books, read about the author and order directly with secure checkout.`,
    alternates: { canonical: "/" },
  };
}

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;
const TILES = ["bg-clay", "bg-sage", "bg-lilac", "bg-plum text-white"];

// Chunky numbered section label.
function Label({ n, children, className }: { n: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-3 ${className ?? ""}`}>
      <span aria-hidden className="inline-flex size-9 items-center justify-center border-2 border-ink bg-white font-display text-lg text-ink shadow-[3px_3px_0_#17140f]">{n}</span>
      <span className="t-meta font-bold">{children}</span>
    </p>
  );
}

export default async function HomePage() {
  const [settings, books] = await Promise.all([getSiteSettings(), getSiteBooks()]);
  const name = settings.authorName;
  const hasBooks = books.length > 0;
  const featured = books.find((b) => b.featured) ?? books[0];
  const shelf = books.filter((b) => b.id !== featured?.id).slice(0, 4);
  const excerptBook = books.find((b) => b.excerpt);
  const why = paragraphs(settings.insideBooks);
  const socials = socialLinks(settings);
  const categories = Array.from(
    books.reduce((m, b) => (b.category ? m.set(b.category, (m.get(b.category) ?? 0) + 1) : m), new Map<string, number>())
  );

  const heading = settings.heroHeading || `Books by ${name}.`;
  const words = heading.trim().split(" ");
  const tail = words.splice(-2).join(" ");
  const intro =
    settings.heroText ||
    (hasBooks ? "Read about the author, discover the books and order directly from this site." : "New books are on their way. Join the list to hear first when they are published.");

  const perks = [
    { icon: BookOpenCheck, title: "Direct from the author", text: `Orders go through ${name}'s own store.` },
    { icon: Truck, title: settings.freeShippingAbove > 0 ? "Free shipping" : "Simple shipping", text: settings.freeShippingAbove > 0 ? `Above ${formatPrice(settings.freeShippingAbove)}; otherwise ${formatPrice(settings.shippingCharge)}.` : `Flat ${formatPrice(settings.shippingCharge)} per order.` },
    { icon: ShieldCheck, title: "Secure payment", text: "UPI, cards and netbanking via Razorpay." },
  ];

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Person", name, url: siteUrl(), image: settings.authorImage || undefined, sameAs: [settings.instagram, settings.facebook].filter(Boolean) }} />

      {/* 02 — Hero */}
      <section aria-labelledby="hero-title" className="overflow-hidden border-b-2 border-ink">
        <div className="container-site grid items-center gap-10 md:gap-14 pt-8 pb-14 md:grid-cols-12 md:pt-16 md:pb-28">
          <div className="md:col-span-7">
            <p className="rise-in"><span className="sticker">{name} · new here? start below</span></p>
            <h1 id="hero-title" className="t-hero rise-in mt-8" style={delay(120)}>
              {words.join(" ")} <span className="mark">{tail}</span>
            </h1>
            <p className="rise-in measure mt-8 text-lg font-medium md:text-xl" style={delay(260)}>{intro}</p>
            <div className="rise-in mt-10 flex flex-wrap gap-4" style={delay(380)}>
              <Link href={hasBooks ? "/books" : "#join"} className="btn-primary">{hasBooks ? "Shop now →" : "Join the list"}</Link>
              <Link href="/about" className="btn-ghost">Meet the author</Link>
            </div>
          </div>

          <div className="relative md:col-span-5">
            <span aria-hidden className="absolute -top-6 -right-4 hidden size-40 rounded-full border-2 border-ink bg-sage md:block" />
            <span aria-hidden className="absolute -bottom-6 -left-6 size-28 border-2 border-ink bg-lilac" />
            {featured ? (
              <div className="rise-in relative mx-auto w-[62%] max-w-[22rem] md:w-[84%] md:max-w-none" style={delay(200)}>
                <Tilt><BookCover title={featured.title} image={featured.images[0]} priority sizes="(min-width: 768px) 36vw, 62vw" /></Tilt>
                <span className="sticker absolute -top-5 -left-5 rotate-[-8deg]">Start here</span>
              </div>
            ) : (
              <div className="rise-in relative mx-auto w-[78%] max-w-sm md:w-[84%] md:max-w-none" style={delay(200)}>
                <EditorialImage image={EDITORIAL.stack} tint="bg-clay" priority sizes="(min-width: 768px) 36vw, 78vw" className="relative aspect-[4/5] shadow-book" imgClassName="object-[50%_30%]" />
              </div>
            )}
          </div>
        </div>
      </section>

      {hasBooks && (
        <section aria-label="Shopping information" className="border-b-2 border-ink bg-clay">
          <ul className="container-site grid gap-6 py-6 sm:grid-cols-3">
            {perks.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4">
                <Icon className="mt-1 size-7 shrink-0" aria-hidden />
                <div>
                  <p className="font-display text-xl leading-tight">{title}</p>
                  <p className="mt-0.5 text-[0.95rem] font-medium">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 03 — Featured books */}
      <section aria-labelledby="featured-title" className="py-14 md:py-28">
        <div className="container-site">
          <Reveal className="mb-8 flex flex-wrap items-end md:mb-12 justify-between gap-6">
            <div>
              <Label n="01">Featured books</Label>
              <h2 id="featured-title" className="t-h1 mt-6">{hasBooks ? <>Start with <span className="mark">these.</span></> : "The first books are coming."}</h2>
            </div>
            {hasBooks && <Link href="/books" className="btn-ghost">View all books →</Link>}
          </Reveal>

          {featured ? (
            <div className="grid gap-12">
              <Reveal className="zine-card grid items-center gap-8 bg-lilac p-6 sm:p-10 md:grid-cols-12">
                <div className="mx-auto w-[55%] max-w-xs md:col-span-3 md:w-full"><Tilt><BookCover title={featured.title} image={featured.images[0]} /></Tilt></div>
                <div className="md:col-span-8 md:col-start-5">
                  <p className="t-meta font-bold">{[featured.category, featured.format].filter(Boolean).join(" · ")}</p>
                  <h3 className="t-h1 mt-3">{featured.title}</h3>
                  <p className="measure mt-4 text-lg font-medium">{featured.shortDescription || featured.description}</p>
                  <p className="mt-5 flex items-baseline gap-3 font-display text-4xl">
                    {formatPrice(featured.price)}
                    {featured.mrp > featured.price && <s className="text-2xl opacity-60">{formatPrice(featured.mrp)}</s>}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-4">
                    <Link href={`/books/${featured.slug}`} className="btn-primary">View book</Link>
                    {featured.stock > 0 && <Link href={`/books/${featured.slug}`} className="btn-ghost">Buy now</Link>}
                  </div>
                </div>
              </Reveal>

              {shelf.length > 0 && (
                <ul className="grid grid-cols-2 gap-x-5 gap-y-14 lg:grid-cols-4 lg:gap-x-8">
                  {shelf.map((book, i) => (
                    <Reveal as="li" key={book.id} delay={i * 90} className="h-full"><BookCard book={book} index={i + 1} /></Reveal>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <Reveal className="zine-card grid items-center md:grid-cols-12">
              <EditorialImage image={EDITORIAL.vintage} tint="bg-lilac" decorative sizes="(min-width: 768px) 33vw, 100vw" className="aspect-[4/3] border-0 border-b-2 md:col-span-4 md:aspect-auto md:h-full md:min-h-80 md:border-r-2 md:border-b-0" imgClassName="object-[50%_25%]" />
              <div className="p-8 md:col-span-7 md:col-start-6 md:p-12">
                <p className="measure font-display text-3xl leading-snug md:text-4xl">Covers, prices and each book&apos;s story will appear here as soon as the books are published.</p>
                <p className="mt-8"><Link href="#join" className="btn-primary">Notify me</Link></p>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* 04 — A glimpse inside */}
      <section aria-labelledby="excerpt-title" className="border-y-2 border-ink bg-lilac">
        <div className="container-site grid items-center gap-12 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-4">
            <Reveal>
              <Label n="02">A glimpse inside</Label>
              <h2 id="excerpt-title" className="t-h1 mt-6">A page to <span className="mark">begin with.</span></h2>
            </Reveal>
          </div>
          <Reveal variant="wipe" className="md:col-span-7 md:col-start-6">
            <figure className="zine-card relative p-8 sm:p-12">
              <span aria-hidden className="absolute -top-6 left-6 font-display text-8xl leading-none text-plum">&ldquo;</span>
              {excerptBook ? (
                <>
                  <blockquote className="measure mt-6 font-display text-2xl leading-[1.5] sm:text-[1.85rem]">
                    {excerptBook.excerpt.split("\n").map((line, i) => (line.trim() === "" ? <br key={i} /> : <p key={i}>{line}</p>))}
                  </blockquote>
                  <figcaption className="t-meta mt-8 border-t-2 border-ink pt-4 font-bold">
                    From {excerptBook.title} · <Link href={`/books/${excerptBook.slug}`} className="site-link">About the book</Link>
                  </figcaption>
                </>
              ) : (
                <p className="mt-6 font-display text-2xl leading-snug">Sample pages and favourite lines will be shared here once the first book is out.</p>
              )}
            </figure>
          </Reveal>
        </div>
      </section>

      {/* 05 — Meet the author */}
      <section aria-labelledby="author-title" className="py-14 md:py-28">
        <div className="container-site grid items-center gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <div className="relative">
              <span aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 border-2 border-ink bg-sage" />
              {settings.authorImage ? (
                <EditorialImage image={{ src: settings.authorImage, width: 800, height: 1000, alt: `Portrait of ${name}` }} sizes="(min-width: 768px) 40vw, 100vw" className="relative aspect-[4/5]" />
              ) : (
                <EditorialImage image={EDITORIAL.fabric} tint="bg-clay" decorative sizes="(min-width: 768px) 40vw, 100vw" className="relative aspect-[4/5]" />
              )}
              <span className="sticker absolute -right-3 -bottom-5 rotate-3">The author</span>
            </div>
          </Reveal>
          <div className="md:col-span-6 md:col-start-7">
            <Reveal>
              <Label n="03">Meet the author</Label>
              <h2 id="author-title" className="t-h1 mt-6">Hello, I&apos;m <span className="mark">{name}.</span></h2>
              <p className="measure mt-6 text-lg">{settings.shortBio || `The story behind the books — who ${name} is and why they write — is being put together.`}</p>
            </Reveal>
            <Reveal delay={120}>
              {settings.statement && <blockquote className="zine-card mt-8 bg-clay p-6 font-display text-2xl leading-snug md:text-3xl">{settings.statement}</blockquote>}
              <p className="mt-8"><Link href="/about" className="btn-primary">Read my story</Link></p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 06 — Explore by theme */}
      <section aria-labelledby="themes-title" className="border-y-2 border-ink bg-white py-14 md:py-28">
        <div className="container-site">
          <Reveal className="mb-8 md:mb-12">
            <Label n="04">Explore by theme</Label>
            <h2 id="themes-title" className="t-h1 mt-6">Find your <span className="mark">way in.</span></h2>
          </Reveal>
          {categories.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map(([cat, count], i) => (
                <li key={cat}>
                  <Link href={`/books?category=${encodeURIComponent(cat)}`} className={`zine-card group flex min-h-44 flex-col justify-between p-6 transition-transform hover:-translate-x-1 hover:-translate-y-1 ${TILES[i % TILES.length]}`}>
                    <span className="font-display text-4xl leading-none">{cat}</span>
                    <span className="t-meta flex justify-between font-bold">{count} {count === 1 ? "book" : "books"} <span aria-hidden>→</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="measure font-display text-2xl leading-snug md:text-3xl">Themes and collections will be listed here, matched to the books as they are added.</p>
          )}
        </div>
      </section>

      {/* 07 — Why read these books */}
      <section aria-labelledby="why-title" className="bg-sage py-14 md:py-28">
        <div className="container-site grid items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-6 md:order-2 md:col-start-7">
            <Reveal>
              <Label n="05">Why read these books?</Label>
              <h2 id="why-title" className="t-h1 mt-6">What you&apos;ll find between <span className="mark">the covers.</span></h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="measure mt-8 flex flex-col gap-5 text-lg font-medium">
                {why.length > 0 ? why.map((p, i) => <p key={i}>{p}</p>) : <p>The themes, the writing style and the reading experience of each book will be described here, in the author&apos;s own words.</p>}
              </div>
            </Reveal>
          </div>
          <Reveal className="md:col-span-5 md:order-1">
            <EditorialImage image={EDITORIAL.stack} tint="bg-lilac" decorative sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/5] shadow-book" imgClassName="object-[50%_35%]" />
          </Reveal>
        </div>
      </section>

      {/* 08 — Newsletter */}
      <section id="join" aria-labelledby="connect-title" className="scroll-mt-20 border-y-2 border-ink bg-plum text-white">
        <div className="container-site grid items-center gap-12 py-20 md:grid-cols-12 md:py-28">
          <Reveal className="md:col-span-7">
            <Label n="06" className="text-ink">Stay connected</Label>
            <h2 id="connect-title" className="t-h1 mt-6">New books, in your <span className="rounded-sm bg-clay px-2 text-ink">inbox first.</span></h2>
            <p className="measure mt-5 text-lg">New releases and author updates, in a short note. Unsubscribe any time.</p>
            <div className="mt-8 max-w-lg"><NewsletterForm tone="dark" /></div>
            {socials.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-4 border-t-2 border-white/40 pt-6">
                {socials.map((s) => (
                  <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer" className="btn-ghost">{s.label} ↗</a></li>
                ))}
              </ul>
            )}
          </Reveal>
          <Reveal delay={120} className="hidden md:col-span-4 md:col-start-9 md:block">
            <EditorialImage image={EDITORIAL.vintage} tint="bg-clay" decorative sizes="33vw" className="aspect-[3/4] shadow-book" imgClassName="object-[50%_20%]" />
          </Reveal>
        </div>
      </section>

      {/* 09 — Final CTA (footer follows) */}
      <section aria-labelledby="final-title" className="py-24 text-center md:py-36">
        <Reveal className="container-site">
          <h2 id="final-title" className="t-hero mx-auto max-w-5xl">Find your next <span className="mark">read.</span></h2>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/books" className="btn-primary">{hasBooks ? "Discover the collection →" : "See the books page"}</Link>
            <Link href="/about" className="btn-ghost">About {name}</Link>
            <Link href="/contact" className="btn-ghost">Contact</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
