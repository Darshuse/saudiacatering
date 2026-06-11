import { Heart, Target, BookOpen } from 'lucide-react';

export default function WaqfPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="bg-primary px-6 pt-8 pb-6">
        <h1 className="text-white font-bold text-xl text-center">الأوقاف والمساجد</h1>
        <p className="text-emerald-200 text-xs text-center mt-1">شفافية كاملة في إدارة الوقف</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">منصة الأوقاف الشفافة</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            إدارة حملات التبرع، ودفتر المصروفات المفتوح، ومتابعة مشاريع الصيانة —
            كل شيء مرئي للمتبرعين
          </p>
        </div>

        <div className="space-y-3">
          {[
            { icon: Target, title: 'حملات التبرع', desc: 'مع شريط تقدم الهدف وتفاصيل المصروفات' },
            { icon: BookOpen, title: 'دفتر الشفافية', desc: 'كل ريال مُصرف موثق بالفاتورة والصورة' },
            { icon: Heart, title: 'مشاريع الصيانة', desc: 'متابعة حالة كل مشروع بالصور' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 text-xs">
          هذا القسم قيد التطوير — قريباً جداً
        </p>
      </div>
    </div>
  );
}
