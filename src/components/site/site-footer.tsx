import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { socialLinks, type SiteSettings } from "@/lib/site-data";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const socials = socialLinks(settings);

  return (
    <footer className="border-t-2 border-ink bg-ink text-paper">
      <div className="container-site grid gap-10 py-12 md:grid-cols-12 md:gap-12 md:py-20">
        <div className="md:col-span-6">
          <Logo name={settings.authorName} />
          {settings.tagline && <p className="mt-4 max-w-sm text-paper/80">{settings.tagline}</p>}
          <p className="mt-8">
            <Link href="/#join" className="inline-flex min-h-11 items-center border-2 border-paper px-5 font-bold hover:bg-clay hover:text-ink">
              Join the newsletter
            </Link>
          </p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <p className="t-meta text-paper/70">Explore</p>
          <ul className="mt-4 flex flex-col gap-2">
            {[
              ["/", "Home"],
              ["/about", "About"],
              ["/books", "Books"],
              ["/contact", "Contact"],
              ["/privacy", "Privacy policy"],
              ["/terms", "Terms"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-8 items-center hover:underline underline-offset-4">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="t-meta text-paper/70">Reach out</p>
          <ul className="mt-4 flex flex-col gap-2">
            <li><Link href="/contact" className="inline-flex min-h-8 items-center hover:underline underline-offset-4">Write a message</Link></li>
          </ul>
          <ul className="mt-4 flex flex-col gap-2">
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="hover:underline underline-offset-4">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.phone && <li>{settings.phone}</li>}
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="inline-flex min-h-8 items-center hover:underline underline-offset-4">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/15">
        <p className="container-site py-5 text-sm text-paper/70">
          © {new Date().getFullYear()} {settings.authorName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
