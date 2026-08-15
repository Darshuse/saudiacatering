import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/audit";
import { notifyUsers } from "@/lib/notify";
import bcrypt from "bcryptjs";
import { z } from "zod";

/** GET ?token= — validate an invite and return the heir's info for the form. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const invite = await prisma.heirInvite.findUnique({
    where: { token },
    include: {
      user: { select: { name: true, email: true } },
      estate: { select: { name: true } },
    },
  });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "الدعوة غير صالحة أو منتهية — اطلب رابطاً جديداً من مدير التركة" }, { status: 404 });
  }
  return NextResponse.json({
    name: invite.user.name,
    email: invite.user.email,
    estateName: invite.estate.name,
  });
}

const schema = z.object({
  token: z.string().min(32),
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`invite:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "محاولات كثيرة — حاول بعد قليل" }, { status: 429 });
  }

  try {
    const data = schema.parse(await req.json());

    const invite = await prisma.heirInvite.findUnique({
      where: { token: data.token },
      include: { user: true },
    });
    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "الدعوة غير صالحة أو منتهية" }, { status: 404 });
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: invite.userId },
        data: { name: data.name, password: hashed, phone: data.phone || undefined },
      }),
      prisma.heirInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    await setSession({ userId: user.id, email: user.email, name: user.name, role: user.role });

    logActivity(invite.estateId, user.id, "invite_accepted");
    const estate = await prisma.estate.findUnique({ where: { id: invite.estateId }, select: { adminId: true } });
    if (estate) {
      notifyUsers([estate.adminId], `✓ ${user.name} فعّل حسابه وانضم للورثة`, `/estates/${invite.estateId}/heirs`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "خطأ في البيانات" }, { status: 400 });
    }
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
