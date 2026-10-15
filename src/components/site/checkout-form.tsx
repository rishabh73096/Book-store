"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/site/cart-provider";
import { shippingFor } from "@/components/site/cart-view";
import { startCheckout, verifyPayment } from "@/services/order.service";
import { ApiError } from "@/services/api";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, cb: () => void) => void;
    };
  }
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const AUTOCOMPLETE = {
  name: "name", email: "email", phone: "tel", address: "street-address",
  city: "address-level2", state: "address-level1", pincode: "postal-code",
} as const;

const PLACEHOLDER = {
  name: "e.g. Anita Sharma", email: "you@example.com", phone: "e.g. 98765 43210",
  address: "House no., street, area, landmark", city: "e.g. Jaipur", state: "", pincode: "6-digit pincode",
} as const;

const EMPTY = { name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" };
const ADDRESS_KEY = "book-store-address";

type Errors = Partial<Record<keyof typeof EMPTY, string>>;

function validate(v: typeof EMPTY): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Please enter a valid email address.";
  if (!/^\+?[\d\s()-]{10,15}$/.test(v.phone.trim())) e.phone = "Please enter a valid 10-digit phone number.";
  if (v.address.trim().length < 5) e.address = "Please enter your full address.";
  if (v.city.trim().length < 2) e.city = "Please enter your city.";
  if (!v.state) e.state = "Please choose your state.";
  if (!/^\d{6}$/.test(v.pincode.trim())) e.pincode = "Pincode must be exactly 6 digits.";
  return e;
}

