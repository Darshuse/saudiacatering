import Link from "next/link";

/**
 * الإخلاء القانوني الموحّد — صيغة واحدة تُعرض على كل الصفحات الحسّاسة
 * (الحاسبة، التسجيل، الدخول، الأسئلة الشائعة، لوحة التحكم) لسدّ تعدّد الصيغ.
 */
export function LegalDisclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-xl text-amber-800 ${compact ? "px-4 py-2.5 text-xs" : "p-4 text-sm"}`}>
      <strong>⚠️ تنبيه:</strong> نتائج الحاسبة استرشادية تعليمية وفق علم الفرائض، ولا تُعدّ فتوى ولا استشارة قانونية ولا حكماً قضائياً مُلزماً.
      القسمة الملزمة تصدر عن المحكمة المختصة أو بتراضي الورثة بعد استشارة مختص.
      {!compact && (
        <>
          {" "}بالاستخدام فأنت توافق على{" "}
          <Link href="/terms" className="underline font-semibold">شروط الاستخدام</Link>
          {" "}و{" "}
          <Link href="/privacy" className="underline font-semibold">سياسة الخصوصية</Link>.
        </>
      )}
    </div>
  );
}
