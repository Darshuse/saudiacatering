import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireEstateMember } from "@/lib/authz";
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

  const access = await requireEstateMember(estateId, session.userId);
  if (access instanceof NextResponse) return access;
  // Voting is restricted to heirs holding an actual share — a share-less
  // admin observing the estate must not skew weighted results.
  if (!access.heirShare) {
    return NextResponse.json(
      { error: "التصويت متاح للورثة أصحاب الحصص فقط" },
      { status: 403 }
    );
  }

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

  const weight = access.heirShare.sharePercentage;

  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Atomic: the vote and the potential auto-close read the same snapshot.
    const vote = await prisma.$transaction(async (tx) => {
      const v = await tx.vote.upsert({
        where: { proposalId_userId: { proposalId, userId: session.userId } },
        update: { choice: data.choice, comment: data.comment, weight },
        create: { proposalId, userId: session.userId, choice: data.choice, comment: data.comment, weight },
        include: { user: { select: { id: true, name: true } } },
      });

      // All heirs voted → close early.
      // سياسة الحسم: الأعلى وزناً يفوز — التعادل = مغلق دون حسم (CLOSED).
      const totalHeirs = await tx.heirShare.count({ where: { estateId } });
      const totalVotes = await tx.vote.count({ where: { proposalId } });
      if (totalVotes >= totalHeirs) {
        const votes = await tx.vote.findMany({ where: { proposalId } });
        const yesWeight = votes.filter((x) => x.choice === "YES").reduce((s, x) => s + x.weight, 0);
        const noWeight = votes.filter((x) => x.choice === "NO").reduce((s, x) => s + x.weight, 0);
        await tx.proposal.update({
          where: { id: proposalId },
          data: { status: yesWeight > noWeight ? "APPROVED" : noWeight > yesWeight ? "REJECTED" : "CLOSED" },
        });
      }
      return v;
    });

    return NextResponse.json({ vote });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? "خطأ في البيانات" }, { status: 400 });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
