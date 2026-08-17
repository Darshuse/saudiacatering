import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/client-ip";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Per-email is the reliable throttle (can't be spoofed) and is the primary
    // defence against targeted brute-force. Per-IP only adds protection when a
    // trusted proxy gives us a real IP — otherwise a single shared bucket would
    // let a spoofer lock out everyone, so we skip it.
    const ip = clientIp(req);
    const emailLimited = !rateLimit(`login:email:${data.email}`, 10, 15 * 60_000);
    const ipLimited = ip !== "shared" && !rateLimit(`login:ip:${ip}`, 30, 60_000);
    if (emailLimited || ipLimited) {
      return NextResponse.json({ error: "محاولات كثيرة — حاول مرة أخرى بعد قليل" }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    await setSession({ userId: user.id, email: user.email, name: user.name, role: user.role });

    prisma.analyticsEvent
      .create({ data: { name: "login_success", userId: user.id, path: "/auth/login" } })
      .catch(() => {});

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "خطأ في البيانات" }, { status: 400 });
    }
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
