"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Notification { id: string; title: string; href?: string; readAt?: string; createdAt: string }

export function NotificationsCard() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        setItems((d.notifications ?? []).filter((n: Notification) => !n.readAt).slice(0, 5));
        setUnread(d.unread ?? 0);
      })
      .catch(() => {});
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "POST" });
    setItems([]);
    setUnread(0);
  }

  if (unread === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 flex items-center justify-between border-b border-amber-100">
        <h2 className="font-bold text-amber-900 text-sm">🔔 جديد لديك ({unread})</h2>
        <button onClick={markAllRead} className="text-xs text-amber-700 hover:underline">
          تحديد الكل كمقروء
        </button>
      </div>
      <div className="divide-y divide-amber-100">
        {items.map((n) =>
          n.href ? (
            <Link key={n.id} href={n.href} className="block px-5 py-2.5 text-sm text-amber-900 hover:bg-amber-100 transition-colors">
              {n.title}
            </Link>
          ) : (
            <p key={n.id} className="px-5 py-2.5 text-sm text-amber-900">{n.title}</p>
          )
        )}
      </div>
    </div>
  );
}
