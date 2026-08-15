import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

/**
 * Lazy-close: settle OPEN proposals whose deadline has passed, using the
 * votes actually cast. Called from read paths so "مفتوح إلى الأبد" can't happen.
 *
 * سياسة الحسم المعلنة: الأعلى وزناً يفوز — التعادل أو غياب الأصوات = مغلق دون حسم (CLOSED).
 */
export async function closeExpiredProposals(where: Prisma.ProposalWhereInput) {
  const expired = await prisma.proposal.findMany({
    where: { ...where, status: "OPEN", deadline: { lt: new Date() } },
    include: { votes: true },
  });

  for (const p of expired) {
    const yes = p.votes.filter((v) => v.choice === "YES").reduce((s, v) => s + v.weight, 0);
    const no = p.votes.filter((v) => v.choice === "NO").reduce((s, v) => s + v.weight, 0);
    const status = yes > no ? "APPROVED" : no > yes ? "REJECTED" : "CLOSED";
    await prisma.proposal.update({ where: { id: p.id }, data: { status } });
  }
}
