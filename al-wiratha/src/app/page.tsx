import Link from "next/link";
import { FaqAccordion, faqs } from "@/components/ui/faq-accordion";
import { SITE_URL } from "@/lib/site";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { getSupportWhatsApp } from "@/lib/whatsapp";
import { TrackEvent } from "@/components/analytics/track-event";

// Re-check the owner's registered WhatsApp number every hour.
export const revalidate = 3600;

export default async function LandingPage() {
  const whatsapp = await getSupportWhatsApp();
  const features = [
    { icon: "🏢", title: "إدارة العقارات والتركات", desc: "أضف عقاراتك وتركاتك وحدد قيمتها ونوعها وموقعها بسهولة تامة" },
    { icon: "⚖️", title: "تقسيم الحصص الشرعية", desc: "حدد حصة كل وارث بنظام الكسور الشرعية (1/2، 1/4، 1/8...) تلقائياً" },
    { icon: "💰", title: "توزيع الإيرادات تلقائياً", desc: "سجّل إيرادات الإيجار وتوزع تلقائياً على الورثة بحسب حصة كل منهم" },
    { icon: "🗳️", title: "التصويت على القرارات", desc: "أنشئ مقترحات وصوّت عليها — وزن كل صوت بحسب حصة الوارث" },
    { icon: "📚", title: "حاسبة المواريث الشرعية", desc: "احسب المواريث وفق المذاهب الأربعة: الحنفي والمالكي والشافعي والحنبلي" },
    { icon: "📊", title: "تقارير مفصلة", desc: "تتبع مستحقاتك وإيراداتك وحصصك في لوحة تحكم واضحة وشاملة" },
  ];

  const madhabs = [
    { name: "الحنفي", color: "bg-blue-100 text-blue-800 border-blue-200", region: "تركيا • آسيا • الهند" },
    { name: "المالكي", color: "bg-green-100 text-green-800 border-green-200", region: "المغرب العربي • الخليج" },
    { name: "الشافعي", color: "bg-purple-100 text-purple-800 border-purple-200", region: "مصر • جنوب شرق آسيا" },
    { name: "الحنبلي", color: "bg-orange-100 text-orange-800 border-orange-200", region: "السعودية • الخليج" },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "منصة الورثة",
        url: SITE_URL,
        description: "منصة إدارة وتقسيم التركات والعقارات المشتركة وفق الشريعة الإسلامية والمذاهب الأربعة",
      },
      {
        "@type": "WebSite",
        name: "منصة الورثة",
        url: SITE_URL,
        inLanguage: "ar",
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <TrackEvent name="visit_landing" />
      {/* Hero */}
      <div className="bg-gradient-to-bl from-blue-950 via-blue-900 to-blue-800 text-white">
        <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚖️</span>
            <div>
              <span className="text-xl font-bold">منصة الورثة</span>
              <p className="text-xs text-blue-300">إدارة التركات الشرعية</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login" className="text-blue-200 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors">
              دخول
            </Link>
            <Link href="/calculator" className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-lg">
              احسب الأنصبة الآن — مجاناً
            </Link>
          </div>
        </nav>

        <div className="px-8 py-24 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-700/50 text-blue-200 text-sm px-4 py-2 rounded-full mb-6 border border-blue-600">
            ✨ وفق أحكام الشريعة الإسلامية والمذاهب الأربعة
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            إدارة التركات والعقارات<br />
            <span className="text-amber-400">بين الورثة</span> بكل يسر وعدل
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto mb-10 leading-relaxed">
            منصة متكاملة لإدارة التركات المشتركة — تقسيم الحصص الشرعية، توزيع إيرادات الإيجار تلقائياً، والتصويت على القرارات بشفافية تامة
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/calculator" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-colors shadow-xl">
              احسب الأنصبة الشرعية الآن — مجاناً وبدون تسجيل ←
            </Link>
            <Link href="/auth/register" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-colors border border-white/20">
              أنشئ حساباً لإدارة التركة
            </Link>
          </div>
        </div>
      </div>

      {/* Madhabs */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <p className="text-center text-gray-500 text-sm mb-4">الحساب وفق المذاهب الفقهية الأربعة</p>
          <div className="flex gap-3 justify-center flex-wrap">
            {madhabs.map((m) => (
              <div key={m.name} className={`flex flex-col items-center px-5 py-3 rounded-xl border ${m.color}`}>
                <span className="font-bold">{m.name}</span>
                <span className="text-xs opacity-70 mt-0.5">{m.region}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">كل ما تحتاجه لإدارة التركة</h2>
          <p className="text-center text-gray-500 mb-12">منصة شاملة تجمع الإدارة المالية والأحكام الشرعية في مكان واحد</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-3xl block mb-3">{f.icon}</span>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white px-8 py-20 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">كيف تعمل المنصة؟</h2>
          <p className="text-center text-gray-500 mb-12">ثلاث خطوات من الحساب الشرعي إلى الإدارة المشتركة</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "١", title: "احسب الأنصبة الشرعية", desc: "أدخل الورثة (أبناء، زوجات، والدان...) واحصل فوراً على نصيب كل وارث بالكسر الشرعي والنسبة والمبلغ — وفق المذهب الذي تختاره." },
              { n: "٢", title: "سجّل التركة والعقارات", desc: "أنشئ حساباً مجانياً، أضف العقارات والأصول بقيمها، وادعُ الورثة بحصصهم الموثّقة." },
              { n: "٣", title: "أديروها معاً بشفافية", desc: "سجّل إيرادات الإيجار فتتوزع تلقائياً بحسب الحصص، وصوّتوا على قرارات البيع والتأجير بوزن نصيب كل وارث." },
            ].map((step) => (
              <div key={step.n} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center">
                <span className="w-12 h-12 rounded-full bg-amber-500 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">{step.n}</span>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">أسئلة تهمّك قبل أن تبدأ</h2>
          <p className="text-center text-gray-500 mb-10">إجابات صريحة عن الأسئلة الشرعية والقانونية والأمنية</p>
          <FaqAccordion />
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-900 text-white px-8 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">ابدأ في إدارة تركتك اليوم</h2>
        <p className="text-blue-300 mb-8 max-w-xl mx-auto">
          منصة جديدة نبنيها بشفافية: الحاسبة مجانية بالكامل وبدون تسجيل، وحساباتها تتم على جهازك ولا تغادر متصفحك — جرّبها الآن واحكم بنفسك
        </p>
        <Link href="/calculator" className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-4 rounded-2xl font-bold text-lg inline-block transition-colors shadow-lg">
          جرّب الحاسبة أولاً — ثم أنشئ تركتك مجاناً ←
        </Link>
      </div>

      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        <p>منصة الورثة © 2026 — إدارة التركات وفق أحكام الشريعة الإسلامية</p>
        <p className="text-xs mt-1 text-gray-600">النتائج استرشادية تعليمية — يُنصح بالرجوع للجهات الشرعية والقضائية المختصة</p>
        <div className="flex gap-4 justify-center mt-3 text-xs">
          <Link href="/privacy" className="text-gray-400 hover:text-white">سياسة الخصوصية</Link>
          <Link href="/terms" className="text-gray-400 hover:text-white">شروط الاستخدام</Link>
          <Link href="/calculator" className="text-gray-400 hover:text-white">حاسبة المواريث</Link>
        </div>
      </footer>

      <WhatsAppButton phone={whatsapp} />
    </div>
  );
}
