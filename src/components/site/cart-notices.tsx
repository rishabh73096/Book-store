"use client";

import { useCart } from "@/components/site/cart-provider";

// Explains automatic cart changes (price moved, stock dropped, book withdrawn).
export function CartNotices() {
  const { notices, clearNotices } = useCart();
  if (notices.length === 0) return null;
  return (
    <div role="status" className="zine-card bg-clay p-4 text-[0.95rem]">
      <ul className="flex flex-col gap-1">
        {notices.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <button type="button" className="site-link mt-2 min-h-11" onClick={clearNotices}>
        Got it
      </button>
    </div>
  );
}
