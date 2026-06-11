import Link from 'next/link';
import { Building2, Plus, Users, TrendingUp } from 'lucide-react';

export default function EstatesPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="bg-primary px-6 pt-8 pb-6">
        <h1 className="text-white font-bold text-xl text-center">إدارة التركات</h1>
        <p className="text-emerald-200 text-xs text-center mt-1">أصول مشتركة — توزيع تلقائي — تصويت شرعي</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Create estate CTA */}
        <div className="bg-white rounded-3xl border-2 border-dashed border-primary/30 p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">أنشئ تركتك الأولى</h2>
          <p className="text-gray-500 text-sm mb-6">
            أضف الورثة، سجّل الأصول، وتابع توزيع الإيرادات تلقائياً
          </p>
          <button className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            إنشاء تركة جديدة
          </button>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Users, title: 'دعوة الورثة', desc: 'ادعُ الورثة عبر رقم الجوال' },
            { icon: TrendingUp, title: 'توزيع الإيجار', desc: 'تلقائي وفق حصة كل وارث' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-5 border border-gray-100">
              <Icon className="w-6 h-6 text-primary mb-3" />
              <div className="font-semibold text-sm text-gray-900">{title}</div>
              <div className="text-xs text-gray-500 mt-1">{desc}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 text-xs">
          هذه الميزات تتطلب إنشاء حساب — قريباً
        </p>
      </div>
    </div>
  );
}
