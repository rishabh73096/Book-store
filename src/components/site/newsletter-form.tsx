"use client";

import { useId, useState } from "react";
import { apiRequest, ApiError } from "@/services/api";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterForm({ tone = "light" }: { tone?: "light" | "dark" }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await apiRequest("/newsletter", { method: "POST", body: { email: value } });
      setDone(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p role="status" className="font-display text-3xl">
        Thank you — you&apos;re on the list.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
      <label htmlFor={id} className="t-meta">
        Email address
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={id}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="site-input text-ink sm:max-w-sm"
        />
        <button type="submit" disabled={busy} className={tone === "dark" ? "btn-ghost" : "btn-primary"}>
          {busy ? "Joining…" : "Join the list"}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="border-l-2 border-clay pl-3 text-[0.95rem]">
          {error}
        </p>
      )}
    </form>
  );
}
