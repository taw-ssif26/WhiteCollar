import { Award, BookOpen, Heart, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-ivory pt-16">
      {/* Hero */}
      <section className="bg-charcoal py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-4">About Us</p>
          <h1 className="font-serif text-ivory text-5xl font-semibold max-w-2xl leading-tight">
            Built on the belief that language is{" "}
            <span className="italic text-gold">leverage.</span>
          </h1>
          <div className="gold-divider max-w-sm mt-8" />
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-4">Our Mission</p>
            <h2 className="font-serif text-charcoal text-3xl font-semibold leading-tight mb-6">
              We close the gap between knowledge and expression.
            </h2>
            <p className="text-charcoal/70 leading-relaxed mb-4">
              White-Collar English Care was founded with a single conviction: that thousands of
              talented, intelligent Bangladeshis are held back not by their ideas — but by their
              inability to express those ideas in English with confidence.
            </p>
            <p className="text-charcoal/70 leading-relaxed">
              We exist to fix that. Through disciplined teaching, rigorous practice, and
              genuine attention to each student, we build communicators who are taken seriously
              — in boardrooms, universities, and on the global stage.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Target size={20} className="text-gold" />, label: "Precision", desc: "Every lesson has a clear outcome" },
              { icon: <BookOpen size={20} className="text-gold" />, label: "Depth", desc: "We go beyond surface fluency" },
              { icon: <Heart size={20} className="text-gold" />, label: "Care", desc: "Every student's progress matters" },
              { icon: <Award size={20} className="text-gold" />, label: "Results", desc: "We measure success by outcomes" },
            ].map((v) => (
              <div key={v.label} className="p-5 bg-white border border-cream-dark rounded-sm shadow-premium">
                <div className="w-9 h-9 bg-cream rounded-sm flex items-center justify-center mb-3">
                  {v.icon}
                </div>
                <p className="font-serif font-semibold text-charcoal mb-1">{v.label}</p>
                <p className="text-charcoal/60 text-xs">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-cream py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">Faculty</p>
            <h2 className="font-serif text-charcoal text-4xl font-semibold">Our instructors</h2>
            <div className="gold-divider max-w-xs mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Mr. Ariful Islam",
                role: "Director & Lead Instructor",
                qual: "MA in English Literature, University of Chittagong",
                exp: "12 years in professional English training",
              },
              {
                name: "Ms. Sumaiya Begum",
                role: "IELTS Specialist",
                qual: "Certified IELTS Trainer, British Council",
                exp: "8 years preparing candidates for band 7+",
              },
              {
                name: "Mr. Tariqul Hasan",
                role: "Corporate Communication",
                qual: "MBA, IBA Dhaka — Former HR, multinational sector",
                exp: "10 years in business English training",
              },
            ].map((member) => (
              <div key={member.name} className="bg-white border border-cream-dark rounded-sm p-6 shadow-premium">
                {/* Placeholder avatar */}
                <div className="w-16 h-16 rounded-full bg-charcoal-light flex items-center justify-center mb-4">
                  <span className="font-serif text-gold text-xl font-semibold">
                    {member.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <h3 className="font-serif text-charcoal font-semibold">{member.name}</h3>
                <p className="text-gold text-xs font-medium mt-0.5 mb-3">{member.role}</p>
                <p className="text-charcoal/60 text-xs leading-relaxed mb-1">{member.qual}</p>
                <p className="text-charcoal/50 text-xs">{member.exp}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
