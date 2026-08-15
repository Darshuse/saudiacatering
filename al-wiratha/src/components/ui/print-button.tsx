"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
    >
      🖨️ طباعة الكشف
    </button>
  );
}
