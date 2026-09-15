"use client";

import { useEffect, useState } from "react";
import { reviewsAdminAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { CheckCircle, Trash2, Star, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  const load = () => {
    setLoading(true);
    reviewsAdminAPI.list().then((r) => setReviews(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string) => {
    await reviewsAdminAPI.approve(id);
    toast("Review approved and published.");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await reviewsAdminAPI.delete(id);
    toast("Review deleted.", "info");
    load();
  };

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.is_approved;
    if (filter === "approved") return r.is_approved;
    return true;
  });

  const pending = reviews.filter((r) => !r.is_approved).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-charcoal text-3xl font-semibold">Reviews</h1>
        <p className="text-charcoal/50 text-sm mt-1">
          {reviews.length} total · {pending} pending approval
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["pending", "approved", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-sm border transition-all capitalize ${
              filter === f
                ? "bg-charcoal text-ivory border-charcoal"
                : "border-cream-dark text-charcoal/60 hover:border-gold/50"
            }`}
          >
            {f} {f === "pending" && pending > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-gold text-charcoal text-[10px] rounded-full font-bold">{pending}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-cream rounded-sm animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-cream-dark rounded-sm">
          <MessageSquare size={40} className="text-gold/30 mx-auto mb-4" />
          <p className="text-charcoal/40">No reviews here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((rv) => (
            <div
              key={rv.id}
              className={`bg-white border rounded-sm shadow-premium p-5 ${
                !rv.is_approved ? "border-gold/30" : "border-cream-dark"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-charcoal">{rv.name}</p>
                    {!rv.is_approved && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-semibold">PENDING</span>
                    )}
                    {rv.is_approved && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">PUBLISHED</span>
                    )}
                  </div>
                  <p className="text-gold text-xs mb-1">{rv.role}</p>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < rv.rating ? "text-gold fill-gold" : "text-charcoal/20"} />
                    ))}
                  </div>
                  <p className="text-charcoal/70 text-sm leading-relaxed italic">"{rv.text}"</p>
                  <p className="text-charcoal/30 text-xs mt-2">{formatDate(rv.created_at)}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {!rv.is_approved && (
                    <button
                      onClick={() => handleApprove(rv.id)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-emerald-200 text-emerald-600 text-xs rounded-sm hover:bg-emerald-50 transition-colors"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(rv.id)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-500 text-xs rounded-sm hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
