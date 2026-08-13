/** Canonical site URL — set NEXT_PUBLIC_SITE_URL in production (no trailing slash). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
