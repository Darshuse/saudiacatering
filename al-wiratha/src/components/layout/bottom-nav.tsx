"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "الرئيسية", icon: "🏠" },
  { href: "/estates", label: "العقارات", icon: "🏢" },
  { href: "/statement", label: "كشفي", icon: "📄" },
  { href: "/inheritance-calculator", label: "الحاسبة", icon: "⚖️" },
  { href: "/profile", label: "الملف", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors",
              active ? "text-blue-700" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <span className={cn("text-xl px-4 py-0.5 rounded-full", active && "bg-blue-50")}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
