"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const ESTATE_TYPES = [
  { value: "APARTMENT", label: "شقة" },
  { value: "VILLA", label: "فيلا" },
  { value: "LAND", label: "أرض" },
  { value: "COMMERCIAL", label: "محل تجاري" },
  { value: "FARM", label: "مزرعة" },
  { value: "OTHER", label: "أخرى" },
];

export default function NewEstatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", type: "APARTMENT", description: "", location: "", area: "", value: "",
  });

  function set(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/estates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        type: form.type,
        description: form.description || undefined,
        location: form.location || undefined,
        area: form.area ? parseFloat(form.area) : undefined,
        value: form.value ? parseFloat(form.value) : undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "حدث خطأ");
      return;
    }

    router.push(`/estates/${data.estate.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4 block">
          ← رجوع
        </button>
        <h1 className="text-2xl font-bold text-gray-900">إضافة عقار / تركة جديدة</h1>
        <p className="text-gray-500 mt-1">أضف عقاراً لتبدأ في إدارة الحصص والإيرادات</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="اسم العقار / التركة *"
            id="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="مثال: عمارة الوالد — شارع الملك فهد"
            required
          />

          <Select
            label="نوع العقار *"
            id="type"
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            options={ESTATE_TYPES}
          />

          <Input
            label="الموقع / العنوان"
            id="location"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="مثال: الرياض، حي النرجس"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="المساحة (م²)"
              id="area"
              type="number"
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
              placeholder="200"
            />
            <Input
              label="القيمة التقديرية (ريال)"
              id="value"
              type="number"
              value={form.value}
              onChange={(e) => set("value", e.target.value)}
              placeholder="1000000"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">الوصف</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
              placeholder="وصف مختصر للعقار وتفاصيله..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} size="lg" className="flex-1">
              حفظ العقار
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()} size="lg">
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
