"use client";

import Link from "next/link";
import { useCart } from "@/components/site/cart-provider";
import { ShippingProgress } from "@/components/site/shipping-progress";
import { formatPrice } from "@/lib/format";

export function shippingFor(subtotal: number, shippingCharge: number, freeShippingAbove: number) {
  return freeShippingAbove > 0 && subtotal >= freeShippingAbove ? 0 : shippingCharge;
}

export function CartView({ shippingCharge, freeShippingAbove }: { shippingCharge: number; freeShippingAbove: number }) {
  const { items, subtotal, ready, setQuantity, remove } = useCart();

  if (!ready) return <p aria-busy="true">Loading your cart…</p>;
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-5">
        <p className="font-display text-3xl">Your cart is empty.</p>
        <Link href="/books" className="btn-primary">Browse books</Link>
      </div>
    );
  }

  const shipping = shippingFor(subtotal, shippingCharge, freeShippingAbove);

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <ul className="flex flex-col border-t border-ink/15 lg:col-span-8">
        {items.map((item) => (
          <li key={item.bookId} className="flex flex-wrap items-center gap-5 border-b border-ink/15 py-6">
            {item.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt="" className="aspect-[2/3] w-16 object-cover shadow-book" />
            )}
            <div className="min-w-44 flex-1">
              <Link href={`/books/${item.slug}`} className="t-h3 hover:text-plum">{item.title}</Link>
              <p className="mt-1">{formatPrice(item.price)}</p>
            </div>
            <label className="flex flex-col gap-1">
              <span className="t-meta">Qty</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={item.stock}
                value={item.quantity}
                onChange={(e) => setQuantity(item.bookId, Number(e.target.value) || 1)}
                className="site-input w-20"
              />
            </label>
            <span className="w-24 text-right font-display text-2xl">{formatPrice(item.price * item.quantity)}</span>
            <button type="button" className="site-link min-h-11" onClick={() => remove(item.bookId)} aria-label={`Remove ${item.title}`}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <aside className="h-fit zine-card p-6 lg:col-span-4" aria-label="Order summary">
        <h2 className="t-meta text-ink/75">Summary</h2>
        <div className="mt-4"><ShippingProgress subtotal={subtotal} freeShippingAbove={freeShippingAbove} /></div>
        <dl className="mt-4 flex flex-col gap-2">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
          <div className="flex justify-between border-t border-ink/15 pt-3 font-display text-2xl"><dt>Total</dt><dd>{formatPrice(subtotal + shipping)}</dd></div>
        </dl>
        <Link href="/checkout" className="btn-primary mt-6 w-full">Proceed to checkout</Link>
      </aside>
    </div>
  );
}
