"use client";
import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface HeirShare {
  id: string;
  shareNumerator: number;
  shareDenominator: number;
  sharePercentage: number;
  relation?: string;
  user: { id: string; name: string; email: string };
}

interface Estate {
  id: string;
  name: string;
  adminId: string;
  heirShares: HeirShare[];
}

interface Invite { userId: string; token: string }

export default function HeirsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [estate, setEstate] = useState<Estate | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedFor, setCopiedFor] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", name: "", shareNumerator: "1", shareDenominator: "4", relation: "" });

  async function loadAll() {
    const [estRes, meRes] = await Promise.all([
      fetch(`/api/estates/${id}`).then((r) => r.json()),
      fetch(`/api/auth/me`).then((r) => r.json()),
    ]);
    const est: Estate | undefined = estRes.estate;
    setEstate(est ?? null);
    const admin = !!est && !!meRes.user?.id && est.adminId === meRes.user.id;
    setIsAdmin(admin);
    if (admin) {
      const invRes = await fetch(`/api/estates/${id}/heirs`).then((r) => r.json());
      setInvites(invRes.invites ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAddHeir(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    setSuccess("");

    const res = await fetch(`/api/estates/${id}/heirs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        name: form.name || undefined,
        shareNumerator: parseInt(form.shareNumerator),
        shareDenominator: parseInt(form.shareDenominator),
        relation: form.relation || undefined,
      }),
    });

    const data = await res.json();
    setAdding(false);

    if (!res.ok) { setError(data.error); return; }
    setSuccess(
      data.inviteToken
        ? "تمت إضافة الوريث — انسخ رابط الدعوة من القائمة وأرسله له على واتساب ليفعّل حسابه"
        : "تمت إضافة الوريث بنجاح"
    );
    setForm({ email: "", name: "", shareNumerator: "1", shareDenominator: "4", relation: "" });
    await loadAll();
  }

  async function handleRemove(userId: string) {
    if (!confirm("هل تريد حذف هذا الوريث؟")) return;
    await fetch(`/api/estates/${id}/heirs`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    await loadAll();
  }

  function copyInviteLink(invite: Invite) {
    const link = `${window.location.origin}/auth/accept-invite?token=${invite.token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedFor(invite.userId);
      setTimeout(() => setCopiedFor(null), 2500);
    });
  }

  if (loading) return <div className="text-center py-12 text-gray-400">جاري التحميل...</div>;
  if (!estate) return null;

  const totalPct = estate.heirShares.reduce((s, h) => s + h.sharePercentage, 0);
  const remaining = 100 - totalPct;
  // 1/3 × 3 = 99.99% — tolerate float rounding when declaring completeness.
  const isComplete = remaining <= 0.05;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href={`/estates/${id}`} className="text-sm text-gray-500 hover:text-gray-700 block mb-2">← {estate.name}</Link>
        <h1 className="text-2xl font-bold text-gray-900">{isAdmin ? "إدارة الورثة" : "الورثة والحصص"}</h1>
        <p className="text-gray-500 mt-1">{isAdmin ? "إضافة الورثة وتحديد حصصهم الشرعية" : "حصص الورثة الشرعية في هذه التركة"}</p>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-blue-900">توزيع الحصص</h3>
          <span className="text-sm font-semibold text-blue-700">{totalPct.toFixed(2)}% / 100%</span>
        </div>
        <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${Math.min(totalPct, 100)}%` }} />
        </div>
        <p className="text-sm text-blue-600 mt-2">
          {isComplete ? "✅ تم توزيع جميع الحصص" : `المتبقي للتوزيع: ${remaining.toFixed(2)}%`}
        </p>
      </div>

      {/* Heirs list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">قائمة الورثة ({estate.heirShares.length})</h2>
        </div>
        {estate.heirShares.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400">
            {isAdmin ? "لا يوجد ورثة بعد — أضف الورثة أدناه" : "لا يوجد ورثة بعد"}
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {estate.heirShares.map((share) => {
              const invite = invites.find((i) => i.userId === share.user.id);
              return (
                <div key={share.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    {share.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                      {share.user.name}
                      {invite && (
                        <span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          ⏳ بانتظار التفعيل
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-400">{share.user.email} {share.relation ? `• ${share.relation}` : ""}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-700">
                      {share.shareNumerator}/{share.shareDenominator}
                    </p>
                    <p className="text-xs text-gray-400">{share.sharePercentage.toFixed(2)}%</p>
                  </div>
                  {isAdmin && invite && (
                    <button
                      onClick={() => copyInviteLink(invite)}
                      className="text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      {copiedFor === share.user.id ? "✓ تم النسخ — أرسله واتساب" : "📋 نسخ رابط الدعوة"}
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => handleRemove(share.user.id)}
                      className="text-red-400 hover:text-red-600 text-sm p-2"
                      aria-label={`حذف ${share.user.name}`}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add heir form — admin only (API enforces this too) */}
      {isAdmin && (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">إضافة وارث جديد</h2>
        </div>
        <div className="px-6 py-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">{success}</div>}
          <form onSubmit={handleAddHeir} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="البريد الإلكتروني للوارث *"
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="heir@example.com"
                required
              />
              <Input
                label="اسم الوارث (مطلوب لبريد جديد)"
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="مثال: فاطمة أحمد العبدالله"
              />
            </div>
            <Input
              label="صلة القرابة"
              id="relation"
              value={form.relation}
              onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value }))}
              placeholder="مثال: ابن، بنت، زوجة، أخ..."
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="البسط (صورة الكسر)"
                id="num"
                type="number"
                min="1"
                value={form.shareNumerator}
                onChange={(e) => setForm((f) => ({ ...f, shareNumerator: e.target.value }))}
              />
              <Input
                label="المقام (مقام الكسر)"
                id="den"
                type="number"
                min="1"
                value={form.shareDenominator}
                onChange={(e) => setForm((f) => ({ ...f, shareDenominator: e.target.value }))}
              />
            </div>
            {form.shareNumerator && form.shareDenominator && (
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
                الحصة: <strong>{form.shareNumerator}/{form.shareDenominator}</strong> = <strong>{((parseInt(form.shareNumerator) / parseInt(form.shareDenominator)) * 100).toFixed(2)}%</strong>
                {remaining < (parseInt(form.shareNumerator) / parseInt(form.shareDenominator)) * 100 && (
                  <span className="text-red-600 mr-2">⚠️ يتجاوز المتبقي ({remaining.toFixed(2)}%)</span>
                )}
              </div>
            )}
            <Button type="submit" loading={adding} className="w-full">
              ➕ إضافة الوارث
            </Button>
            <p className="text-xs text-gray-400 text-center">
              عند إضافة بريد جديد سيظهر زر «نسخ رابط الدعوة» بجانب الوريث — أرسله له ليفعّل حسابه بنفسه
            </p>
          </form>
        </div>
      </div>
      )}
    </div>
  );
}
