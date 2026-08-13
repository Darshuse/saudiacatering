import type { Metadata } from "next";
import Link from "next/link";
import { InheritanceCalculator } from "@/components/calculator/inheritance-calculator";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { getSupportWhatsApp } from "@/lib/whatsapp";
import { TrackEvent } from "@/components/analytics/track-event";

// Re-check the owner's registered WhatsApp number every hour.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "حاسبة المواريث الشرعية مجاناً — وفق المذاهب الأربعة",
  description:
    "احسب الأنصبة الشرعية للورثة مجاناً وبدون تسجيل — وفق المذاهب الأربعة: الحنفي والمالكي والشافعي والحنبلي. مع بيان العول والرد والحجب وأساس كل نصيب.",
  alternates: { canonical: "/calculator" },
  openGraph: {
    title: "حاسبة المواريث الشرعية مجاناً — وفق المذاهب الأربعة",
    description: "احسب نصيب كل وارث بالكسر الشرعي والنسبة والمبلغ، مجاناً وبدون تسجيل — الحساب يتم داخل متصفحك",
    url: "/calculator",
  },
};

const calculatorSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "حاسبة المواريث الشرعية — منصة الورثة",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  inLanguage: "ar",
  offers: { "@type": "Offer", price: "0", priceCurrency: "SAR" },
  description:
    "حاسبة مواريث مجانية تعمل بدون تسجيل وفق المذاهب الأربعة: الحنفي والمالكي والشافعي والحنبلي، مع بيان العول والرد والحجب.",
};

export default async function PublicCalculatorPage() {
  const whatsapp = await getSupportWhatsApp();
  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }} />
      <TrackEvent name="visit_calculator" />
      {/* Light nav */}
      <nav className="bg-blue-950 text-white print:hidden">
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

      <footer className="text-center py-6 text-sm text-gray-400 print:hidden">
        <p>منصة الورثة © 2026 — الحساب يتم داخل متصفحك ولا تُرسل بياناتك إلى أي خادم</p>
      </footer>

      <WhatsAppButton phone={whatsapp} />
    </div>
  );
}
