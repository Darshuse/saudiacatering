import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const EVENT_LABELS: Record<string, string> = {
  visit_landing: "زيارة الصفحة الرئيسية",
  visit_calculator: "زيارة الحاسبة",
  calc_result: "أجرى حساب مواريث",
  share_result: "شارك النتيجة",
  print_result: "طبع النتيجة",
  cta_save_draft: "ضغط «احفظ النتيجة وأنشئ التركة»",
  register_view: "فتح صفحة التسجيل",
  register_success: "أكمل التسجيل",
  login_success: "تسجيل دخول",
};

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  // Platform-wide analytics are for the platform owner (oldest account) only.
  const owner = await prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!owner || owner.id !== session.userId) {
    return (
      <div className="max-w-xl bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        <p className="text-3xl mb-2">🔒</p>
        <p>تقرير التحويل متاح لمالك المنصة فقط</p>
      </div>
    );
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [grouped, visitorRows] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ["name"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since }, name: { in: ["visit_landing", "visit_calculator"] }, visitorId: { not: null } },
      distinct: ["visitorId"],
      select: { visitorId: true },
    }),
  ]);

  const counts: Record<string, number> = {};
  for (const g of grouped) counts[g.name] = g._count._all;
  const get = (name: string) => counts[name] ?? 0;
  const uniqueVisitors = visitorRows.length;

  const registrations = get("register_success");
  const conversionRate = uniqueVisitors > 0 ? (registrations / uniqueVisitors) * 100 : 0;

  const funnel = [
    { label: "زيارة الحاسبة", value: get("visit_calculator") },
    { label: "أجرى حساباً", value: get("calc_result") },
    { label: "ضغط حفظ النتيجة", value: get("cta_save_draft") },
    { label: "فتح صفحة التسجيل", value: get("register_view") },
    { label: "أكمل التسجيل", value: registrations },
  ];
  const funnelMax = Math.max(funnel[0].value, 1);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">تقرير التحويل</h1>
        <p className="text-gray-500 mt-1">آخر 30 يوماً — تتبّع داخلي بدون أي خدمة خارجية</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <p className="text-xs text-blue-600 mb-1">زوار فريدون</p>
          <p className="text-3xl font-bold text-blue-800">{uniqueVisitors}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-5">
          <p className="text-xs text-green-600 mb-1">تسجيلات جديدة</p>
          <p className="text-3xl font-bold text-green-800">{registrations}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
          <p className="text-xs text-amber-600 mb-1">معدل التحويل</p>
          <p className="text-3xl font-bold text-amber-800">{conversionRate.toFixed(1)}%</p>
          <p className="text-xs text-amber-600 mt-1">الهدف: ≥ 3%</p>
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">قمع الحاسبة ← التسجيل</h2>
        <div className="space-y-3">
          {funnel.map((step, i) => {
            const pctOfTop = (step.value / funnelMax) * 100;
            const prev = i > 0 ? funnel[i - 1].value : null;
            const stepRate = prev && prev > 0 ? Math.round((step.value / prev) * 100) : null;
            return (
              <div key={step.label} className="flex items-center gap-3">
                <span className="w-44 text-sm text-gray-600 flex-shrink-0">{step.label}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-lg" style={{ width: `${Math.max(pctOfTop, step.value > 0 ? 3 : 0)}%` }} />
                </div>
                <span className="w-12 text-sm font-bold text-gray-900 text-left flex-shrink-0">{step.value}</span>
                <span className="w-14 text-xs text-gray-400 text-left flex-shrink-0">{stepRate !== null ? `${stepRate}%` : ""}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* All events */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">كل الأحداث</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {Object.entries(EVENT_LABELS).map(([name, label]) => (
            <div key={name} className="px-6 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">{label}</span>
              <span className="font-bold text-gray-900">{get(name)}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        الأرقام تُجمع محلياً في قاعدة بيانات المنصة (بدون كوكيز تتبع خارجية). زر مشاركة/طباعة النتيجة يقيس الانتشار داخل مجموعات العائلة.
      </p>
    </div>
  );
}
