import Link from "next/link";
import Image from "next/image";

export default function PublicFooter() {
  return (
    <footer className="bg-charcoal text-ivory/70">
      <div className="gold-divider" />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-sm overflow-hidden border border-gold/30 bg-charcoal-light flex items-center justify-center">
                <Image src="/logo.jpeg" alt="White-Collar Logo" width={40} height={40} className="object-cover" />
              </div>
              <div>
                <p className="font-serif text-ivory text-sm font-semibold">White-Collar</p>
                <p className="text-gold text-[10px] tracking-widest uppercase">English Care</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-ivory/60 max-w-xs">
              Career and Academic English coaching for students who demand excellence in SSC, HSC, BCS, and university admissions.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-gold text-xs tracking-widest uppercase mb-4 font-medium">Navigation</p>
            <div className="flex flex-col gap-2.5">
              {[
                { href: "/home", label: "Home" },
                { href: "/about", label: "About Us" },
                { href: "/events", label: "Events" },
                { href: "/gallery", label: "Gallery" },
                { href: "/contact", label: "Contact" },
                { href: "/login", label: "Student Login" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm text-ivory/60 hover:text-gold transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-gold text-xs tracking-widest uppercase mb-4 font-medium">Reach Us</p>
            <div className="flex flex-col gap-2.5 text-sm text-ivory/60">
              <p>7no. Lane, I Block</p>
              <p>Halishahar, Chittagong</p>
              <p>Bangladesh</p>
              <p className="mt-1">+880 1925-242188</p>
              <p className="mt-2 text-ivory/40 text-xs">
                Saturday–Thursday, 9 AM – 8 PM
              </p>
            </div>
          </div>
        </div>

        <div className="gold-divider mt-10 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory/40">
          <p>© {new Date().getFullYear()} White-Collar English Care. All rights reserved.</p>
          <p>Crafted for excellence.</p>
        </div>
      </div>
    </footer>
  );
}
