import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

// Funnel events only — a fixed allowlist keeps the table meaningful and abuse-proof.
const schema = z
  .object({
    name: z.enum([
      "visit_landing",
      "visit_calculator",
      "calc_result",
      "share_result",
      "print_result",
      "cta_save_draft",
      "register_view",
    ]),
    path: z.string().max(200).optional(),
    visitorId: z.string().max(64).optional(),
    meta: z.string().max(500).optional(),
  })
  .strict();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`track:${ip}`, 60, 60_000)) {
    return new NextResponse(null, { status: 429 });
  }

  try {
    const data = schema.parse(await req.json());
    await prisma.analyticsEvent.create({ data });
  } catch {
    // Analytics must never break the visitor's experience — swallow and move on.
  }
  return new NextResponse(null, { status: 204 });
}
