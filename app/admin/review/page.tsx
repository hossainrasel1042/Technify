"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDashboard } from "@/context/dashboardContext"; // <-- Import context
import { Star, CheckCircle2, Trash2, Loader2, Pencil, X } from "lucide-react";

// Updated rating to accept number or string to match both context and form state
type Review = {
  id: string;
  client_name: string;
  role_company: string;
  rating: string | number; 
  review_text: string;
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  review,
  onClose,
  onUpdated,
}: {
  review: Review;
  onClose: () => void;
  onUpdated: () => void; // Changed to trigger global refresh
}) {
  const [form, setForm] = useState({
    client_name: review.client_name,
    role_company: review.role_company,
    rating: String(review.rating),
    review_text: review.review_text,
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[oklch(0.55_0.2_170)] focus:ring-1 focus:ring-[oklch(0.55_0.2_170)]/20 transition-all";

  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch("/api/review", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: review.id, ...form }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdated(); // Trigger context refresh
        onClose();
      } else {
        setError(data.message ?? "Failed to update review.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Edit Review</h2>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">
                Client Name
              </label>
              <input
                name="client_name"
                value={form.client_name}
                onChange={handle}
                className={inputCls}
                required
                disabled={updating}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">
                Role / Company
              </label>
              <input
                name="role_company"
                value={form.role_company}
                onChange={handle}
                className={inputCls}
                disabled={updating}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={updating}
                  onClick={() => setForm((p) => ({ ...p, rating: String(n) }))}
                  className="transition-transform hover:scale-110 disabled:opacity-50"
                >
                  <Star
                    className="w-6 h-6"
                    style={{
                      color:
                        n <= Number(form.rating)
                          ? "oklch(0.55 0.2 170)"
                          : "transparent",
                      fill:
                        n <= Number(form.rating)
                          ? "oklch(0.55 0.2 170)"
                          : "oklch(1 0 0 / 0.1)",
                      strokeWidth: n <= Number(form.rating) ? 0 : 1.5,
                      stroke:
                        n <= Number(form.rating)
                          ? "none"
                          : "oklch(1 0 0 / 0.2)",
                    }}
                  />
                </button>
              ))}
              <span className="text-sm text-white/40 ml-2 self-center">
                {form.rating} / 5
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">
              Review Text
            </label>
            <textarea
              name="review_text"
              value={form.review_text}
              onChange={handle}
              rows={4}
              className={`${inputCls} resize-none`}
              required
              disabled={updating}
            />
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={updating}
              className="h-10 px-5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="h-10 px-5 rounded-lg text-sm font-medium text-black flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-70"
              style={{ background: "oklch(0.55 0.2 170)" }}
            >
              {updating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
              ) : (
                <>Update Review</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get("view") || "add";

  // Use the context instead of local state for fetching and storing reviews
  const { reviews, loading, refreshData } = useDashboard();

  const [form, setForm] = useState({
    client_name: "",
    role_company: "",
    rating: "5",
    review_text: "",
  });
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false); 
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const handle = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await refreshData(); // Refresh context upon success
        setSaved(true);
        setForm({ client_name: "", role_company: "", rating: "5", review_text: "" });
        setTimeout(() => {
          setSaved(false);
          router.push("?view=manage");
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/review?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await refreshData(); // Refresh context instead of manual filtering
      }
    } catch (err) {
      console.error("Failed to delete review", err);
    }
  };

  // Called by modal after a successful PUT
  const handleUpdated = () => {
    refreshData(); // Refresh context instead of manual mapping
  };

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[oklch(0.55_0.2_170)] focus:ring-1 focus:ring-[oklch(0.55_0.2_170)]/20 transition-all";

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      {/* Edit modal */}
      {editingReview && (
        <EditModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onUpdated={handleUpdated}
        />
      )}

      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          {view === "manage" ? "Manage Reviews" : "Add Review"}
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {view === "manage"
            ? "View and manage client testimonials."
            : "Add a client testimonial to your site."}
        </p>
      </div>

      {view === "add" ? (
        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">
                Client Name
              </label>
              <input
                name="client_name"
                value={form.client_name}
                onChange={handle}
                placeholder="Sarah K."
                className={inputCls}
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">
                Role / Company
              </label>
              <input
                name="role_company"
                value={form.role_company}
                onChange={handle}
                placeholder="CEO, RetailCo"
                className={inputCls}
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    setForm((p) => ({ ...p, rating: String(n) }))
                  }
                  className="transition-transform hover:scale-110 disabled:opacity-50"
                >
                  <Star
                    className="w-6 h-6"
                    style={{
                      color:
                        n <= Number(form.rating)
                          ? "oklch(0.55 0.2 170)"
                          : "transparent",
                      fill:
                        n <= Number(form.rating)
                          ? "oklch(0.55 0.2 170)"
                          : "oklch(1 0 0 / 0.1)",
                      strokeWidth: n <= Number(form.rating) ? 0 : 1.5,
                      stroke:
                        n <= Number(form.rating)
                          ? "none"
                          : "oklch(1 0 0 / 0.2)",
                    }}
                  />
                </button>
              ))}
              <span className="text-sm text-white/40 ml-2 self-center">
                {form.rating} / 5
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 tracking-widest mb-2 uppercase">
              Review Text
            </label>
            <textarea
              name="review_text"
              value={form.review_text}
              onChange={handle}
              rows={4}
              placeholder="The team delivered an exceptional product…"
              className={`${inputCls} resize-none`}
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 rounded-lg text-sm font-medium text-black transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 self-start disabled:opacity-70"
            style={{ background: "oklch(0.55 0.2 170)" }}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            ) : (
              <><Star className="w-4 h-4" fill="black" /> Add Review</>
            )}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center text-white/50 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-white/40 text-sm p-4 bg-white/5 rounded-lg border border-white/10">
              No reviews found.
            </div>
          ) : (
            (reviews as Review[]).map((review) => (
              <div
                key={review.id}
                className="bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col sm:flex-row gap-4 justify-between items-start transition-colors hover:border-white/20"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">
                      {review.client_name}
                    </h3>
                    <span className="text-white/40 text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                      {review.role_company}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3"
                        style={{
                          fill:
                            i < Number(review.rating)
                              ? "oklch(0.55 0.2 170)"
                              : "transparent",
                          color:
                            i < Number(review.rating)
                              ? "oklch(0.55 0.2 170)"
                              : "oklch(1 0 0 / 0.2)",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">
                    "{review.review_text}"
                  </p>
                </div>

                {/* Edit + Delete buttons */}
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditingReview(review)}
                    className="text-white/30 hover:text-blue-400 p-2 rounded-lg hover:bg-blue-400/10 transition-colors"
                    title="Edit Review"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-white/30 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="text-white/50 text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}
