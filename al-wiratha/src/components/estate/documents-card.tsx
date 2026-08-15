"use client";
import { useEffect, useState, useCallback } from "react";

interface Doc {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  uploadedBy: { id: string; name: string };
}

export function DocumentsCard({ estateId, isAdmin }: { estateId: string; isAdmin: boolean }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch(`/api/estates/${estateId}/documents`)
      .then((r) => r.json())
      .then((d) => setDocs(d.documents ?? []));
  }, [estateId]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("name", name);
    const res = await fetch(`/api/estates/${estateId}/documents`, { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setError(data.error ?? "فشل الرفع"); return; }
    setName("");
    setFile(null);
    (document.getElementById("doc-file-input") as HTMLInputElement | null)?.form?.reset();
    load();
  }

  async function handleDelete(docId: string) {
    if (!confirm("حذف هذا المستند؟")) return;
    await fetch(`/api/estates/${estateId}/documents/${docId}`, { method: "DELETE" });
    load();
  }

  const icon = (mime: string) => (mime === "application/pdf" ? "📄" : "🖼️");

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">🗂️ خزنة المستندات</h2>
        <p className="text-xs text-gray-400 mt-0.5">صك حصر الورثة، صكوك الملكية، عقود الإيجار، إيصالات التحويل</p>
      </div>

      <div className="divide-y divide-gray-50">
        {docs.length === 0 ? (
          <p className="px-5 py-5 text-sm text-gray-400 text-center">لا توجد مستندات بعد</p>
        ) : (
          docs.map((doc) => (
            <div key={doc.id} className="px-5 py-3 flex items-center gap-3">
              <span className="text-xl">{icon(doc.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <a
                  href={`/api/estates/${estateId}/documents/${doc.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-700 hover:underline truncate block"
                >
                  {doc.name}
                </a>
                <p className="text-xs text-gray-400">
                  {(doc.size / 1024 / 1024).toFixed(1)}MB • رفعه {doc.uploadedBy.name}
                </p>
              </div>
              {isAdmin && (
                <button onClick={() => handleDelete(doc.id)} className="text-red-400 hover:text-red-600 text-sm p-1" aria-label={`حذف ${doc.name}`}>
                  🗑️
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {isAdmin && (
        <form onSubmit={handleUpload} className="px-5 py-4 border-t border-gray-100 space-y-3">
          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم المستند — مثال: صك حصر الورثة"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            required
            minLength={2}
          />
          <div className="flex gap-2">
            <input
              id="doc-file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="flex-1 text-xs text-gray-500 file:ml-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700"
              required
            />
            <button
              type="submit"
              disabled={uploading || !file}
              className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
            >
              {uploading ? "جارٍ الرفع..." : "رفع"}
            </button>
          </div>
          <p className="text-[11px] text-gray-400">PDF أو JPG أو PNG — بحد أقصى 10MB</p>
        </form>
      )}
    </div>
  );
}
