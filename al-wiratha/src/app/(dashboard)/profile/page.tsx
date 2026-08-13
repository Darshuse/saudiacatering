import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { LogoutButton } from "@/components/layout/logout-button";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, phone: true, nationalId: true, role: true, createdAt: true },
  });
  if (!user) redirect("/auth/login");

  const fields = [
    { label: "الاسم", value: user.name },
    { label: "البريد الإلكتروني", value: user.email },
    { label: "رقم الجوال", value: user.phone ?? "غير مضاف" },
    { label: "رقم الهوية الوطنية", value: user.nationalId ?? "غير مضاف" },
    { label: "تاريخ الانضمام", value: formatDate(user.createdAt) },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
        <p className="text-gray-500 mt-1">بياناتك الأساسية في المنصة</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center text-xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{user.name}</p>
            <p className="text-sm text-gray-400">{user.role === "ADMIN" ? "مدير تركة" : "وارث"}</p>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {fields.map((f) => (
            <div key={f.label} className="px-6 py-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">{f.label}</span>
              <span className="text-sm font-semibold text-gray-900">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      <LogoutButton />
    </div>
  );
}
