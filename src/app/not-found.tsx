import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="t-meta text-ink/70">404</p>
      <h1 className="t-h1">This page is missing from the book.</h1>
      <Link href="/" className="btn-primary">Back to home</Link>
    </div>
  );
}
