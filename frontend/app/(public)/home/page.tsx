"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Award, Users, TrendingUp, CheckCircle, ArrowRight, Star, X } from "lucide-react";
import { publicAPI } from "@/lib/api";

export default function HomePage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", role: "", text: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    publicAPI.reviews()
      .then((r) => setReviews(r.data))
      .catch(() => {});
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    setSubmitting(true);
    try {
      await publicAPI.submitReview(reviewForm);
      setReviewSubmitted(true);
      setReviewForm({ name: "", role: "", text: "", rating: 5 });
    } catch (err: any) {
      setReviewError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-ivory">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-charcoal flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)", backgroundSize: "24px 24px" }} />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-gradient" />
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-3xl animate-fade-up">
            <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-6">SSC · HSC · BCS · Admission</p>
            <h1 className="font-serif text-ivory text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.1] mb-8">
              English that opens<br /><span className="italic text-gold">every door.</span>
            </h1>
            <p className="text-ivory/60 text-lg leading-relaxed max-w-xl mb-10">
              White-Collar English Care prepares students for SSC, HSC, BCS, and university admissions with structured Academic English — not just fluency, but distinction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gold text-charcoal text-sm font-semibold rounded-sm hover:bg-gold-light transition-colors">
                Enquire Now <ArrowRight size={16} />
              </Link>
              <Link href="/about" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-ivory/20 text-ivory text-sm font-medium rounded-sm hover:border-ivory/50 transition-colors">
                Learn More
              </Link>
            </div>
          </div>
          <div className="mt-20 grid grid-cols-3 gap-8 border-t border-ivory/10 pt-10 max-w-lg">
            {[
              { value: "300+", label: "Students Taught" },
              { value: "95%", label: "Pass Rate" },
              { value: "5+", label: "Years of Excellence" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-gold text-3xl font-semibold">{stat.value}</p>
                <p className="text-ivory/50 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programmes ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">Programmes</p>
          <h2 className="font-serif text-charcoal text-4xl font-semibold">What we teach</h2>
          <div className="gold-divider max-w-xs mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <BookOpen size={22} className="text-gold" />, title: "SSC English", desc: "Complete preparation for Secondary School Certificate — grammar, composition, comprehension, and exam technique." },
            { icon: <Award size={22} className="text-gold" />, title: "HSC English", desc: "Higher Secondary English with focus on formal writing, unseen passages, and board exam patterns." },
            { icon: <TrendingUp size={22} className="text-gold" />, title: "BCS English", desc: "Targeted BCS preliminary and written — vocabulary, grammar, translation, and précis writing." },
            { icon: <Users size={22} className="text-gold" />, title: "Admission English", desc: "University and medical admission English — DU, CUET, medical clusters. Question patterns and mock sessions." },
          ].map((item) => (
            <div key={item.title} className="p-6 border border-cream-dark bg-white rounded-sm hover:shadow-premium-lg hover:border-gold/30 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-sm bg-cream flex items-center justify-center mb-4 group-hover:bg-gold/10 transition-colors">{item.icon}</div>
              <h3 className="font-serif text-charcoal text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-charcoal/60 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why White-Collar ──────────────────────────────────────────────── */}
      <section className="bg-charcoal py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">Our Difference</p>
              <h2 className="font-serif text-ivory text-4xl font-semibold leading-tight mb-6">
                Why students<br /><span className="italic">choose us.</span>
              </h2>
              <p className="text-ivory/60 text-base leading-relaxed mb-8">
                We don't just teach English — we teach the English that exam boards, universities, and the BCS commission demand. Structured, tested, proven.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  "Small batch sizes — personal attention guaranteed",
                  "Exam-pattern focused lessons for SSC, HSC, BCS & admissions",
                  "Regular mock tests with detailed written feedback",
                  "Dedicated instructor for each batch",
                  "Progress tracked and reported to students & parents",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-gold mt-0.5 shrink-0" />
                    <p className="text-ivory/70 text-sm">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border border-gold/20 rounded-sm" />
              <div className="bg-charcoal-light border border-charcoal-muted rounded-sm p-8">
                <p className="text-gold text-xs tracking-widest uppercase mb-4">Student snapshot</p>
                <div className="space-y-5">
                  {[
                    { label: "SSC A+ achievers", sub: "From our batches this year", pct: 78 },
                    { label: "HSC pass rate", sub: "Students completing full course", pct: 94 },
                    { label: "BCS prelim pass", sub: "English section average", pct: 88 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-ivory/80 text-sm font-medium">{item.label}</span>
                        <span className="text-gold text-sm font-semibold">{item.pct}%</span>
                      </div>
                      <div className="h-1 bg-charcoal-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gold-gradient rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                      <p className="text-ivory/40 text-xs mt-1">{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ───────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">Voices</p>
          <h2 className="font-serif text-charcoal text-4xl font-semibold">From our students</h2>
          <div className="gold-divider max-w-xs mx-auto mt-4" />
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 text-charcoal/40 text-sm">
            No reviews yet. Be the first to share your experience.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {reviews.map((rv) => (
              <div key={rv.id} className="p-6 border border-cream-dark bg-white rounded-sm shadow-premium">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < rv.rating ? "text-gold fill-gold" : "text-charcoal/20"} />
                  ))}
                </div>
                <p className="text-charcoal/70 text-sm leading-relaxed mb-5 italic">"{rv.text}"</p>
                <div className="border-t border-cream-dark pt-4">
                  <p className="font-medium text-charcoal text-sm">{rv.name}</p>
                  <p className="text-charcoal/50 text-xs mt-0.5">{rv.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit review button */}
        <div className="text-center">
          <button
            onClick={() => setShowReviewForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gold/50 text-gold text-sm font-medium rounded-sm hover:bg-gold hover:text-charcoal transition-all"
          >
            <Star size={15} /> Share Your Experience
          </button>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-charcoal py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="gold-divider mb-8 max-w-xs mx-auto" />
          <h2 className="font-serif text-ivory text-3xl sm:text-4xl font-semibold leading-tight mb-5">Ready to begin?</h2>
          <p className="text-ivory/60 text-base mb-8">Every great result starts with the right preparation. Yours starts here.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-charcoal text-sm font-semibold rounded-sm hover:bg-gold-light transition-colors">
            Get in Touch <ArrowRight size={16} />
          </Link>
          <div className="gold-divider mt-8 max-w-xs mx-auto" />
        </div>
      </section>

      {/* ── Review submission modal ───────────────────────────────────────── */}
      {showReviewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowReviewForm(false); setReviewSubmitted(false); }} />
          <div className="relative bg-white rounded-sm shadow-premium-lg w-full max-w-md animate-fade-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark">
              <h2 className="font-serif text-charcoal font-semibold">Share Your Experience</h2>
              <button onClick={() => { setShowReviewForm(false); setReviewSubmitted(false); }} className="text-charcoal/40 hover:text-charcoal">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              {reviewSubmitted ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle size={40} className="text-gold" />
                  <h3 className="font-serif text-charcoal font-semibold text-lg">Thank you!</h3>
                  <p className="text-charcoal/60 text-sm">Your review has been submitted and will appear after approval.</p>
                  <button onClick={() => { setShowReviewForm(false); setReviewSubmitted(false); }} className="mt-2 text-gold text-sm hover:underline">Close</button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                  {/* Star rating */}
                  <div>
                    <label className="block text-xs text-charcoal/50 uppercase tracking-wider mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="focus:outline-none"
                        >
                          <Star
                            size={24}
                            className={star <= reviewForm.rating ? "text-gold fill-gold" : "text-charcoal/20"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {[
                    { key: "name", label: "Your Name", placeholder: "Rafiul Islam" },
                    { key: "role", label: "Your Result / Role", placeholder: "SSC 2024 — GPA 5.0  /  BCS 44th Batch" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs text-charcoal/50 uppercase tracking-wider mb-1.5">{label}</label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        required
                        value={reviewForm[key as keyof typeof reviewForm] as string}
                        onChange={(e) => setReviewForm({ ...reviewForm, [key]: e.target.value })}
                        className="w-full border border-cream-dark rounded-sm px-3 py-2.5 text-sm text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-gold"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs text-charcoal/50 uppercase tracking-wider mb-1.5">Your Review</label>
                    <textarea
                      rows={4}
                      placeholder="Share your experience at White-Collar English Care..."
                      required
                      value={reviewForm.text}
                      onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                      className="w-full border border-cream-dark rounded-sm px-3 py-2.5 text-sm text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-gold resize-none"
                    />
                  </div>

                  {reviewError && (
                    <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-sm px-3 py-2">{reviewError}</p>
                  )}
                  <p className="text-charcoal/40 text-xs">Reviews appear after admin approval.</p>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-charcoal text-ivory text-sm font-medium rounded-sm hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {submitting ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : "Submit Review"}
                    </button>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2.5 border border-cream-dark text-charcoal/60 text-sm rounded-sm hover:border-gold/50">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
