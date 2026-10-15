import type { Metadata } from "next";
import Link from "next/link";
import { OrderSummaryCard } from "@/components/site/order-summary-card";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return (
    <div className="container-site py-20 md:py-32">
      <h1 className="t-hero max-w-4xl">Thank you. <em className="text-plum">Your order is in.</em></h1>
      {order && <p className="mt-8 text-lg">Order number: <strong>{order}</strong></p>}
      <p className="measure mt-4">Your payment was verified. Keep this number if you need to reach out about your order.</p>
      <OrderSummaryCard orderNumber={order} />
      <p className="mt-10"><Link href="/books" className="btn-primary">Continue browsing</Link></p>
    </div>
  );
}
