import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireEstateMember, requireEstateAdmin } from "@/lib/authz";
import { riyalsToHalalas, distributeHalalas } from "@/lib/money";
import { logActivity } from "@/lib/audit";
import { notifyUsers } from "@/lib/notify";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z
  .object({
    amount: z.number().positive("المبلغ يجب أن يكون موجباً"),
    period: z.string().min(1, "الفترة مطلوبة"),
    date: z.string().refine((s) => !isNaN(Date.parse(s)), "تاريخ غير صالح"),
    description: z.string().optional(),
  })
  .strict();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id: estateId } = await params;
  const access = await requireEstateMember(estateId, session.userId);
  if (access instanceof NextResponse) return access;

  const incomes = await prisma.rentalIncome.findMany({
    where: { estateId },
    include: {
      distributions: {
        include: { user: { select: { id: true, name: true } } },
      },
      collectedBy: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ incomes });
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

    // Distribution requires the full sharia allocation — otherwise part of the
    // money silently belongs to no one.
    const heirShares = await prisma.heirShare.findMany({ where: { estateId } });
    const totalPct = heirShares.reduce((s, h) => s + h.sharePercentage, 0);
    if (heirShares.length === 0 || totalPct < 99.95) {
      return NextResponse.json({
        error: `لا يمكن تسجيل إيراد قبل اكتمال توزيع الحصص (100%) — الموزّع حالياً: ${totalPct.toFixed(2)}%`,
      }, { status: 400 });
    }

    // Exact money: halalas + largest-remainder over the sharia fractions —
    // the distributed sum always equals the income to the last halala.
    const totalHalalas = riyalsToHalalas(data.amount);
    const amounts = distributeHalalas(totalHalalas, heirShares);

    // Atomic: income + its distributions succeed or fail together.
    const income = await prisma.$transaction(async (tx) => {
      const created = await tx.rentalIncome.create({
        data: {
          estateId,
          amount: totalHalalas,
          period: data.period,
          date: new Date(data.date),
          description: data.description,
          collectedById: session.userId,
          status: "DISTRIBUTED",
        },
      });
      await tx.distribution.createMany({
        data: heirShares.map((share, i) => ({
          rentalIncomeId: created.id,
          userId: share.userId,
          amount: amounts[i],
          sharePercentage: share.sharePercentage,
          status: "PENDING" as const,
        })),
      });
      return created;
    });

    logActivity(estateId, session.userId, "income_recorded", `${data.period} — ${data.amount} ريال`);
    notifyUsers(
      heirShares.map((h) => h.userId),
      `إيراد جديد (${data.period}) وُزّع تلقائياً — اطّلع على نصيبك`,
      `/estates/${estateId}/income`,
      session.userId
    );

    return NextResponse.json({ income }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? "خطأ في البيانات" }, { status: 400 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
