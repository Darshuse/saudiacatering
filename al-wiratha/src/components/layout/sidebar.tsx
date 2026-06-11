"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "الرئيسية", icon: "🏠" },
  { href: "/estates", label: "العقارات والتركات", icon: "🏢" },
  { href: "/inheritance-calculator", label: "حاسبة المواريث", icon: "⚖️" },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  return (
    <aside className="w-64 bg-blue-900 text-white flex flex-col h-full fixed top-0 right-0 z-40 shadow-xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚖️</span>
          <div>
            <h1 className="text-lg font-bold">منصة الورثة</h1>
            <p className="text-xs text-blue-300">إدارة التركات الشرعية</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                ? "bg-blue-700 text-white shadow-md"
                : "text-blue-200 hover:bg-blue-800 hover:text-white"
            )}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-blue-800">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-blue-800 mb-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-sm font-bold">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-xs text-blue-300">وارث / مدير</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-right px-3 py-2 text-sm text-blue-300 hover:text-white hover:bg-blue-800 rounded-lg transition-all"
        >
          🚪 تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