export function CheckoutForm({ shippingCharge, freeShippingAbove }: { shippingCharge: number; freeShippingAbove: number }) {
  const router = useRouter();
  const { items, subtotal, ready, clear } = useCart();
  const [step, setStep] = useState<"delivery" | "pay">("delivery");
  const [customer, setCustomer] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADDRESS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate saved address after mount
      if (saved) setCustomer({ ...EMPTY, ...JSON.parse(saved) });
    } catch {
      // ignore unreadable saved address
    }
  }, []);

  if (!ready) return <p aria-busy="true">Loading…</p>;
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-5">
        <p className="font-display text-3xl">Your cart is empty.</p>
        <Link href="/books" className="btn-primary">Browse books</Link>
      </div>
    );
  }

  const shipping = shippingFor(subtotal, shippingCharge, freeShippingAbove);
  const total = subtotal + shipping;

  function update(key: keyof typeof EMPTY, raw: string) {
    const value = key === "pincode" ? raw.replace(/\D/g, "") : raw;
    setCustomer((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function field(key: keyof typeof EMPTY, label: string, type = "text") {
    const common = {
      id: `co-${key}`,
      autoComplete: AUTOCOMPLETE[key],
      value: customer[key],
      "aria-invalid": !!errors[key],
      "aria-describedby": errors[key] ? `co-${key}-err` : undefined,
      className: "site-input",
    };
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={`co-${key}`} className="t-meta">{label}</label>
        {key === "state" ? (
          <select {...common} onChange={(e) => update(key, e.target.value)}>
            <option value="">Select state</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : key === "address" ? (
          <textarea {...common} rows={3} maxLength={300} placeholder={PLACEHOLDER[key]} onChange={(e) => update(key, e.target.value)} />
        ) : (
          <input
            {...common}
            type={type}
            inputMode={key === "pincode" ? "numeric" : key === "phone" ? "tel" : undefined}
            maxLength={key === "pincode" ? 6 : key === "email" ? 254 : 100}
            placeholder={PLACEHOLDER[key]}
            onChange={(e) => update(key, e.target.value)}
          />
        )}
        {errors[key] && <p id={`co-${key}-err`} className="border-l-2 border-clay pl-3 text-[0.95rem]">{errors[key]}</p>}
      </div>
    );
  }

  function continueToPay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const found = validate(customer);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setError("Please fix the highlighted fields.");
      return;
    }
    try {
      localStorage.setItem(ADDRESS_KEY, JSON.stringify(customer));
    } catch {
      // address just won't be remembered
    }
    setStep("pay");
    window.scrollTo({ top: 0 });
  }

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      if (!(await loadRazorpay()) || !window.Razorpay) {
        throw new Error("Could not load the payment window. Check your connection and retry.");
      }
      const session = await startCheckout({
        items: items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
        customer,
      });

      const summary = { items: items.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })), shipping, total, customer };

      const rzp = new window.Razorpay({
        key: session.keyId,
        amount: session.amount,
        currency: session.currency,
        order_id: session.razorpayOrderId,
        name: "Book Store",
        description: `Order ${session.orderNumber}`,
        prefill: { name: customer.name, email: customer.email, contact: customer.phone },
        handler: async (response) => {
          try {
            const result = await verifyPayment(response);
            try {
              sessionStorage.setItem("book-store-last-order", JSON.stringify({ orderNumber: result.orderNumber, ...summary }));
            } catch {
              // success page falls back to just the order number
            }
            clear();
            router.push(`/order-success?order=${result.orderNumber}`);
          } catch (err) {
            setError(`Payment received but confirmation failed (${err instanceof Error ? err.message : "error"}). Please contact us with order ${session.orderNumber}.`);
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on("payment.failed", () => {
        setError("Payment failed. You can try again.");
        setBusy(false);
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  const steps = [["Cart", "/cart"], ["Delivery", ""], ["Payment", ""]] as const;
  const current = step === "delivery" ? 1 : 2;

  return (
    <div className="flex flex-col gap-10">
      <ol className="t-meta flex flex-wrap gap-x-6 gap-y-2" aria-label="Checkout steps">
        {steps.map(([label, href], i) => (
          <li key={label} aria-current={i === current ? "step" : undefined} className={cn("flex items-center gap-2 border-b pb-1", i === current ? "border-plum text-plum" : "border-transparent text-ink/60")}>
            <span aria-hidden>{String(i + 1).padStart(2, "0")}</span>
            {href && i < current ? <Link href={href} className="site-link">{label}</Link> : label}
          </li>
        ))}
      </ol>

      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          {step === "delivery" ? (
            <form onSubmit={continueToPay} noValidate className="flex flex-col gap-5">
              <h2 className="t-h3">Delivery details</h2>
              {field("name", "Full name")}
              <div className="grid gap-5 sm:grid-cols-2">
                {field("email", "Email", "email")}
                {field("phone", "Phone", "tel")}
              </div>
              {field("address", "Address")}
              <div className="grid gap-5 sm:grid-cols-2">
                {field("city", "City")}
                {field("pincode", "Pincode")}
              </div>
              {field("state", "State")}
              {error && <p role="alert" className="border-l-2 border-clay pl-3">{error}</p>}
              <div className="flex flex-wrap gap-3">
                <Link href="/cart" className="btn-ghost">Back to cart</Link>
                <button type="submit" className="btn-primary">Continue to payment</button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-6">
              <h2 className="t-h3">Review &amp; pay</h2>
              <div className="zine-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <p className="t-meta text-ink/70">Deliver to</p>
                  <button type="button" className="site-link min-h-8" onClick={() => setStep("delivery")}>Edit</button>
                </div>
                <address className="mt-3 not-italic">
                  <strong>{customer.name}</strong><br />
                  {customer.address}<br />
                  {customer.city}, {customer.state} – {customer.pincode}<br />
                  {customer.phone} · {customer.email}
                </address>
              </div>
              {error && <p role="alert" className="border-l-2 border-clay pl-3">{error}</p>}
              <div>
                <button type="button" disabled={busy} className="btn-primary" onClick={pay}>
                  {busy ? "Please wait…" : `Pay ${formatPrice(total)} securely`}
                </button>
                <p className="mt-3 text-[0.95rem] text-ink/70">You&apos;ll complete payment in Razorpay&apos;s secure window (UPI, cards, netbanking).</p>
              </div>
            </div>
          )}
        </div>

        <aside aria-label="Order summary" className="h-fit zine-card p-6 md:col-span-4 md:col-start-9">
          <h2 className="t-meta text-ink/70">Order summary</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.bookId} className="flex justify-between gap-4">
                <span>{item.title} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-ink/15 pt-3"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></p>
          <p className="flex justify-between font-display text-2xl"><span>Total</span><span>{formatPrice(total)}</span></p>
        </aside>
      </div>
    </div>
  );
}
