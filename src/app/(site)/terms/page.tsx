import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of sale",
  description: "Terms for ordering books from this website.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="container-site py-12 md:py-20">
      <h1 className="t-h1">Terms of sale</h1>
      <div className="measure mt-10 flex flex-col gap-5">
        <p>Prices are shown in Indian rupees. An order is confirmed once payment is successfully verified.</p>
        <p>Delivery charges, if any, are shown at checkout before payment. Delivery times depend on your location and the courier.</p>
        <p>All text, images and book content on this website are the author&apos;s property and may not be reproduced without permission.</p>
      </div>
    </div>
  );
}
