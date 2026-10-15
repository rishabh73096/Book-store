"use client";

import { useCart, type CartItem } from "@/components/site/cart-provider";

export function QuickAdd({ book }: { book: Omit<CartItem, "quantity"> }) {
  const { add } = useCart();
  if (book.stock <= 0) return <p className="mt-3 text-[0.95rem] text-ink/70">Out of stock</p>;
  return (
    <button type="button" className="btn-ghost mt-3 w-full" onClick={() => add(book, 1)} aria-label={`Add ${book.title} to cart`}>
      Add to cart
    </button>
  );
}
