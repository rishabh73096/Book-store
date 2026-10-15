import { formatPrice } from "@/lib/format";

// "Add ₹X more for free shipping" — only rendered when the owner has set a free-shipping threshold.
export function ShippingProgress({ subtotal, freeShippingAbove }: { subtotal: number; freeShippingAbove: number }) {
  if (freeShippingAbove <= 0) return null;
  const remaining = freeShippingAbove - subtotal;
  const pct = Math.min(100, Math.round((subtotal / freeShippingAbove) * 100));
  return (
    <div>
      <p className="text-[0.95rem]">
        {remaining > 0 ? (
          <>Add <strong>{formatPrice(remaining)}</strong> more for free shipping.</>
        ) : (
          <strong>You&apos;ve unlocked free shipping.</strong>
        )}
      </p>
      <div className="mt-2 h-1 w-full bg-ink/15" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progress to free shipping">
        <div className="h-full bg-plum transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
