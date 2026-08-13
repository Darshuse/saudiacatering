import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireEstateAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("بريد غير صالح"),
  shareNumerator: z.number().int().positive(),
  shareDenominator: z.number().int().positive(),
  relation: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id: estateId } = await params;

  const estate = await prisma.estate.findUnique({ where: { id: estateId } });
  if (!estate || estate.adminId !== session.userId) {
    return NextResponse.json({ error: "غير مصرح — فقط مدير العقار يمكنه إضافة ورثة" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Find or invite user
    let user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      const bcrypt = await import("bcryptjs");
      const tempPassword = await bcrypt.hash("Wiratha@2024", 10);
      user = await prisma.user.create({
        data: {
          name: data.email.split("@")[0],
          email: data.email,
          password: tempPassword,
          role: "HEIR",
        },
      });
    }

    const sharePercentage = (data.shareNumerator / data.shareDenominator) * 100;

    // Check total doesn't exceed 100%
    const existing = await prisma.heirShare.findMany({ where: { estateId } });
    const currentTotal = existing.reduce((s, h) => s + h.sharePercentage, 0);
    if (currentTotal + sharePercentage > 100.01) {
      return NextResponse.json({
        error: `مجموع الحصص سيتجاوز 100% — المتبقي: ${(100 - currentTotal).toFixed(2)}%`,
      }, { status: 400 });
    }

    const share = await prisma.heirShare.upsert({
      where: { estateId_userId: { estateId, userId: user.id } },
      update: { shareNumerator: data.shareNumerator, shareDenominator: data.shareDenominator, sharePercentage, relation: data.relation },
      create: { estateId, userId: user.id, shareNumerator: data.shareNumerator, shareDenominator: data.shareDenominator, sharePercentage, relation: data.relation },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ share }, { status: 201 });
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
    await prisma.heirShare.delete({ where: { estateId_userId: { estateId, userId } } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "خطأ في البيانات" }, { status: 400 });
    return NextResponse.json({ error: "الوريث غير موجود" }, { status: 404 });
  }
}
