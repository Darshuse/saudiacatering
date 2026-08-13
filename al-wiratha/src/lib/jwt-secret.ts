const raw = process.env.JWT_SECRET;

if (!raw && process.env.NODE_ENV === "production") {
  // Fail fast at module load: the app must never boot with a forgeable secret.
  throw new Error("FATAL: JWT_SECRET is not set. Refusing to start in production.");
}

// Dev-only fallback — never reached in production (guarded above).
// Must be a fixed constant: proxy.ts and auth.ts are separate bundles in
// Next.js 16, so a random per-process value would desync them.
export const JWT_SECRET = new TextEncoder().encode(raw ?? "dev-only-insecure-secret");
