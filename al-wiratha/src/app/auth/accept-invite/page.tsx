"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"checking" | "valid" | "invalid">("checking");
  const [estateName, setEstateName] = useState("");
  const [form, setForm] = useState({ name: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    fetch(`/api/auth/accept-invite?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setStatus("invalid"); return; }
        setForm((f) => ({ ...f, name: d.name ?? "" }));
        setEstateName(d.estateName ?? "");
        setStatus("valid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name: form.name, password: form.password, phone: form.phone || undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "حدث خطأ"); return; }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">⚖️</span>
          <h1 className="text-3xl font-bold text-white mt-3">منصة الورثة</h1>
          <p className="text-blue-300 mt-1">تفعيل حساب وريث</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {status === "checking" && <p className="text-center text-gray-400 py-8">جاري التحقق من الدعوة...</p>}

          {status === "invalid" && (
            <div className="text-center py-6">
              <p className="text-4xl mb-3">⛔</p>
              <p className="font-bold text-gray-900 mb-2">الدعوة غير صالحة أو منتهية</p>
              <p className="text-sm text-gray-500 mb-5">اطلب من مدير التركة إرسال رابط دعوة جديد</p>
              <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline text-sm">تسجيل الدخول</Link>
            </div>
          )}

          {status === "valid" && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">أهلاً بك بين الورثة</h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                تمت دعوتك كوريث في تركة <strong className="text-gray-800">{estateName}</strong> — أكمل بياناتك لتفعيل حسابك
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">اسمك الكامل *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">كلمة المرور الجديدة *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="6 أحرف على الأقل"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">رقم الجوال</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="05xxxxxxxx"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  فعّل حسابي وادخل المنصة
                </button>
                <p className="text-center text-xs text-gray-400">🔒 بياناتك مشفّرة وآمنة</p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800" />}>
      <AcceptInviteForm />
    </Suspense>
  );
}
