import path from "path";

/** Directory for uploaded documents — a persistent volume in production. */
export function uploadsDir(): string {
  return process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");
}
