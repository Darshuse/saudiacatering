import { prisma } from "@/lib/db";

/**
 * سجل النشاط — الحَكَم عند أول خلاف عائلي: من فعل ماذا ومتى.
 * Fire-and-forget: auditing must never break the action being audited.
 */
export function logActivity(estateId: string, userId: string, action: string, meta?: string) {
  prisma.activityLog.create({ data: { estateId, userId, action, meta } }).catch(() => {});
}

export const ACTIVITY_LABELS: Record<string, string> = {
  estate_created: "أنشأ التركة",
  estate_updated: "عدّل بيانات العقار",
  estate_archived: "أرشف العقار",
  estate_restored: "استعاد العقار من الأرشيف",
  heir_added: "أضاف/عدّل حصة وريث",
  heir_removed: "حذف وريثاً",
  invite_accepted: "فعّل حسابه وانضم للورثة",
  income_recorded: "سجّل إيراداً ووزّعه",
  expense_recorded: "سجّل مصروفاً",
  distribution_paid: "أكد تحويل مستحقات",
  distribution_unpaid: "تراجع عن تأكيد تحويل",
  proposal_created: "أنشأ مقترحاً",
  vote_cast: "صوّت على مقترح",
  document_uploaded: "رفع مستنداً",
  document_deleted: "حذف مستنداً",
};
