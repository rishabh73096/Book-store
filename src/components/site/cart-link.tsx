"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/site/cart-provider";

export function CartLink() {
  const { count, ready, openDrawer } = useCart();
  const n = ready ? count : 0;
  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-haspopup="dialog"
      aria-label={`Open cart, ${n} ${n === 1 ? "item" : "items"}`}
      className="relative inline-flex min-h-11 items-center gap-2 hover:text-plum"
    >
      <ShoppingBag className="size-5" aria-hidden />
      <span aria-hidden>Cart</span>
      {n > 0 && (
        <span aria-hidden className="inline-flex min-w-5 items-center justify-center bg-plum px-1.5 text-[0.7rem] leading-5 text-white">
          {n}
        </span>
      )}
    </button>
  );
}
