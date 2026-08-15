import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireEstateAdmin } from "@/lib/authz";
import { logActivity } from "@/lib/audit";
import { notifyUsers } from "@/lib/notify";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z
  .object({
    paid: z.boolean(),
    paymentRef: z.string().max(120).optional(),
  })
  .strict();

/** PATCH — admin marks a distribution as transferred (or reverts a mistake). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; did: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id: estateId, did } = await params;
  const access = await requireEstateAdmin(estateId, session.userId);
  if (access instanceof NextResponse) return access;

  try {
    const data = schema.parse(await req.json());

    // The distribution must belong to this estate — no cross-estate reach.
    const dist = await prisma.distribution.findUnique({
      where: { id: did },
      include: { rentalIncome: { select: { estateId: true } } },
    });
    if (!dist || dist.rentalIncome.estateId !== estateId) {
      return NextResponse.json({ error: "التوزيع غير موجود" }, { status: 404 });
    }

    const updated = await prisma.distribution.update({
      where: { id: did },
      data: data.paid
        ? { status: "PAID", paidAt: new Date(), paymentRef: data.paymentRef }
        : { status: "PENDING", paidAt: null, paymentRef: null },
      include: { user: { select: { id: true, name: true } } },
    });

    logActivity(estateId, session.userId, data.paid ? "distribution_paid" : "distribution_unpaid", updated.user.name);
    if (data.paid) {
      notifyUsers([updated.userId], "✓ تم تحويل مستحقاتك — اطّلع على كشف حسابك", "/statement", session.userId);
    }

    return NextResponse.json({ distribution: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "خطأ في البيانات" }, { status: 400 });
    }
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
