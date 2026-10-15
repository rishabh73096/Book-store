import type { NextRequest } from "next/server";

// Small in-memory fixed-window limiter. Per server instance only — on serverless / multiple
// instances use a shared store (Redis/Upstash) for strict limits.
const buckets = new Map<string, { count: number; reset: number }>();

export function clientIp(req: NextRequest) {
  return (req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "local").trim();
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.reset <= now) buckets.delete(k);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true as const, retryAfter: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false as const, retryAfter: Math.ceil((bucket.reset - now) / 1000) };
  }
  return { ok: true as const, retryAfter: 0 };
}
