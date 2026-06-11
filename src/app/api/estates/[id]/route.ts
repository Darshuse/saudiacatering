import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const estate = await prisma.estate.update({
    where: { id, adminId: session.userId },
    data: body,
  });

  return NextResponse.json({ estate });
}
