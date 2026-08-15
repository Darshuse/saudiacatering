import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatHalalas } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { PrintButton } from "@/components/ui/print-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StatementPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [shares, distributions] = await Promise.all([
    prisma.heirShare.findMany({
      where: { userId: session.userId },
      include: { estate: { select: { id: true, name: true } } },
    }),
    prisma.distribution.findMany({
      where: { userId: session.userId },
      include: {
        rentalIncome: {
          select: { period: true, date: true, estate: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalDue = distributions.reduce((s, d) => s + d.amount, 0);
  const totalPaid = distributions.filter((d) => d.status === "PAID").reduce((s, d) => s + d.amount, 0);
  const totalPending = totalDue - totalPaid;

  // Per-estate rollup
  const byEstate = shares.map((share) => {
    const dists = distributions.filter((d) => d.rentalIncome.estate.id === share.estate.id);
    const due = dists.reduce((s, d) => s + d.amount, 0);
    const paid = dists.filter((d) => d.status === "PAID").reduce((s, d) => s + d.amount, 0);
    return { share, due, paid, pending: due - paid };
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">كشف حسابي</h1>
          <p className="text-gray-500 mt-1">نصيبك ومستحقاتك عبر كل التركات — في صفحة واحدة</p>
        </div>
        <PrintButton />
      </div>

      {/* Print-only header */}
      <div className="hidden print:block border-b border-gray-300 pb-3">
        <p className="font-bold text-lg">⚖️ منصة الورثة — كشف حساب الوريث</p>
        <p className="text-sm text-gray-600">{session.name} • {formatDate(new Date())}</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <p className="text-xs text-blue-600 mb-1">إجمالي المستحق لي</p>
          <p className="text-2xl font-bold text-blue-800">{formatHalalas(totalDue)}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-5">
          <p className="text-xs text-green-600 mb-1">المدفوع ✓</p>
          <p className="text-2xl font-bold text-green-800">{formatHalalas(totalPaid)}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
          <p className="text-xs text-amber-600 mb-1">المتبقي لي</p>
          <p className="text-2xl font-bold text-amber-800">{formatHalalas(totalPending)}</p>
        </div>
      </div>

      {/* Per-estate */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">حصصي في التركات ({shares.length})</h2>
        </div>
        {byEstate.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400">لست وريثاً بحصة في أي تركة بعد</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {byEstate.map(({ share, due, paid, pending }) => (
              <Link
                key={share.id}
                href={`/estates/${share.estate.id}/income`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors print:hover:bg-white"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{share.estate.name}</p>
                  <p className="text-sm text-gray-400">
                    حصتي: <strong className="text-blue-700">{share.shareNumerator}/{share.shareDenominator}</strong>
                    {" "}({share.sharePercentage.toFixed(2)}%){share.relation ? ` • ${share.relation}` : ""}
                  </p>
                </div>
                <div className="text-left text-sm">
                  <p className="font-bold text-gray-900">{formatHalalas(due)}</p>
                  <p className="text-xs">
                    <span className="text-green-600">✓ {formatHalalas(paid)}</span>
                    {pending > 0 && <span className="text-amber-600"> • متبقٍ {formatHalalas(pending)}</span>}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Payments timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">سجل الدفعات</h2>
        </div>
        {distributions.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400">لا توجد توزيعات بعد</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {distributions.map((d) => (
              <div key={d.id} className="px-6 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {d.rentalIncome.estate.name} — {d.rentalIncome.period}
                  </p>
                  <p className="text-xs text-gray-400">
                    {d.status === "PAID" && d.paidAt
                      ? `دُفع في ${formatDate(d.paidAt)}${d.paymentRef ? ` • مرجع: ${d.paymentRef}` : ""}`
                      : `استُحق في ${formatDate(d.rentalIncome.date)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-bold text-gray-900">{formatHalalas(d.amount)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === "PAID" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {d.status === "PAID" ? "✓ مدفوع" : "معلق"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print-only footer */}
      <div className="hidden print:block text-center text-xs text-gray-500 border-t border-gray-300 pt-3">
        صادر من منصة الورثة — waratha.app • هذا الكشف للاطلاع ولا يُعد مستنداً رسمياً
      </div>
    </div>
  );
}
