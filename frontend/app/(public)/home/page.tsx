import Link from "next/link";
import { BookOpen, Award, Users, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-ivory">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-charcoal flex items-center overflow-hidden">
        {/* Subtle gold texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Gold accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-gradient" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-3xl animate-fade-up">
            <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-6">
              Career · Academic · Professional
            </p>
            <h1 className="font-serif text-ivory text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.1] mb-8">
              English that opens
              <br />
              <span className="italic text-gold">every door.</span>
            </h1>
            <p className="text-ivory/60 text-lg leading-relaxed max-w-xl mb-10">
              White-Collar English Care prepares professionals and students for
              careers, examinations, and communication that demands precision.
              Not just fluency — distinction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gold text-charcoal text-sm font-semibold rounded-sm hover:bg-gold-light transition-colors"
              >
                Enquire Now <ArrowRight size={16} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-ivory/20 text-ivory text-sm font-medium rounded-sm hover:border-ivory/50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 border-t border-ivory/10 pt-10 max-w-lg">
            {[
              { value: "500+", label: "Students Trained" },
              { value: "95%", label: "Exam Pass Rate" },
              { value: "8+", label: "Years of Excellence" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-gold text-3xl font-semibold">{stat.value}</p>
                <p className="text-ivory/50 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What We Offer ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">
            Programmes
          </p>
          <h2 className="font-serif text-charcoal text-4xl font-semibold">
            What we teach
          </h2>
          <div className="gold-divider max-w-xs mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <TrendingUp size={22} className="text-gold" />,
              title: "Corporate English",
              desc: "Boardroom presentation, business writing, and professional correspondence for career advancement.",
            },
            {
              icon: <BookOpen size={22} className="text-gold" />,
              title: "IELTS Preparation",
              desc: "Structured band-score strategies for speaking, writing, reading, and listening modules.",
            },
            {
              icon: <Award size={22} className="text-gold" />,
              title: "Academic English",
              desc: "Essay writing, critical analysis, and university-level academic communication skills.",
            },
            {
              icon: <Users size={22} className="text-gold" />,
              title: "Spoken Fluency",
              desc: "Pronunciation refinement, conversational confidence, and real-world communication practice.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-6 border border-cream-dark bg-white rounded-sm hover:shadow-premium-lg hover:border-gold/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-sm bg-cream flex items-center justify-center mb-4 group-hover:bg-gold/10 transition-colors">
                {item.icon}
              </div>
              <h3 className="font-serif text-charcoal text-lg font-semibold mb-2">
                {item.title}
              </h3>
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
              <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">
                Our Difference
              </p>
              <h2 className="font-serif text-ivory text-4xl font-semibold leading-tight mb-6">
                Why professionals
                <br />
                <span className="italic">choose us.</span>
              </h2>
              <p className="text-ivory/60 text-base leading-relaxed mb-8">
                We don't teach English. We teach the English that matters — in
                your industry, for your goals, at the level your career demands.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  "Small batch sizes — maximum 12 per class",
                  "Industry-specific vocabulary and writing",
                  "Regular mock tests with detailed feedback",
                  "Dedicated instructor for each batch",
                  "Progress tracked and reported to students",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-gold mt-0.5 shrink-0" />
                    <p className="text-ivory/70 text-sm">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual block */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border border-gold/20 rounded-sm" />
              <div className="bg-charcoal-light border border-charcoal-muted rounded-sm p-8">
                <p className="text-gold text-xs tracking-widest uppercase mb-4">Student snapshot</p>
                <div className="space-y-5">
                  {[
                    { label: "IELTS 7.5+", sub: "18 students this year", pct: 72 },
                    { label: "Corporate placements", sub: "After completing programme", pct: 88 },
                    { label: "Exam attendance", sub: "Average batch", pct: 94 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-ivory/80 text-sm font-medium">{item.label}</span>
                        <span className="text-gold text-sm font-semibold">{item.pct}%</span>
                      </div>
                      <div className="h-1 bg-charcoal-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold-gradient rounded-full"
                          style={{ width: `${item.pct}%` }}
                        />
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

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">Voices</p>
          <h2 className="font-serif text-charcoal text-4xl font-semibold">
            From our students
          </h2>
          <div className="gold-divider max-w-xs mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Rafiul Hasan",
              role: "Assistant Manager, BRAC Bank",
              text: "The corporate communication module transformed how I present ideas in meetings. My manager noticed the difference within weeks.",
            },
            {
              name: "Nusrat Jahan",
              role: "IELTS Band 7.5, Now in Canada",
              text: "I failed IELTS twice before joining White-Collar. The structured approach and mock tests made all the difference. Grateful.",
            },
            {
              name: "Tanvir Ahmed",
              role: "Final Year, CUET",
              text: "The academic writing sessions are exactly what university demanded. Clear, methodical, and taught with patience.",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="p-6 border border-cream-dark bg-white rounded-sm shadow-premium"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-gold text-sm">★</span>
                ))}
              </div>
              <p className="text-charcoal/70 text-sm leading-relaxed mb-5 italic">
                "{t.text}"
              </p>
              <div className="border-t border-cream-dark pt-4">
                <p className="font-medium text-charcoal text-sm">{t.name}</p>
                <p className="text-charcoal/50 text-xs mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="bg-charcoal py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="gold-divider mb-8 max-w-xs mx-auto" />
          <h2 className="font-serif text-ivory text-3xl sm:text-4xl font-semibold leading-tight mb-5">
            Ready to begin?
          </h2>
          <p className="text-ivory/60 text-base mb-8">
            Every great career is built on clear communication. Yours starts here.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-charcoal text-sm font-semibold rounded-sm hover:bg-gold-light transition-colors"
          >
            Get in Touch <ArrowRight size={16} />
          </Link>
          <div className="gold-divider mt-8 max-w-xs mx-auto" />
        </div>
      </section>
    </div>
  );
}
