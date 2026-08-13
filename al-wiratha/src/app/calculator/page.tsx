import type { Metadata } from "next";
import Link from "next/link";
import { InheritanceCalculator } from "@/components/calculator/inheritance-calculator";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";

export const metadata: Metadata = {
  title: "حاسبة المواريث الشرعية مجاناً — وفق المذاهب الأربعة | منصة الورثة",
  description:
    "احسب الأنصبة الشرعية للورثة مجاناً وبدون تسجيل — وفق المذاهب الأربعة: الحنفي والمالكي والشافعي والحنبلي. مع بيان العول والرد والحجب وأساس كل نصيب.",
};

export default function PublicCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Light nav */}
      <nav className="bg-blue-950 text-white">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <span className="font-bold">منصة الورثة</span>
              <p className="text-xs text-blue-300">إدارة التركات الشرعية</p>
            </div>
          </Link>
          <div className="flex gap-3 items-center">
            <Link href="/auth/login" className="text-blue-200 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
              دخول
            </Link>
            <Link href="/auth/register" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              إنشاء حساب
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <InheritanceCalculator variant="public" />
      </div>

      <footer className="text-center py-6 text-sm text-gray-400">
        <p>منصة الورثة © 2026 — الحساب يتم داخل متصفحك ولا تُرسل بياناتك إلى أي خادم</p>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
