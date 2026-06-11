import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["APARTMENT", "VILLA", "LAND", "COMMERCIAL", "FARM", "OTHER"]),
  description: z.string().optional(),
  location: z.string().optional(),
  area: z.number().optional(),
  value: z.number().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const estates = await prisma.estate.findMany({
    where: {
      OR: [
        { adminId: session.userId },
        { heirShares: { some: { userId: session.userId } } },
      ],
    },
    include: {
      admin: { select: { id: true, name: true } },
      heirShares: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      _count: { select: { rentalIncomes: true, proposals: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ estates });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const estate = await prisma.estate.create({
      data: { ...data, adminId: session.userId },
    });

    // Add admin as heir with 0% initially
    return NextResponse.json({ estate }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? "خطأ في البيانات" }, { status: 400 });
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
