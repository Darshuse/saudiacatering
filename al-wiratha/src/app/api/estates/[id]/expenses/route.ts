import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireEstateMember, requireEstateAdmin } from "@/lib/authz";
import { riyalsToHalalas } from "@/lib/money";
import { logActivity } from "@/lib/audit";
import { notifyUsers, estateMemberIds } from "@/lib/notify";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z
  .object({
    amount: z.number().positive("المبلغ يجب أن يكون موجباً"),
    category: z.enum(["صيانة", "زكاة", "رسوم حكومية", "أتعاب", "تأمين", "أخرى"]),
    description: z.string().max(300).optional(),
    date: z.string().refine((s) => !isNaN(Date.parse(s)), "تاريخ غير صالح"),
  })
  .strict();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id: estateId } = await params;
  const access = await requireEstateMember(estateId, session.userId);
  if (access instanceof NextResponse) return access;

  const expenses = await prisma.expense.findMany({
    where: { estateId },
    include: { createdBy: { select: { id: true, name: true } } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ expenses });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id: estateId } = await params;
  const access = await requireEstateAdmin(estateId, session.userId);
  if (access instanceof NextResponse) return access;

  try {
    const data = schema.parse(await req.json());
    const expense = await prisma.expense.create({
      data: {
        estateId,
        amount: riyalsToHalalas(data.amount),
        category: data.category,
        description: data.description,
        date: new Date(data.date),
        createdById: session.userId,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    logActivity(estateId, session.userId, "expense_recorded", `${data.category} — ${data.amount} ريال`);
    estateMemberIds(estateId).then((ids) =>
      notifyUsers(ids, `مصروف جديد (${data.category}) سُجّل على العقار`, `/estates/${estateId}/income`, session.userId)
    );

    return NextResponse.json({ expense }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? "خطأ في البيانات" }, { status: 400 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
