"use client";

import { useState } from "react";
import { submitContact } from "@/services/contact.service";
import { ApiError } from "@/services/api";

const PLACEHOLDER = {
  firstName: "Your first name",
  lastName: "Your last name",
  email: "you@example.com",
  phone: "e.g. 98765 43210",
  message: "",
} as const;

const EMPTY = { firstName: "", lastName: "", email: "", phone: "", message: "" };

type Errors = Partial<Record<keyof typeof EMPTY, string>>;

function validate(v: typeof EMPTY): Errors {
  const e: Errors = {};
  if (v.firstName.trim().length < 2) e.firstName = "Please enter your first name.";
  if (v.lastName.trim().length < 2) e.lastName = "Please enter your last name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Please enter a valid email address.";
  if (!/^\+?[\d\s()-]{7,20}$/.test(v.phone.trim())) e.phone = "Please enter a valid phone number.";
  if (v.message.trim().length < 10) e.message = "Your message should be at least 10 characters.";
  return e;
}

export function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setStatus(null);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await submitContact(values);
      setValues(EMPTY);
      setStatus({ ok: true, text: "Thank you — your message has been sent. A reply will follow soon." });
    } catch (err) {
      setStatus({ ok: false, text: err instanceof ApiError ? err.message : "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  const field = (key: keyof typeof EMPTY, label: string, type = "text", autoComplete?: string) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={`c-${key}`} className="t-meta">{label}</label>
      <input
        id={`c-${key}`}
        type={type}
        autoComplete={autoComplete}
        placeholder={PLACEHOLDER[key]}
        maxLength={key === "email" ? 254 : key === "phone" ? 20 : 50}
        value={values[key]}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `c-${key}-err` : undefined}
        onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
        className="site-input"
      />
      {errors[key] && <p id={`c-${key}-err`} className="border-l-2 border-clay pl-3 text-[0.95rem]">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("firstName", "First name", "text", "given-name")}
        {field("lastName", "Last name", "text", "family-name")}
      </div>
      {field("email", "Email", "email", "email")}
      {field("phone", "Phone", "tel", "tel")}
      <div className="flex flex-col gap-1">
        <label htmlFor="c-message" className="t-meta">Message</label>
        <textarea
          id="c-message"
          rows={6}
          maxLength={1000}
          placeholder="Tell me what's on your mind (at least 10 characters)"
          value={values.message}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "c-message-err" : undefined}
          onChange={(e) => setValues((prev) => ({ ...prev, message: e.target.value }))}
          className="site-input"
        />
        {errors.message && <p id="c-message-err" className="border-l-2 border-clay pl-3 text-[0.95rem]">{errors.message}</p>}
      </div>
      {status && (
        <p role={status.ok ? "status" : "alert"} className={status.ok ? "border-l-2 border-sage pl-3" : "border-l-2 border-clay pl-3"}>
          {status.text}
        </p>
      )}
      <div>
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
