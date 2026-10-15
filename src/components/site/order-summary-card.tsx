"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

type Summary = {
  orderNumber: string;
  items: { title: string; quantity: number; price: number }[];
  shipping: number;
  total: number;
  customer: { name: string; address: string; city: string; state: string; pincode: string; phone: string; email: string };
};

export function OrderSummaryCard({ orderNumber }: { orderNumber?: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("book-store-last-order");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Summary;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read the order saved by checkout after mount
      if (!orderNumber || parsed.orderNumber === orderNumber) setSummary(parsed);
    } catch {
      // nothing to show
    }
  }, [orderNumber]);

  if (!summary) return null;

  return (
    <div className="mt-10 grid max-w-3xl gap-8 zine-card p-6 sm:grid-cols-2">
      <div>
        <h2 className="t-meta text-ink/70">Delivering to</h2>
        <address className="mt-3 not-italic">
          <strong>{summary.customer.name}</strong><br />
          {summary.customer.address}<br />
          {summary.customer.city}, {summary.customer.state} – {summary.customer.pincode}<br />
          {summary.customer.phone}
        </address>
      </div>
      <div>
        <h2 className="t-meta text-ink/70">Your books</h2>
        <ul className="mt-3 flex flex-col gap-1">
          {summary.items.map((i, idx) => (
            <li key={idx} className="flex justify-between gap-4"><span>{i.title} × {i.quantity}</span><span>{formatPrice(i.price * i.quantity)}</span></li>
          ))}
          <li className="flex justify-between text-ink/70"><span>Shipping</span><span>{summary.shipping === 0 ? "Free" : formatPrice(summary.shipping)}</span></li>
          <li className="flex justify-between border-t border-ink/15 pt-2 font-display text-2xl"><span>Paid</span><span>{formatPrice(summary.total)}</span></li>
        </ul>
      </div>
    </div>
  );
}
