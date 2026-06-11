import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6" dir="rtl">
      <div className="text-6xl">⚖️</div>
      <h1 className="text-2xl font-bold text-primary">الصفحة غير موجودة</h1>
      <p className="text-gray-500">عذراً، لم نتمكن من إيجاد هذه الصفحة</p>
      <Link href="/ar" className="btn-primary mt-2">العودة للرئيسية</Link>
    </div>
  );
}
