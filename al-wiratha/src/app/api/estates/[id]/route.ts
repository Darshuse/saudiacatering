import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireEstateMember, requireEstateAdmin } from "@/lib/authz";
import { closeExpiredProposals } from "@/lib/proposals";
import { logActivity } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const access = await requireEstateMember(id, session.userId);
  if (access instanceof NextResponse) return access;

  await closeExpiredProposals({ estateId: id });

  const estate = await prisma.estate.findUnique({
    where: { id },
    include: {
      admin: { select: { id: true, name: true, email: true } },
      heirShares: {
        include: { user: { select: { id: true, name: true, email: true, phone: true } } },
        orderBy: { sharePercentage: "desc" },
      },
      rentalIncomes: {
        include: {
          distributions: { include: { user: { select: { id: true, name: true } } } },
        },
        orderBy: { date: "desc" },
        take: 10,
      },
      proposals: {
        include: {
          createdBy: { select: { id: true, name: true } },
          votes: { include: { user: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!estate) return NextResponse.json({ error: "العقار غير موجود" }, { status: 404 });
  return NextResponse.json({ estate });
}

const updateSchema = z
  .object({
    name: z.string().min(2).optional(),
    type: z.enum(["APARTMENT", "VILLA", "LAND", "COMMERCIAL", "FARM", "OTHER"]).optional(),
    description: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    area: z.number().positive().nullable().optional(),
    value: z.number().nonnegative().nullable().optional(),
    status: z.enum(["ACTIVE", "SOLD", "DISPUTED"]).optional(),
  })
  .strict(); // rejects adminId, nested writes, and any unknown key

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const access = await requireEstateAdmin(id, session.userId);
  if (access instanceof NextResponse) return access;

  try {
    const data = updateSchema.parse(await req.json());
    const estate = await prisma.estate.update({ where: { id }, data });
    logActivity(id, session.userId, "estate_updated");
    return NextResponse.json({ estate });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "خطأ في البيانات" }, { status: 400 });
    }
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

/** DELETE — soft archive (admin only). Financial history is never destroyed. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const access = await requireEstateAdmin(id, session.userId);
  if (access instanceof NextResponse) return access;

  const current = await prisma.estate.findUnique({ where: { id }, select: { status: true } });
  if (!current) return NextResponse.json({ error: "العقار غير موجود" }, { status: 404 });

  const archiving = current.status !== "ARCHIVED";
  const estate = await prisma.estate.update({
    where: { id },
    data: { status: archiving ? "ARCHIVED" : "ACTIVE" },
  });
  logActivity(id, session.userId, archiving ? "estate_archived" : "estate_restored");
  return NextResponse.json({ estate });
}
