import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate, estateTypeLabel } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [estates, distributions, recentVotes] = await Promise.all([
    prisma.estate.findMany({
      where: {
        OR: [
          { adminId: session.userId },
          { heirShares: { some: { userId: session.userId } } },
        ],
      },
      include: {
        heirShares: true,
        _count: { select: { rentalIncomes: true } },
      },
    }),
    prisma.distribution.findMany({
      where: { userId: session.userId, status: "PENDING" },
      include: { rentalIncome: { include: { estate: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.proposal.findMany({
      where: {
        estate: {
          OR: [
            { adminId: session.userId },
            { heirShares: { some: { userId: session.userId } } },
          ],
        },
        status: "OPEN",
      },
      include: {
        estate: { select: { name: true } },
        votes: true,
        _count: { select: { votes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Onboarding progress — the first estate the user administers drives steps 2 & 3
  const adminEstates = estates.filter((e) => e.adminId === session.userId);
  const firstAdminEstate = adminEstates[0];
  const steps = [
    { done: estates.length > 0, label: "أضف أول عقار أو تركة", href: "/estates/new" },
    {
      done: adminEstates.some((e) => e.heirShares.length > 0) || (estates.length > 0 && adminEstates.length === 0),
      label: "أضف الورثة وحدد حصصهم الشرعية",
      href: firstAdminEstate ? `/estates/${firstAdminEstate.id}/heirs` : "/estates/new",
    },
    {
      done: estates.some((e) => e._count.rentalIncomes > 0),
      label: "سجّل أول إيراد إيجار ليتوزع تلقائياً",
      href: firstAdminEstate ? `/estates/${firstAdminEstate.id}/income` : "/estates/new",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const showOnboarding = doneCount < steps.length;
  const nextStepIndex = steps.findIndex((s) => !s.done);

  const totalEstateValue = estates.reduce((s, e) => s + (e.value ?? 0), 0);
  const myShare = estates.reduce((s, e) => {
    const share = e.heirShares.find((h) => h.userId === session.userId);
    return s + (e.value ?? 0) * ((share?.sharePercentage ?? 0) / 100);
  }, 0);
  const pendingAmount = distributions.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">مرحباً، {session.name} 👋</h1>
        <p className="text-gray-500 mt-1">لوحة تحكم منصة الورثة — إدارة التركات وفق الشريعة الإسلامية</p>
      </div>

      {/* Onboarding — a stressed new user needs to be told exactly what to do next */}
      {showOnboarding && (
        <div className="bg-gradient-to-l from-blue-900 to-blue-700 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div>
              <h2 className="text-lg font-bold">لنجهّز تركتك في 3 خطوات</h2>
              <p className="text-blue-200 text-sm mt-0.5">دقائق معدودة وتكون كل الحصص والإيرادات تحت السيطرة</p>
            </div>
            <span className="bg-white/15 text-sm font-bold px-3 py-1.5 rounded-full">
              {doneCount} من {steps.length}
            </span>
          </div>
          <div className="h-2 bg-white/15 rounded-full overflow-hidden mb-5">
            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
          </div>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <Link
                key={step.label}
                href={step.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                  step.done
                    ? "bg-white/5 text-blue-200"
                    : i === nextStepIndex
                      ? "bg-amber-500 hover:bg-amber-400 text-white font-bold shadow-md"
                      : "bg-white/10 hover:bg-white/15 text-white"
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${step.done ? "bg-green-500 text-white" : "bg-white/20"}`}>
                  {step.done ? "✓" : i + 1}
                </span>
                <span className={`text-sm ${step.done ? "line-through opacity-70" : ""}`}>{step.label}</span>
                {!step.done && i === nextStepIndex && <span className="mr-auto text-sm">ابدأ ←</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي العقارات"
          value={estates.length.toString()}
          suffix="عقار"
          icon="🏢"
          color="blue"
        />
        <StatCard
          title="قيمة التركة الكلية"
          value={formatCurrency(totalEstateValue)}
          icon="💰"
          color="green"
        />
        <StatCard
          title="حصتي في التركة"
          value={formatCurrency(myShare)}
          icon="📊"
          color="amber"
        />
        <StatCard
          title="مستحقات معلقة"
          value={formatCurrency(pendingAmount)}
          icon="⏳"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estates */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">عقاراتي وتركاتي</h2>
            <Link href="/estates" className="text-sm text-blue-600 hover:underline">عرض الكل</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {estates.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400">
                <p className="text-3xl mb-2">🏠</p>
                <p>لا توجد عقارات بعد</p>
                <Link href="/estates/new" className="text-blue-600 text-sm hover:underline mt-1 block">أضف عقاراً</Link>
              </div>
            ) : (
              estates.slice(0, 5).map((estate) => {
                const myHeirShare = estate.heirShares.find((h) => h.userId === session.userId);
                return (
                  <Link key={estate.id} href={`/estates/${estate.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <span className="text-2xl">{typeEmoji(estate.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{estate.name}</p>
                      <p className="text-sm text-gray-500">{estateTypeLabel(estate.type)} • {estate.location ?? "—"}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-blue-700">{myHeirShare?.sharePercentage.toFixed(1) ?? 0}%</p>
                      <p className="text-xs text-gray-400">حصتي</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Votes & Pending Distributions */}
        <div className="space-y-4">
          {/* Open votes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">تصويتات مفتوحة</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {recentVotes.length === 0 ? (
                <p className="px-6 py-4 text-sm text-gray-400">لا توجد تصويتات مفتوحة</p>
              ) : (
                recentVotes.map((p) => (
                  <Link key={p.id} href={`/estates/${p.estateId}/votes`} className="block px-6 py-3 hover:bg-gray-50">
                    <p className="font-medium text-gray-800 text-sm">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.estate.name} • {p._count.votes} صوت • حتى {formatDate(p.deadline)}</p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Pending distributions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">مستحقاتي المعلقة</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {distributions.length === 0 ? (
                <p className="px-6 py-4 text-sm text-gray-400">لا توجد مستحقات معلقة</p>
              ) : (
                distributions.map((d) => (
                  <div key={d.id} className="px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{d.rentalIncome.estate.name}</p>
                        <p className="text-xs text-gray-400">{d.rentalIncome.period}</p>
                      </div>
                      <span className="font-bold text-green-700">{formatCurrency(d.amount)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, suffix, icon, color }: { title: string; value: string; suffix?: string; icon: string; color: "blue" | "green" | "amber" | "red" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-red-50 text-red-700 border-red-100",
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <p className="text-sm font-medium opacity-80">{title}</p>
      </div>
      <p className="text-2xl font-bold">
        {value} {suffix && <span className="text-base font-normal opacity-70">{suffix}</span>}
      </p>
    </div>
  );
}

function typeEmoji(type: string) {
  const map: Record<string, string> = { APARTMENT: "🏢", VILLA: "🏡", LAND: "🌍", COMMERCIAL: "🏪", FARM: "🌾", OTHER: "🏗️" };
  return map[type] ?? "🏠";
}
