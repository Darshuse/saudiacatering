import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate, estateTypeLabel, estateStatusLabel } from "@/lib/utils";
import { ACTIVITY_LABELS } from "@/lib/audit";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DocumentsCard } from "@/components/estate/documents-card";
import { ArchiveButton } from "@/components/estate/archive-button";

export default async function EstateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return null;

  const { id } = await params;
  // Totals must come from aggregates over ALL incomes — the estate query
  // below fetches only the 5 most recent for display.
  const [estate, incomeAgg, myDistAgg, expenseAgg, activity] = await Promise.all([
    prisma.estate.findUnique({
    where: { id },
    include: {
      admin: { select: { id: true, name: true } },
      heirShares: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { sharePercentage: "desc" },
      },
      rentalIncomes: {
        include: { distributions: { include: { user: { select: { id: true, name: true } } } } },
        orderBy: { date: "desc" },
        take: 5,
      },
      proposals: {
        include: {
          createdBy: { select: { name: true } },
          _count: { select: { votes: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    }),
    prisma.rentalIncome.aggregate({ where: { estateId: id }, _sum: { amount: true } }),
    prisma.distribution.aggregate({
      where: { rentalIncome: { estateId: id }, userId: session.userId },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({ where: { estateId: id }, _sum: { amount: true } }),
    prisma.activityLog.findMany({
      where: { estateId: id },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  if (!estate) notFound();

  const isAdmin = estate.adminId === session.userId;
  const myShare = estate.heirShares.find((h) => h.userId === session.userId);
  // Same 404 for outsiders as for missing estates — don't leak existence.
  if (!isAdmin && !myShare) notFound();
  const totalPct = estate.heirShares.reduce((s, h) => s + h.sharePercentage, 0);
  // Amounts are stored in halalas — convert for display.
  const totalIncome = (incomeAgg._sum.amount ?? 0) / 100;
  const myIncome = (myDistAgg._sum.amount ?? 0) / 100;
  const totalExpenses = (expenseAgg._sum.amount ?? 0) / 100;
  const netIncome = totalIncome - totalExpenses;

  const statusBadge = estate.status === "ACTIVE" ? "success" : estate.status === "SOLD" ? "gray" : "warning";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/estates" className="text-gray-400 hover:text-gray-600 mt-1 text-sm">← العقارات</Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{estate.name}</h1>
            <Badge variant={statusBadge}>{estateStatusLabel(estate.status)}</Badge>
            {isAdmin && <Badge variant="blue">أنت المدير</Badge>}
          </div>
          <p className="text-gray-500 mt-1">
            {estateTypeLabel(estate.type)} {estate.location ? `• ${estate.location}` : ""} {estate.area ? `• ${estate.area} م²` : ""}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {estate.value && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-blue-600 mb-1">القيمة التقديرية</p>
            <p className="text-xl font-bold text-blue-800">{formatCurrency(estate.value)}</p>
          </div>
        )}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-xs text-green-600 mb-1">صافي الإيرادات</p>
          <p className="text-xl font-bold text-green-800">{formatCurrency(netIncome)}</p>
          {totalExpenses > 0 && (
            <p className="text-[11px] text-green-600 mt-0.5">
              إيرادات {formatCurrency(totalIncome)} − مصروفات {formatCurrency(totalExpenses)}
            </p>
          )}
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs text-amber-600 mb-1">حصتي</p>
          <p className="text-xl font-bold text-amber-800">{myShare?.sharePercentage.toFixed(2) ?? 0}%</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-xs text-purple-600 mb-1">عائدي الإجمالي</p>
          <p className="text-xl font-bold text-purple-800">{formatCurrency(myIncome)}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heirs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">الورثة ({estate.heirShares.length})</h2>
            <Link href={`/estates/${id}/heirs`} className="text-sm text-blue-600 hover:underline">
              {isAdmin ? "إدارة" : "عرض"}
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {/* Progress */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>الحصص الموزعة</span>
                <span>{totalPct.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(totalPct, 100)}%` }} />
              </div>
            </div>
            {estate.heirShares.slice(0, 5).map((share) => (
              <div key={share.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                  {share.user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{share.user.name}</p>
                  {share.relation && <p className="text-xs text-gray-400">{share.relation}</p>}
                </div>
                <span className="text-sm font-bold text-blue-700">
                  {share.shareNumerator}/{share.shareDenominator}
                  <span className="text-xs font-normal text-gray-400 mr-1">({share.sharePercentage.toFixed(1)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Income */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">آخر الإيرادات</h2>
            <Link href={`/estates/${id}/income`} className="text-sm text-blue-600 hover:underline">عرض الكل</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {estate.rentalIncomes.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">لا توجد إيرادات بعد</p>
            ) : (
              estate.rentalIncomes.map((income) => (
                <div key={income.id} className="px-5 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{income.period}</p>
                      <p className="text-xs text-gray-400">{formatDate(income.date)}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-green-700">{formatCurrency(income.amount / 100)}</p>
                      <Badge variant={income.status === "DISTRIBUTED" ? "success" : "warning"} className="text-xs">
                        {income.status === "DISTRIBUTED" ? "موزع" : "معلق"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Proposals */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">المقترحات والتصويتات</h2>
            <Link href={`/estates/${id}/votes`} className="text-sm text-blue-600 hover:underline">عرض الكل</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {estate.proposals.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">لا توجد مقترحات بعد</p>
            ) : (
              estate.proposals.map((p) => {
                const statusColors: Record<string, string> = { OPEN: "success", CLOSED: "gray", APPROVED: "blue", REJECTED: "danger" };
                const statusLabels: Record<string, string> = { OPEN: "مفتوح", CLOSED: "مغلق", APPROVED: "معتمد", REJECTED: "مرفوض" };
                return (
                  <div key={p.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p._count.votes} صوت • حتى {formatDate(p.deadline)}</p>
                      </div>
                      <Badge variant={statusColors[p.status] as "success" | "gray" | "blue" | "danger"}>{statusLabels[p.status]}</Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Documents + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DocumentsCard estateId={id} isAdmin={isAdmin} />

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">📋 سجل النشاط</h2>
            <p className="text-xs text-gray-400 mt-0.5">من فعل ماذا ومتى — شفافية كاملة أمام كل الورثة</p>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {activity.length === 0 ? (
              <p className="px-5 py-5 text-sm text-gray-400 text-center">لا يوجد نشاط مسجّل بعد</p>
            ) : (
              activity.map((a) => (
                <div key={a.id} className="px-5 py-2.5">
                  <p className="text-sm text-gray-700">
                    <strong>{a.user.name}</strong> {ACTIVITY_LABELS[a.action] ?? a.action}
                    {a.meta && <span className="text-gray-400"> — {a.meta}</span>}
                  </p>
                  <p className="text-[11px] text-gray-400">{formatDate(a.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <Link href={`/estates/${id}/heirs`} className="bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors">
          👥 {isAdmin ? "إدارة الورثة" : "عرض الورثة"}
        </Link>
        <Link href={`/estates/${id}/income`} className="bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-800 transition-colors">
          💰 {isAdmin ? "تسجيل إيراد" : "عرض الإيرادات"}
        </Link>
        <Link href={`/estates/${id}/votes`} className="bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-800 transition-colors">
          🗳️ التصويتات
        </Link>
        {isAdmin && <ArchiveButton estateId={id} archived={estate.status === "ARCHIVED"} />}
      </div>
    </div>
  );
}
