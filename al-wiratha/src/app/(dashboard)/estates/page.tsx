import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, estateTypeLabel, estateStatusLabel } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function EstatesPage() {
  const session = await getSession();
  if (!session) return null;

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
        include: { user: { select: { id: true, name: true } } },
      },
      _count: { select: { rentalIncomes: true, proposals: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusVariant = (s: string) => s === "ACTIVE" ? "success" : s === "SOLD" ? "gray" : "warning";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">العقارات والتركات</h1>
          <p className="text-gray-500 mt-1">إجمالي {estates.length} عقار/تركة</p>
        </div>
        <Link
          href="/estates/new"
          className="inline-flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors shadow-sm"
        >
          <span className="text-lg">+</span> إضافة عقار جديد
        </Link>
      </div>

      {estates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <p className="text-5xl mb-4">🏠</p>
          <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد عقارات بعد</h3>
          <p className="text-gray-400 mb-6">أضف أول عقار أو تركة لبدء التوزيع</p>
          <Link href="/estates/new" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800">
            إضافة عقار
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {estates.map((estate) => {
            const myShare = estate.heirShares.find((h) => h.userId === session.userId);
            const totalPct = estate.heirShares.reduce((s, h) => s + h.sharePercentage, 0);
            return (
              <Link key={estate.id} href={`/estates/${estate.id}`} className="block group">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{typeEmoji(estate.type)}</span>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-700">{estate.name}</h3>
                        <p className="text-sm text-gray-500">{estateTypeLabel(estate.type)}</p>
                      </div>
                    </div>
                    <Badge variant={statusVariant(estate.status)}>{estateStatusLabel(estate.status)}</Badge>
                  </div>

                  {estate.location && (
                    <p className="text-sm text-gray-500 mb-3">📍 {estate.location}</p>
                  )}

                  <div className="space-y-2 text-sm mb-4">
                    {estate.value && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">القيمة التقديرية</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(estate.value)}</span>
                      </div>
                    )}
                    {myShare && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">حصتي</span>
                        <span className="font-bold text-blue-700">{myShare.sharePercentage.toFixed(2)}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">الورثة</span>
                      <span className="text-gray-700">{estate.heirShares.length} وارث</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>توزيع الحصص</span>
                      <span>{totalPct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${Math.min(totalPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs text-gray-400 border-t border-gray-50 pt-3">
                    <span>💰 {estate._count.rentalIncomes} إيراد</span>
                    <span>🗳️ {estate._count.proposals} مقترح</span>
                    {estate.admin.id === session.userId && (
                      <span className="mr-auto text-blue-500">مدير</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function typeEmoji(type: string) {
  const map: Record<string, string> = { APARTMENT: "🏢", VILLA: "🏡", LAND: "🌍", COMMERCIAL: "🏪", FARM: "🌾", OTHER: "🏗️" };
  return map[type] ?? "🏠";
}
