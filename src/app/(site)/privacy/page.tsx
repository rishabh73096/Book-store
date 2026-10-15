import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How reader and customer information is collected and used.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const s = await getSiteSettings();
  return (
    <div className="container-site py-12 md:py-20">
      <h1 className="t-h1">Privacy policy</h1>
      <div className="measure mt-10 flex flex-col gap-5">
        <p>This website collects only what is needed to run the store: details you enter at checkout (name, email, phone, delivery address), messages sent through the contact form, and your email address if you join the newsletter.</p>
        <p>Payments are processed by Razorpay. Card and UPI details are entered on Razorpay&apos;s secure window and are never stored on this website.</p>
        <p>Your information is used to fulfil orders, reply to messages and, if you subscribed, send occasional news about new books. It is not sold. You can ask for your data to be deleted at any time{s.email ? <> by writing to {s.email}</> : " through the contact page"}.</p>
      </div>
    </div>
  );
}
