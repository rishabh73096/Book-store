"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QuantityStepper } from "@/components/site/quantity-stepper";
import { MAX_QTY_PER_BOOK } from "@/lib/limits";
import { useCart, type CartItem } from "@/components/site/cart-provider";

export function AddToCartButton({ book }: { book: Omit<CartItem, "quantity"> }) {
  const router = useRouter();
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const maxQty = Math.min(book.stock, MAX_QTY_PER_BOOK);

  if (book.stock <= 0) {
    return (
      <p role="status" className="border-l-2 border-clay pl-3">
        Currently out of stock.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <span className="t-meta">Quantity</span>
          <QuantityStepper label="Quantity" value={quantity} max={maxQty} onChange={setQuantity} />
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            add(book, quantity);
            setAdded(true);
          }}
        >
          Add to cart
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            add(book, quantity);
            router.push("/checkout");
          }}
        >
          Buy now
        </button>
      </div>
      <p className="text-[0.9rem] text-ink/70">Limit: {MAX_QTY_PER_BOOK} copies per book per order.</p>
      <p aria-live="polite" className="min-h-6 text-[0.95rem]">
        {added && (
          <>
            Added to your cart.{" "}
            <Link href="/cart" className="site-link">
              View cart
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
