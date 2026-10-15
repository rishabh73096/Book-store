"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useCart } from "@/components/site/cart-provider";
import { CartNotices } from "@/components/site/cart-notices";
import { QuantityStepper } from "@/components/site/quantity-stepper";
import { MAX_QTY_PER_BOOK } from "@/lib/limits";
import { ShippingProgress } from "@/components/site/shipping-progress";
import { formatPrice } from "@/lib/format";

export function CartDrawer({ freeShippingAbove }: { freeShippingAbove: number }) {
  const { items, subtotal, drawerOpen, closeDrawer, setQuantity, remove, hasUnavailable } = useCart();
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close only when the route changes
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/50" onClick={closeDrawer} aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="rise-in absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-ink/15 px-5 py-4">
          <h2 className="font-display text-3xl">Your cart</h2>
          <button ref={closeRef} type="button" onClick={closeDrawer} aria-label="Close cart" className="inline-flex size-11 items-center justify-center hover:text-plum">
            <X className="size-6" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-start gap-5 p-5">
            <p className="text-lg">Your cart is empty.</p>
            <Link href="/books" className="btn-primary">Browse books</Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
            <div className="px-5 pt-4 empty:hidden"><CartNotices /></div>
            <ul className="px-5">
              {items.map((item) => (
                <li key={item.bookId} className="flex gap-4 border-b border-ink/15 py-5">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="aspect-[2/3] w-16 object-cover shadow-book" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={`/books/${item.slug}`} className="font-display text-xl leading-tight hover:text-plum">{item.title}</Link>
                    <p className="mt-1 text-[0.95rem]">{item.unavailable ? <strong>{item.stock === 0 ? "Out of stock" : "No longer available"}</strong> : formatPrice(item.price)}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      {item.unavailable ? <span /> : <QuantityStepper
                        label={`Quantity for ${item.title}`}
                        value={item.quantity}
                        max={Math.min(item.stock, MAX_QTY_PER_BOOK)}
                        onChange={(n) => setQuantity(item.bookId, n)}
                      />}
                      <button type="button" className="site-link min-h-11" onClick={() => remove(item.bookId)} aria-label={`Remove ${item.title}`}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            </div>
            <div className="flex flex-col gap-4 border-t border-ink/15 p-5">
              <ShippingProgress subtotal={subtotal} freeShippingAbove={freeShippingAbove} />
              <p className="flex justify-between font-display text-2xl"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></p>
              <p className="text-[0.9rem] text-ink/70">Shipping is calculated at checkout. Limit: {MAX_QTY_PER_BOOK} copies per book.</p>
              {hasUnavailable ? <p role="alert" className="border-l-4 border-plum pl-3 text-[0.95rem]">Remove unavailable items to check out.</p> : <Link href="/checkout" className="btn-primary">Checkout</Link>}
              <Link href="/cart" className="btn-ghost">View full cart</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
