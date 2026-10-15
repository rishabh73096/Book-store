"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/site/logo";
import { CartLink } from "@/components/site/cart-link";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/books", label: "Books" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ name }: { name: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close the mobile menu after navigation
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b-2 transition-[background-color,border-color,padding] duration-300",
        scrolled || open
          ? "border-ink bg-paper py-2"
          : "border-ink bg-paper py-3"
      )}
    >
      <div className="container-site flex items-center justify-between gap-4">
        <Link href="/" aria-label={`${name} — home`}>
          <LogoMark className="h-11 w-auto" />
          <span className="sr-only">{name}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "t-meta border-b-2 border-transparent py-1 transition-colors hover:border-ink",
                isActive(l.href) && "border-plum text-plum"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="t-meta hidden min-h-11 items-center md:inline-flex">
            <CartLink />
          </span>
          <Link href="/books" className="btn-primary hidden md:inline-flex">
            Shop books
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="container-site flex flex-col pt-4 pb-6 md:hidden">
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className="t-h2 flex items-baseline gap-4 border-t border-ink/15 py-3 hover:text-plum"
            >
              <span className="t-meta text-clay" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              {l.label}
            </Link>
          ))}
          <div className="mt-4 flex items-center justify-between border-t border-ink/15 pt-4">
            <span className="t-meta inline-flex min-h-11 items-center">
              <CartLink />
            </span>
            <Link href="/books" className="btn-primary">
              Shop books
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
