import type { NextRequest } from "next/server";

/**
 * Derive the client IP for rate-limiting.
 *
 * X-Forwarded-For is client-controllable, so it is trusted ONLY when the
 * deployment sits behind a known proxy that overwrites it — signalled by
 * TRUSTED_PROXY=true. Otherwise we ignore it (a spoofed header must not mint
 * a fresh rate-limit bucket) and fall back to a shared key, leaning on the
 * per-email/per-account limit as the real throttle.
 */
export function clientIp(req: NextRequest): string {
  if (process.env.TRUSTED_PROXY === "true") {
    const xff = req.headers.get("x-forwarded-for");
    const first = xff?.split(",")[0]?.trim();
    if (first) return first;
  }
  // Next.js doesn't expose the raw socket IP in route handlers; without a
  // trusted proxy we cannot attribute per-IP reliably, so use one bucket.
  return "shared";
}
