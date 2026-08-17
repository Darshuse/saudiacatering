import type { Metadata } from "next";
import Link from "next/link";
import { OPERATOR, LAST_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "شروط الاستخدام",
  description: "شروط استخدام منصة الورثة — نطاق الخدمة، الطبيعة الاسترشادية للحاسبة، وحدود المسؤولية.",
  alternates: { canonical: "/terms" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-950 text-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">⚖️ منصة الورثة</Link>
          <Link href="/" className="text-sm text-blue-200 hover:text-white">← الرئيسية</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">شروط الاستخدام</h1>
        <p className="text-sm text-gray-400 mb-8">آخر تحديث: {LAST_UPDATED}</p>

        <Section title="1. طبيعة الخدمة">
          <p>منصة الورثة أداة تنظيمية وحسابية تساعد الورثة على إدارة التركات المشتركة (حصص، إيرادات، تصويت) وحساب الأنصبة الشرعية استرشادياً.</p>
        </Section>

        <Section title="2. الطبيعة الاسترشادية — لا فتوى ولا حكم قضائي">
          <p>
            نتائج حاسبة المواريث تعليمية استرشادية وفق قواعد علم الفرائض، و<strong>لا تُعدّ فتوى ولا استشارة قانونية
            ولا حكماً قضائياً مُلزماً</strong>. القسمة الملزمة تصدر عن المحكمة المختصة أو بتراضي الورثة بعد استشارة مختص
            في الفرائض. لا تُغني المنصة عن صك حصر الورثة ولا عن إجراءات المحاكم وكتابة العدل.
          </p>
        </Section>

        <Section title="3. مسؤولية المستخدم عن دقة المدخلات">
          <p>أنت مسؤول عن صحة البيانات التي تُدخلها (الورثة، الحصص، قيمة التركة بعد سداد الديون وتنفيذ الوصية). المنصة تحسب بناءً على ما تُدخله.</p>
        </Section>

        <Section title="4. الحساب والأمان">
          <p>أنت مسؤول عن الحفاظ على سرية بيانات دخولك. أبلغنا فوراً عند أي استخدام غير مصرّح به لحسابك.</p>
        </Section>

        <Section title="5. حدود المسؤولية">
          <p>تُقدَّم الخدمة «كما هي». لا نتحمّل مسؤولية أي قرار يُتخذ اعتماداً على المخرجات الاسترشادية دون الرجوع إلى الجهات المختصة.</p>
        </Section>

        <Section title="6. الخصوصية">
          <p>تخضع معالجة بياناتك لـ <Link href="/privacy" className="text-blue-600 underline">سياسة الخصوصية</Link>، وهي جزء لا يتجزأ من هذه الشروط.</p>
        </Section>

        <Section title="7. التواصل">
          <p>لأي استفسار: <a className="text-blue-600 underline" href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a></p>
        </Section>
      </div>
    </div>
  );
}
