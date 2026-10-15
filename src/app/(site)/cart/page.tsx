import type { Metadata } from "next";
import { CartView } from "@/components/site/cart-view";
import { getSiteSettings } from "@/lib/site-data";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default async function CartPage() {
  const { shippingCharge, freeShippingAbove } = await getSiteSettings();
  return (
    <div className="container-site py-12 md:py-20">
      <h1 className="t-h1 mb-12">Your cart</h1>
      <CartView shippingCharge={shippingCharge} freeShippingAbove={freeShippingAbove} />
    </div>
  );
}
