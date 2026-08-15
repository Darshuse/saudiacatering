"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ArchiveButton({ estateId, archived }: { estateId: string; archived: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const msg = archived
      ? "استعادة هذا العقار من الأرشيف؟"
      : "أرشفة العقار؟ سيختفي من القوائم لكن كل سجلاته المالية تبقى محفوظة ويمكن استعادته في أي وقت.";
    if (!confirm(msg)) return;
    setBusy(true);
    await fetch(`/api/estates/${estateId}`, { method: "DELETE" });
    setBusy(false);
    if (archived) router.refresh();
    else router.push("/estates");
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${
        archived
          ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
          : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
      }`}
    >
      {archived ? "📤 استعادة من الأرشيف" : "🗄️ أرشفة العقار"}
    </button>
  );
}
