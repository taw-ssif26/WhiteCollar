"use client";

import { useEffect, useState } from "react";
import { publicAPI } from "@/lib/api";
import { Trophy, Star } from "lucide-react";

const CATEGORIES = ["All", "SSC", "HSC", "BCS", "Admission", "Other"];

const MOCK_ENTRIES = [
  { id: "1", student_name: "Nusrat Jahan", achievement: "SSC GPA 5.0 — Board Stand", category: "SSC", description: "Scored the highest in English in her entire school. Full marks in both papers.", photo_url: null, year: 2024 },
  { id: "2", student_name: "Rafiul Islam", achievement: "HSC A+ — English First & Second Paper", category: "HSC", description: "Improved from C to A+ in one year of preparation at White-Collar.", photo_url: null, year: 2024 },
  { id: "3", student_name: "Tanvir Ahmed", achievement: "BCS 44th — Administration Cadre", category: "BCS", description: "Cleared BCS English section with the highest score in his coaching batch.", photo_url: null, year: 2023 },
  { id: "4", student_name: "Sumaiya Akter", achievement: "CUET Admission — Engineering", category: "Admission", description: "Secured admission to CUET Civil Engineering after intensive admission coaching.", photo_url: null, year: 2024 },
  { id: "5", student_name: "Arman Hossain", achievement: "SSC GPA 5.0", category: "SSC", description: "Weak in English before joining. Achieved full GPA after two terms.", photo_url: null, year: 2023 },
  { id: "6", student_name: "Fahmida Begum", achievement: "DU Admission — Dhaka University", category: "Admission", description: "Got into DU English department. Full scholarship recipient.", photo_url: null, year: 2023 },
];

const CATEGORY_COLORS: Record<string, string> = {
  SSC: "bg-blue-100 text-blue-700",
  HSC: "bg-purple-100 text-purple-700",
  BCS: "bg-emerald-100 text-emerald-700",
  Admission: "bg-amber-100 text-amber-700",
  Other: "bg-gray-100 text-gray-600",
};

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
}

export default function HallOfFamePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeYear, setActiveYear] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      publicAPI.hallOfFame(),
      publicAPI.hallOfFameYears(),
    ])
      .then(([entriesRes, yearsRes]) => {
        setEntries(entriesRes.data.length > 0 ? entriesRes.data : MOCK_ENTRIES);
        setYears(yearsRes.data.length > 0 ? yearsRes.data : [2024, 2023]);
      })
      .catch(() => {
        setEntries(MOCK_ENTRIES);
        setYears([2024, 2023]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter((e) => {
    const catMatch = activeCategory === "All" || e.category === activeCategory;
    const yearMatch = activeYear === 0 || e.year === activeYear;
    return catMatch && yearMatch;
  });

  return (
    <div className="bg-ivory pt-16">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-charcoal py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)", backgroundSize: "24px 24px" }} />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-gradient" />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm bg-gold/10 border border-gold/30 mb-6">
            <Trophy size={28} className="text-gold" />
          </div>
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-4">Excellence Recognised</p>
          <h1 className="font-serif text-ivory text-5xl sm:text-6xl font-semibold mb-4">
            Hall of Fame
          </h1>
          <div className="gold-divider max-w-xs mx-auto mt-4 mb-6" />
          <p className="text-ivory/60 text-base max-w-xl mx-auto">
            Every name here represents a student who walked in with a goal and walked out with a result. These are their stories.
          </p>
        </div>
      </section>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <section className="bg-cream border-b border-cream-dark sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center gap-3">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-all ${
                  activeCategory === cat
                    ? "bg-charcoal text-ivory border-charcoal"
                    : "border-cream-dark text-charcoal/60 hover:border-gold/50 hover:text-gold bg-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Year filter */}
          {years.length > 0 && (
            <select
              value={activeYear}
              onChange={(e) => setActiveYear(parseInt(e.target.value))}
              className="ml-auto border border-cream-dark rounded-sm px-3 py-1.5 text-xs text-charcoal/70 focus:outline-none focus:border-gold bg-white"
            >
              <option value={0}>All Years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
        </div>
      </section>

      {/* ── Entries ───────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-cream rounded-sm animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Trophy size={40} className="text-gold/30 mx-auto mb-4" />
            <p className="font-serif text-charcoal/50 text-xl">No entries found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((entry, idx) => (
              <div
                key={entry.id}
                className="group bg-white border border-cream-dark rounded-sm shadow-premium hover:shadow-premium-lg hover:border-gold/30 transition-all duration-300 overflow-hidden"
              >
                {/* Top gold accent */}
                <div className="h-1 bg-gold-gradient" />

                <div className="p-6">
                  {/* Photo or initials */}
                  <div className="flex items-start gap-4 mb-4">
                    {entry.photo_url ? (
                      <img
                        src={entry.photo_url}
                        alt={entry.student_name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gold/30 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-charcoal-light border-2 border-gold/20 flex items-center justify-center shrink-0">
                        <span className="font-serif text-gold text-lg font-semibold">
                          {getInitials(entry.student_name)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-charcoal font-semibold text-base leading-tight">
                        {entry.student_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[entry.category] || CATEGORY_COLORS["Other"]}`}>
                          {entry.category}
                        </span>
                        <span className="text-charcoal/40 text-xs">{entry.year}</span>
                      </div>
                    </div>
                    {/* Trophy for top entries */}
                    {idx < 3 && (
                      <Trophy size={16} className="text-gold shrink-0 mt-1" />
                    )}
                  </div>

                  {/* Achievement */}
                  <div className="bg-cream rounded-sm px-3 py-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Star size={11} className="text-gold fill-gold shrink-0" />
                      <p className="text-charcoal font-medium text-sm">{entry.achievement}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {entry.description && (
                    <p className="text-charcoal/60 text-xs leading-relaxed italic">
                      "{entry.description}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="bg-charcoal py-16">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="gold-divider mb-8 max-w-xs mx-auto" />
          <h2 className="font-serif text-ivory text-2xl font-semibold mb-3">
            Your name could be here next.
          </h2>
          <p className="text-ivory/50 text-sm mb-6">
            Every achiever started with the right preparation.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-charcoal text-sm font-semibold rounded-sm hover:bg-gold-light transition-colors"
          >
            Start Today
          </a>
          <div className="gold-divider mt-8 max-w-xs mx-auto" />
        </div>
      </section>
    </div>
  );
}
