import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { getSiteSettings, socialLinks } from "@/lib/site-data";

export async function generateMetadata(): Promise<Metadata> {
  const { authorName } = await getSiteSettings();
  return {
    title: `Contact ${authorName}`,
    description: `Write to ${authorName} — questions about the books, an order, events or collaborations.`,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const s = await getSiteSettings();
  const links = socialLinks(s);

  return (
    <div className="container-site grid gap-14 py-12 md:grid-cols-12 md:py-20">
      <div className="md:col-span-5">
        <p className="t-meta text-ink/70">Contact</p>
        <h1 className="t-h1 rise-in mt-4">Write to me.</h1>
        <p className="measure mt-6 text-lg text-ink/80">
          Questions about a book, an order, or a collaboration — send a note and expect a personal reply.
        </p>
        <ul className="mt-10 flex flex-col gap-3 border-t border-ink/15 pt-6">
          {s.email && <li><a href={`mailto:${s.email}`} className="site-link">{s.email}</a></li>}
          {s.phone && <li><a href={`tel:${s.phone}`} className="site-link">{s.phone}</a></li>}
          {s.address && <li>{s.address}</li>}
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} target="_blank" rel="noreferrer" className="site-link inline-flex min-h-8 items-center">{l.label} ↗</a>
            </li>
          ))}
        </ul>
      </div>
      <div className="md:col-span-6 md:col-start-7">
        <ContactForm />
      </div>
    </div>
  );
}
