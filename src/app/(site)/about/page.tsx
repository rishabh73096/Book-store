import type { Metadata } from "next";
import Link from "next/link";
import { EditorialImage, EDITORIAL } from "@/components/site/editorial-image";
import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { getSiteSettings, paragraphs, siteUrl } from "@/lib/site-data";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: `About ${s.authorName}`,
    description: (s.shortBio || `Learn about ${s.authorName}, the author behind these books.`).slice(0, 160),
    alternates: { canonical: "/about" },
  };
}

function Block({ index, title, items }: { index: string; title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <Reveal className="grid gap-4 border-t border-ink/15 py-10 md:grid-cols-12">
      <h2 className="md:col-span-4">
        <span className="t-meta flex gap-4 text-ink/75">
          <span className="text-clay" aria-hidden>{index}</span>
          {title}
        </span>
      </h2>
      <div className="measure flex flex-col gap-5 text-lg md:col-span-7 md:col-start-6">
        {items.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </Reveal>
  );
}

export default async function AboutPage() {
  const s = await getSiteSettings();
  const bio = paragraphs(s.aboutBody);
  const journey = paragraphs(s.writingJourney);
  const influences = paragraphs(s.influences);
  const hasContent = !!(s.shortBio || bio.length || journey.length || influences.length || s.statement);

  let n = 0;
  const num = () => String(++n).padStart(2, "0");

  return (
    <article className="container-site py-12 md:py-20">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Person", name: s.authorName, url: `${siteUrl()}/about`, image: s.authorImage || undefined, sameAs: [s.instagram, s.facebook].filter(Boolean) }} />
      <header className="grid items-end gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="t-meta text-ink/75">About</p>
          <h1 className="t-hero rise-in mt-5">{s.aboutTitle || <>About <em className="text-plum">{s.authorName}</em></>}</h1>
          <p className="measure rise-in mt-8 text-xl text-ink/80" style={{ "--d": "150ms" } as React.CSSProperties}>
            {s.shortBio || (hasContent ? "" : `The full story of ${s.authorName} is on its way. Until then, you can join the list or write a note.`)}
          </p>
        </div>
        <div className="rise-in md:col-span-4 md:col-start-9" style={{ "--d": "250ms" } as React.CSSProperties}>
          {s.authorImage ? (
            <EditorialImage
              image={{ src: s.authorImage, width: 800, height: 1000, alt: `Portrait of ${s.authorName}` }}
              priority
              sizes="(min-width: 768px) 33vw, 100vw"
              className="aspect-[4/5]"
            />
          ) : (
            <EditorialImage image={EDITORIAL.fabric} decorative priority sizes="(min-width: 768px) 33vw, 100vw" className="aspect-[4/5]" />
          )}
        </div>
      </header>

      <div className="mt-16 md:mt-24">
        <Block index={num()} title="Biography" items={bio} />
        <Block index={num()} title="Writing journey" items={journey} />
        <Block index={num()} title="Influences" items={influences} />
        {s.statement && (
          <Reveal className="grid gap-4 border-t border-ink/15 py-10 md:grid-cols-12">
            <h2 className="md:col-span-4">
              <span className="t-meta flex gap-4 text-ink/75"><span className="text-clay" aria-hidden>{num()}</span>A message to readers</span>
            </h2>
            <blockquote className="font-display text-3xl leading-snug italic md:col-span-7 md:col-start-6 md:text-4xl">{s.statement}</blockquote>
          </Reveal>
        )}
      </div>

      <p className="mt-12 flex flex-wrap gap-4">
        <Link href="/books" className="btn-primary">Explore books</Link>
        <Link href="/contact" className="btn-ghost">Get in touch</Link>
      </p>
    </article>
  );
}
