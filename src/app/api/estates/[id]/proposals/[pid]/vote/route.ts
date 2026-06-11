import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  choice: z.enum(["YES", "NO", "ABSTAIN"]),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; pid: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id: estateId, pid: proposalId } = await params;

  const proposal = await prisma.proposal.findUnique({ where: { id: proposalId } });
  if (!proposal || proposal.estateId !== estateId) {
    return NextResponse.json({ error: "المقترح غير موجود" }, { status: 404 });
  }
  if (proposal.status !== "OPEN") {
    return NextResponse.json({ error: "التصويت مغلق" }, { status: 400 });
  }
  if (new Date() > proposal.deadline) {
    return NextResponse.json({ error: "انتهت مدة التصويت" }, { status: 400 });
  }

  // Get voter's share weight
  const heirShare = await prisma.heirShare.findUnique({
    where: { estateId_userId: { estateId, userId: session.userId } },
  });
  const weight = heirShare?.sharePercentage ?? 1;

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const vote = await prisma.vote.upsert({
      where: { proposalId_userId: { proposalId, userId: session.userId } },
      update: { choice: data.choice, comment: data.comment, weight },
      create: { proposalId, userId: session.userId, choice: data.choice, comment: data.comment, weight },
      include: { user: { select: { id: true, name: true } } },
    });

    // Check if all heirs voted → auto-close if deadline passed
    const totalHeirs = await prisma.heirShare.count({ where: { estateId } });
    const totalVotes = await prisma.vote.count({ where: { proposalId } });
    if (totalVotes >= totalHeirs) {
      const votes = await prisma.vote.findMany({ where: { proposalId } });
      const yesWeight = votes.filter((v) => v.choice === "YES").reduce((s, v) => s + v.weight, 0);
      const noWeight = votes.filter((v) => v.choice === "NO").reduce((s, v) => s + v.weight, 0);
      await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: yesWeight > noWeight ? "APPROVED" : "REJECTED" },
      });
    }

    return NextResponse.json({ vote });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? "خطأ في البيانات" }, { status: 400 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
