/**
 * In-memory sliding-window rate limiter.
 *
 * Limits: lives in process memory only — resets on restart/deploy and does
 * not coordinate across multiple instances. Sufficient for a single-instance
 * deployment; swap for Redis/Upstash before scaling out.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 10_000) buckets.clear(); // crude memory cap
  return true;
}
