import Link from "next/link";
import { CartProvider } from "@/components/site/cart-provider";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { formatPrice } from "@/lib/format";
import { getSiteBooks, getSiteSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, books] = await Promise.all([getSiteSettings(), getSiteBooks()]);
  const announcement =
    books.length > 0
      ? [
          settings.freeShippingAbove > 0 ? `Free shipping on orders above ${formatPrice(settings.freeShippingAbove)}` : null,
          "Secure online payment",
        ]
          .filter(Boolean)
          .join("  ·  ")
      : null;

  return (
    <CartProvider>
      <div className="site flex min-h-screen flex-col font-sans">
        <noscript>
          <style>{`.reveal,.page-wipe{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-plum focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {announcement && (
          <p className="t-meta bg-ink px-4 py-2 text-center text-paper">{announcement}</p>
        )}
        <SiteHeader name={settings.authorName} />
        <CartDrawer freeShippingAbove={settings.freeShippingAbove} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter settings={settings} />

        {settings.whatsapp && (
          <Link
            href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent("Hello! I have a question about your books.")}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat on WhatsApp"
            className="btn-ghost bg-sage fixed right-3 bottom-3 z-30 md:right-4 md:bottom-4"
          >
            WhatsApp
          </Link>
        )}
      </div>
    </CartProvider>
  );
}
