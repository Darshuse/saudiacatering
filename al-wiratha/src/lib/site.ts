/**
 * Canonical site URL. NEXT_PUBLIC_SITE_URL overrides when set;
 * production falls back to the official domain so SEO links never
 * silently point at localhost.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production" ? "https://waratha.app" : "http://localhost:3000")
).replace(/\/$/, "");
