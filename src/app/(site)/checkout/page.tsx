import type { Metadata } from "next";
import { CheckoutForm } from "@/components/site/checkout-form";
import { getSiteSettings } from "@/lib/site-data";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const { shippingCharge, freeShippingAbove } = await getSiteSettings();
  return (
    <div className="container-site py-12 md:py-20">
      <h1 className="t-h1 mb-12">Checkout</h1>
      <CheckoutForm shippingCharge={shippingCharge} freeShippingAbove={freeShippingAbove} />
    </div>
  );
}
