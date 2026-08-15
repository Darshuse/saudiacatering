import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireEstateAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

const INVITE_TTL_DAYS = 14;

const schema = z.object({
  email: z.string().email("بريد غير صالح"),
  name: z.string().min(2, "اسم الوريث مطلوب (حرفان على الأقل)").optional(),
  shareNumerator: z.number().int().positive(),
  shareDenominator: z.number().int().positive(),
  relation: z.string().optional(),
});

/** GET — admin only: pending invites so the UI can show activation state + copy links. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id: estateId } = await params;
  const access = await requireEstateAdmin(estateId, session.userId);
  if (access instanceof NextResponse) return access;

  const invites = await prisma.heirInvite.findMany({
    where: { estateId, acceptedAt: null, expiresAt: { gt: new Date() } },
    select: { userId: true, token: true, expiresAt: true },
  });
  return NextResponse.json({ invites });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id: estateId } = await params;
  const access = await requireEstateAdmin(estateId, session.userId);
  if (access instanceof NextResponse) return access;

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (!existingUser && !data.name) {
      return NextResponse.json({ error: "اسم الوريث مطلوب عند دعوة بريد جديد" }, { status: 400 });
    }

    const sharePercentage = (data.shareNumerator / data.shareDenominator) * 100;

    // Total check must EXCLUDE this user's existing share — upsert replaces it.
    const existing = await prisma.heirShare.findMany({ where: { estateId } });
    const currentTotal = existing
      .filter((h) => h.userId !== existingUser?.id)
      .reduce((s, h) => s + h.sharePercentage, 0);
    if (currentTotal + sharePercentage > 100.01) {
      return NextResponse.json({
        error: `مجموع الحصص سيتجاوز 100% — المتبقي: ${(100 - currentTotal).toFixed(2)}%`,
      }, { status: 400 });
    }

    // Unusable random password — the heir sets their own via the invite link.
    const bcrypt = await import("bcryptjs");
    const randomPassword = existingUser ? null : await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
    const newToken = existingUser ? null : crypto.randomBytes(32).toString("hex");

    // Atomic: user + invite + share succeed or fail together — no orphan accounts.
    const { share, inviteToken } = await prisma.$transaction(async (tx) => {
      let user = existingUser;
      let token: string | null = null;
      if (!user) {
        user = await tx.user.create({
          data: { name: data.name!, email: data.email, password: randomPassword!, role: "HEIR" },
        });
        token = newToken;
        await tx.heirInvite.create({
          data: {
            token: token!,
            userId: user.id,
            estateId,
            expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
          },
        });
      }
      const s = await tx.heirShare.upsert({
        where: { estateId_userId: { estateId, userId: user.id } },
        update: { shareNumerator: data.shareNumerator, shareDenominator: data.shareDenominator, sharePercentage, relation: data.relation },
        create: { estateId, userId: user.id, shareNumerator: data.shareNumerator, shareDenominator: data.shareDenominator, sharePercentage, relation: data.relation },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      return { share: s, inviteToken: token };
    });

    return NextResponse.json(
      {
        share,
        // Returned once to the admin — share it with the heir over WhatsApp.
        inviteToken,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? "خطأ في البيانات" }, { status: 400 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

const deleteSchema = z.object({ userId: z.string().min(1) });

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id: estateId } = await params;
  const access = await requireEstateAdmin(estateId, session.userId);
  if (access instanceof NextResponse) return access;

  try {
    const { userId } = deleteSchema.parse(await req.json());
    await prisma.$transaction([
      prisma.heirShare.delete({ where: { estateId_userId: { estateId, userId } } }),
      prisma.heirInvite.deleteMany({ where: { estateId, userId, acceptedAt: null } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "خطأ في البيانات" }, { status: 400 });
    return NextResponse.json({ error: "الوريث غير موجود" }, { status: 404 });
  }
}
