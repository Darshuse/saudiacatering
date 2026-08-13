"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { track } from "@/lib/analytics-client";

export default function RegisterPage() {
  useEffect(() => {
    track("register_view");
  }, []);
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "خطأ في إنشاء الحساب"); return; }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">⚖️</span>
          <h1 className="text-3xl font-bold text-white mt-3">منصة الورثة</h1>
          <p className="text-blue-300 mt-1">إدارة التركات وفق الشريعة الإسلامية</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">إنشاء حساب جديد</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "name", label: "الاسم الكامل *", type: "text", placeholder: "محمد أحمد العبدالله", required: true },
              { key: "email", label: "البريد الإلكتروني *", type: "email", placeholder: "your@email.com", required: true },
              { key: "password", label: "كلمة المرور *", type: "password", placeholder: "6 أحرف على الأقل", required: true },
              { key: "phone", label: "رقم الجوال", type: "tel", placeholder: "05xxxxxxxx", required: false },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder={field.placeholder}
                  required={field.required}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              إنشاء الحساب
            </button>

            <p className="text-center text-xs text-gray-400">
              🔒 بياناتك مشفّرة وآمنة — أقل من دقيقة وتبدأ
            </p>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
