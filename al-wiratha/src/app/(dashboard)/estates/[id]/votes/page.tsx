"use client";
import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Vote { id: string; choice: string; comment?: string; weight: number; user: { id: string; name: string } }
interface Proposal { id: string; title: string; description: string; deadline: string; status: string; createdBy: { name: string }; votes: Vote[]; estateId: string }
interface HeirShare { sharePercentage: number; user: { id: string; name: string } }

function formatDate(d: string) {
  return new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "long", day: "numeric" }).format(new Date(d));
}

const STATUS_LABELS: Record<string, string> = { OPEN: "مفتوح", CLOSED: "مغلق", APPROVED: "معتمد", REJECTED: "مرفوض" };
const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
  APPROVED: "bg-blue-100 text-blue-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function VotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [heirShares, setHeirShares] = useState<HeirShare[]>([]);
  const [estateName, setEstateName] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", deadline: "" });
  const [error, setError] = useState("");
  const [voteComment, setVoteComment] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch(`/api/estates/${id}`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([estData, meData]) => {
      setProposals(estData.estate?.proposals ?? []);
      setHeirShares(estData.estate?.heirShares ?? []);
      setEstateName(estData.estate?.name ?? "");
      setCurrentUserId(meData.user?.id ?? "");
      setLoading(false);
    });
  }, [id]);

  async function handleCreateProposal(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");

    const res = await fetch(`/api/estates/${id}/proposals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setCreating(false);

    if (!res.ok) { setError(data.error ?? "حدث خطأ"); return; }
    setShowForm(false);
    setForm({ title: "", description: "", deadline: "" });

    const r = await fetch(`/api/estates/${id}`);
    const d = await r.json();
    setProposals(d.estate?.proposals ?? []);
  }

  async function handleVote(proposalId: string, choice: "YES" | "NO" | "ABSTAIN") {
    const res = await fetch(`/api/estates/${id}/proposals/${proposalId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice, comment: voteComment[proposalId] }),
    });
    if (res.ok) {
      const r = await fetch(`/api/estates/${id}`);
      const d = await r.json();
      setProposals(d.estate?.proposals ?? []);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">جاري التحميل...</div>;

  const myShare = heirShares.find((h) => h.user.id === currentUserId);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/estates/${id}`} className="text-sm text-gray-500 hover:text-gray-700 block mb-1">← {estateName}</Link>
          <h1 className="text-2xl font-bold text-gray-900">التصويتات والمقترحات</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          + مقترح جديد
        </Button>
      </div>

      {/* Weight explainer — the single most misunderstood thing in weighted voting */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-sm text-blue-800">
        ⚖️ <strong>كيف يُحسم التصويت؟</strong> وزن كل صوت = الحصة الشرعية لصاحبه
        {myShare ? <> — وزن صوتك أنت: <strong>{myShare.sharePercentage.toFixed(2)}%</strong></> : <> — لا تملك حصة في هذا العقار فلا يحق لك التصويت</>}
        . الأعلى وزناً يفوز، والتعادل يعني إغلاق المقترح دون حسم.
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">إنشاء مقترح جديد</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
          <form onSubmit={handleCreateProposal} className="space-y-4">
            <Input
              label="عنوان المقترح *"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="مثال: بيع الشقة الأولى"
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">وصف المقترح *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                placeholder="شرح تفصيلي للمقترح..."
                required
              />
            </div>
            <Input
              label="موعد انتهاء التصويت *"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              required
            />
            <div className="flex gap-3">
              <Button type="submit" loading={creating}>إنشاء المقترح</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>إلغاء</Button>
            </div>
          </form>
        </div>
      )}

      {/* Proposals */}
      {proposals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-gray-400">
          <p className="text-4xl mb-2">🗳️</p>
          <p>لا توجد مقترحات بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const myVote = proposal.votes.find((v) => v.user.id === currentUserId);
            const yesVotes = proposal.votes.filter((v) => v.choice === "YES");
            const noVotes = proposal.votes.filter((v) => v.choice === "NO");
            const abstainVotes = proposal.votes.filter((v) => v.choice === "ABSTAIN");
            const yesWeight = yesVotes.reduce((s, v) => s + v.weight, 0);
            const noWeight = noVotes.reduce((s, v) => s + v.weight, 0);
            const abstainWeight = abstainVotes.reduce((s, v) => s + v.weight, 0);
            const totalWeight = proposal.votes.reduce((s, v) => s + v.weight, 0);
            const isOpen = proposal.status === "OPEN" && new Date() < new Date(proposal.deadline);
            const daysLeft = Math.ceil((new Date(proposal.deadline).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
            const votedIds = new Set(proposal.votes.map((v) => v.user.id));
            const notVoted = heirShares.filter((h) => !votedIds.has(h.user.id));
            const choiceLabel: Record<string, string> = { YES: "✅ موافق", NO: "❌ رافض", ABSTAIN: "⬜ ممتنع" };

            return (
              <div key={proposal.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{proposal.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        بقلم: {proposal.createdBy.name} • حتى {formatDate(proposal.deadline)}
                        {isOpen && daysLeft > 0 && (
                          <span className={`mr-2 font-bold ${daysLeft <= 3 ? "text-red-600" : "text-blue-600"}`}>
                            ⏳ باقي {daysLeft} {daysLeft === 1 ? "يوم" : daysLeft === 2 ? "يومان" : daysLeft <= 10 ? "أيام" : "يوماً"}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[proposal.status]}`}>
                      {STATUS_LABELS[proposal.status]}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">{proposal.description}</p>

                  {/* Vote bars */}
                  {proposal.votes.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600 w-8">✅ {yesVotes.length}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: totalWeight > 0 ? `${(yesWeight / totalWeight) * 100}%` : "0%" }} />
                        </div>
                        <span className="text-xs text-gray-400 w-12">{totalWeight > 0 ? ((yesWeight / totalWeight) * 100).toFixed(0) : 0}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-red-500 w-8">❌ {noVotes.length}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: totalWeight > 0 ? `${(noWeight / totalWeight) * 100}%` : "0%" }} />
                        </div>
                        <span className="text-xs text-gray-400 w-12">{totalWeight > 0 ? ((noWeight / totalWeight) * 100).toFixed(0) : 0}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400 w-8">⬜ {abstainVotes.length}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full">
                          <div className="h-full bg-gray-300 rounded-full" style={{ width: totalWeight > 0 ? `${(abstainWeight / totalWeight) * 100}%` : "0%" }} />
                        </div>
                        <span className="text-xs text-gray-400 w-12">{totalWeight > 0 ? ((abstainWeight / totalWeight) * 100).toFixed(0) : 0}%</span>
                      </div>
                    </div>
                  )}

                  {/* Public voter list — transparency is the product */}
                  {(proposal.votes.length > 0 || notVoted.length > 0) && (
                    <div className="mb-4 bg-gray-50 rounded-lg px-4 py-3 space-y-1.5">
                      {proposal.votes.map((v) => (
                        <div key={v.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">
                            {v.user.name}
                            <span className="text-xs text-gray-400 mr-1">({v.weight.toFixed(1)}%)</span>
                          </span>
                          <span className="text-gray-600">
                            {choiceLabel[v.choice] ?? v.choice}
                            {v.comment && <span className="text-xs text-gray-400 mr-2">— {v.comment}</span>}
                          </span>
                        </div>
                      ))}
                      {notVoted.length > 0 && proposal.status === "OPEN" && (
                        <p className="text-xs text-amber-700 pt-1 border-t border-gray-200">
                          لم يصوّت بعد: {notVoted.map((h) => h.user.name).join("، ")}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Vote buttons */}
                  {isOpen && !myVote && (
                    <div className="space-y-2">
                      <Input
                        placeholder="تعليقك (اختياري)..."
                        value={voteComment[proposal.id] ?? ""}
                        onChange={(e) => setVoteComment((v) => ({ ...v, [proposal.id]: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" onClick={() => handleVote(proposal.id, "YES")} className="flex-1">✅ موافق</Button>
                        <Button variant="danger" size="sm" onClick={() => handleVote(proposal.id, "NO")} className="flex-1">❌ رافض</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleVote(proposal.id, "ABSTAIN")} className="flex-1">⬜ ممتنع</Button>
                      </div>
                    </div>
                  )}

                  {myVote && (
                    <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-600">
                      ✓ صوتك: <strong>{myVote.choice === "YES" ? "موافق" : myVote.choice === "NO" ? "رافض" : "ممتنع"}</strong>
                      {myVote.comment && <span className="mr-2 text-gray-400">— {myVote.comment}</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
