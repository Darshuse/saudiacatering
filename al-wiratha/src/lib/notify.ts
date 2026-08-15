import { prisma } from "@/lib/db";

/**
 * إشعارات داخل المنصة — fire-and-forget، لا تكسر العملية الأصلية أبداً.
 * `excludeUserId` يستثني منفّذ الحدث نفسه (لا أحد يحتاج إشعاراً بفعلته).
 */
export function notifyUsers(
  userIds: string[],
  title: string,
  href?: string,
  excludeUserId?: string
) {
  const targets = [...new Set(userIds)].filter((id) => id && id !== excludeUserId);
  if (targets.length === 0) return;
  prisma.notification
    .createMany({ data: targets.map((userId) => ({ userId, title, href })) })
    .catch(() => {});
}

/** كل أعضاء التركة (المدير + أصحاب الحصص). */
export async function estateMemberIds(estateId: string): Promise<string[]> {
  const estate = await prisma.estate.findUnique({
    where: { id: estateId },
    select: { adminId: true, heirShares: { select: { userId: true } } },
  });
  if (!estate) return [];
  return [estate.adminId, ...estate.heirShares.map((h) => h.userId)];
}
