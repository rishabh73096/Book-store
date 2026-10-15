"use client";

import { useCart, type CartItem } from "@/components/site/cart-provider";
import { formatPrice } from "@/lib/format";

// Mobile-only purchase bar pinned to the bottom of the book page.
export function StickyBuyBar({ book }: { book: Omit<CartItem, "quantity"> }) {
  const { add } = useCart();
  if (book.stock <= 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-ink/15 bg-paper px-5 py-3 md:hidden">
      <div className="min-w-0">
        <p className="truncate font-display text-lg leading-tight">{book.title}</p>
        <p className="text-[0.95rem]">{formatPrice(book.price)}</p>
      </div>
      <button type="button" className="btn-primary shrink-0" onClick={() => add(book, 1)}>
        Add to cart
      </button>
    </div>
  );
}
