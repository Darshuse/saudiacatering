import { prisma } from "@/lib/db";

/**
 * Normalize a Saudi phone number to international wa.me format (no +).
 * "0501234567" → "966501234567", "501234567" → "966501234567",
 * "+9665..." / "009665..." / "9665..." → "9665...".
 */
export function toWhatsAppNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("966")) return digits;
  if (digits.startsWith("05") && digits.length === 10) return "966" + digits.slice(1);
  if (digits.startsWith("5") && digits.length === 9) return "966" + digits;
  return digits;
}

/**
 * The support WhatsApp number shown on public pages:
 * WHATSAPP_NUMBER env var wins; otherwise the phone of the oldest
 * registered user who provided one (the platform owner's account).
 */
export async function getSupportWhatsApp(): Promise<string | null> {
  if (process.env.WHATSAPP_NUMBER) return toWhatsAppNumber(process.env.WHATSAPP_NUMBER);
  try {
    const owner = await prisma.user.findFirst({
      where: { phone: { not: null } },
      orderBy: { createdAt: "asc" },
      select: { phone: true },
    });
    return owner?.phone ? toWhatsAppNumber(owner.phone) : null;
  } catch {
    // DB not ready (e.g. build time) — hide the button rather than crash.
    return null;
  }
}
