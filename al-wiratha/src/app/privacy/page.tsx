import type { Metadata } from "next";
import Link from "next/link";
import { OPERATOR, OPERATOR_CONFIGURED, LAST_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "سياسة خصوصية منصة الورثة — كيف نجمع بياناتك ونعالجها ونحميها وفق نظام حماية البيانات الشخصية السعودي (PDPL).",
  alternates: { canonical: "/privacy" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-950 text-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">⚖️ منصة الورثة</Link>
          <Link href="/" className="text-sm text-blue-200 hover:text-white">← الرئيسية</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">سياسة الخصوصية</h1>
        <p className="text-sm text-gray-400 mb-8">آخر تحديث: {LAST_UPDATED}</p>

        {!OPERATOR_CONFIGURED && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-8">
            ⚙️ ملاحظة إعداد: يجب على مالك المنصة تعبئة بيانات الجهة المشغّلة (الكيان القانوني والسجل التجاري والعنوان)
            عبر متغيرات البيئة قبل الإطلاق الرسمي.
          </div>
        )}

        <Section title="1. الجهة المشغّلة">
          <p>الكيان القانوني: <strong>{OPERATOR.entity}</strong></p>
          <p>السجل التجاري: {OPERATOR.crNumber}</p>
          <p>العنوان: {OPERATOR.address}</p>
          <p>للتواصل: <a className="text-blue-600 underline" href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a></p>
        </Section>

        <Section title="2. البيانات التي نجمعها">
          <ul className="list-disc mr-5 space-y-1">
            <li>بيانات الحساب: الاسم، البريد الإلكتروني، رقم الجوال (اختياري).</li>
            <li>بيانات التركة التي تُدخلها: العقارات، الحصص، الإيرادات، المستندات التي ترفعها.</li>
            <li>حاسبة المواريث: تعمل داخل متصفحك بالكامل — <strong>مدخلاتها لا تُرسل إلى خوادمنا</strong>.</li>
            <li>بيانات فنية محدودة لأغراض القياس الداخلي (بدون خدمات تتبّع خارجية).</li>
          </ul>
        </Section>

        <Section title="3. البيانات الحسّاسة (المذهب والنسب)">
          <p>
            قد تتضمن بعض المدخلات بيانات ذات طبيعة حسّاسة (المذهب الفقهي، صلات القرابة). نعالجها فقط للغرض المصرّح
            به (حساب الأنصبة وإدارة التركة)، ولا نستخدمها لأي غرض آخر، وتخضع لضمانات حماية مشدّدة وفق
            نظام حماية البيانات الشخصية السعودي (PDPL).
          </p>
        </Section>

        <Section title="4. أساس المعالجة والغرض">
          <p>نعالج بياناتك بناءً على موافقتك الصريحة وعلى ما يلزم لتنفيذ الخدمة التي طلبتها (إدارة التركة وتوزيع الإيرادات والتصويت)، ولا نعالجها لغير هذه الأغراض.</p>
        </Section>

        <Section title="5. حماية البيانات ومكان استضافتها">
          <p>كلمات المرور مُخزَّنة مشفّرة (bcrypt) والجلسات موقّعة رقمياً. نلتزم باستضافة البيانات داخل المملكة العربية السعودية، ولا يُنقل أي معالج خارج المملكة إلا وفق ضوابط النظام (المادة 29 من PDPL) وبعد الإفصاح عنه.</p>
        </Section>

        <Section title="6. مشاركة البيانات">
          <p>لا نبيع بياناتك ولا نشاركها مع أطراف ثالثة لأغراض تسويقية. قد نشاركها فقط عند إلزام نظامي أو أمر قضائي.</p>
        </Section>

        <Section title="7. حقوقك كصاحب بيانات">
          <p>لك حق الاطلاع على بياناتك وتصحيحها وحذفها وسحب موافقتك، وحق تقديم شكوى. لممارسة أي من هذه الحقوق تواصل مع مسؤول حماية البيانات:</p>
          <p><a className="text-blue-600 underline" href={`mailto:${OPERATOR.dpoEmail}`}>{OPERATOR.dpoEmail}</a></p>
        </Section>

        <Section title="8. الاحتفاظ بالبيانات">
          <p>نحتفظ ببياناتك طوال فترة استخدامك للمنصة، وتُحذف أو تُجهَّل خلال مدة معقولة بعد إغلاق الحساب ما لم يوجد التزام نظامي بالاحتفاظ.</p>
        </Section>

        <Section title="9. التعديلات">
          <p>قد نحدّث هذه السياسة، وننشر أي تعديل جوهري على هذه الصفحة مع تاريخ التحديث.</p>
        </Section>

        <p className="text-sm text-gray-500 mt-8">
          اطّلع أيضاً على <Link href="/terms" className="text-blue-600 underline">شروط الاستخدام</Link>.
        </p>
      </div>
    </div>
  );
}
