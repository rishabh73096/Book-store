"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="site flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="t-meta">Something went wrong</p>
      <h1 className="t-h1 max-w-2xl">We couldn&apos;t load this page.</h1>
      <p className="measure text-lg">It&apos;s probably a temporary problem. Please try again in a moment.</p>
      <div className="flex flex-wrap justify-center gap-4">
        <button type="button" onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="btn-ghost">Back to home</Link>
      </div>
    </div>
  );
}
