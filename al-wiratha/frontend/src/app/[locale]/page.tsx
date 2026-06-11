import Link from 'next/link';
import { Scale, Building2, Heart, ChevronLeft } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function HomePage() {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero */}
      <section className="relative bg-primary overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M40 0l10 17.3h20L60 34.6l10 17.4H50L40 69.3 30 52H10l10-17.4L10 17.3h20z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="flex justify-center mb-6">
            <Logo size={64} variant="dark" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            ورثة
          </h1>
          <p className="text-xl text-emerald-100 mb-3 font-light">
            منصة إدارة وتقسيم التركات والأوقاف
          </p>
          <p className="text-lg text-emerald-200 mb-10 max-w-2xl mx-auto">
            احسب الميراث الشرعي بدقة وفق المذاهب الأربعة، وأدِر الأصول المشتركة
            بين الورثة بشفافية كاملة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ar/inheritance"
              className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
            >
              <Scale className="w-5 h-5" />
              ابدأ حسبة المواريث
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <Link
              href="/ar/estates"
              className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/30 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-200"
            >
              <Building2 className="w-5 h-5" />
              إدارة التركات
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-primary mb-3">
            كل ما تحتاجه في مكان واحد
          </h2>
          <p className="text-center text-gray-500 mb-14">
            منصة شاملة مصممة للسوقين السعودي والمصري
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Scale className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                حاسبة المواريث الشرعية
              </h3>
              <p className="text-gray-500 leading-relaxed">
                حسبة دقيقة وفق المذاهب الأربعة مع بيان فقهي مفصل لكل وارث
                وكشف العول والرد والحالات الخاصة
              </p>
              <Link
                href="/ar/inheritance"
                className="mt-6 inline-flex items-center gap-1 text-primary font-semibold hover:gap-2 transition-all text-sm"
              >
                ابدأ الحسبة <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                إدارة الأصول المشتركة
              </h3>
              <p className="text-gray-500 leading-relaxed">
                سجّل العقارات والإيرادات، وزِّع الإيجارات تلقائياً، وصوِّت على
                القرارات بوزن حصة كل وارث
              </p>
              <Link
                href="/ar/estates"
                className="mt-6 inline-flex items-center gap-1 text-secondary font-semibold hover:gap-2 transition-all text-sm"
              >
                إدارة التركات <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                الأوقاف والمساجد
              </h3>
              <p className="text-gray-500 leading-relaxed">
                إدارة الوقف بشفافية كاملة مع دفتر مصروفات مفتوح للمتبرعين
                وحملات تبرع مع تتبع التقدم
              </p>
              <Link
                href="/ar/waqf"
                className="mt-6 inline-flex items-center gap-1 text-emerald-600 font-semibold hover:gap-2 transition-all text-sm"
              >
                استكشف الأوقاف <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary/5 py-16 px-6 border-y border-primary/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '٤', label: 'مذاهب فقهية' },
            { value: '١٠٠٪', label: 'دقة شرعية' },
            { value: '٣', label: 'أوضاع خاصة' },
            { value: 'مجاني', label: 'للاستخدام الشخصي' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold text-primary mb-2">{s.value}</div>
              <div className="text-gray-600 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-amber-50 border-t border-amber-200 px-6 py-8">
        <p className="max-w-3xl mx-auto text-center text-amber-800 text-sm leading-relaxed">
          ⚖️{' '}
          <strong>تنبيه:</strong> هذه الحسبة استرشادية ولا تغني عن حكم
          المحكمة المختصة أو فتوى أهل العلم. للتقسيم الرسمي يُرجى التواصل مع
          الجهات القضائية المختصة.
        </p>
      </section>
    </div>
  );
}
