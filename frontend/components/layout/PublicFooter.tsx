import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-charcoal text-ivory/70">
      <div className="gold-divider" />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-sm bg-gold-gradient flex items-center justify-center">
                <span className="font-serif font-bold text-charcoal text-xs">WC</span>
              </div>
              <div>
                <p className="font-serif text-ivory text-sm font-semibold">White-Collar</p>
                <p className="text-gold text-[10px] tracking-widest uppercase">English Care</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-ivory/60 max-w-xs">
              Career and Academic English coaching for professionals and students who demand excellence.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-gold text-xs tracking-widest uppercase mb-4 font-medium">Navigation</p>
            <div className="flex flex-col gap-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About Us" },
                { href: "/events", label: "Events" },
                { href: "/gallery", label: "Gallery" },
                { href: "/contact", label: "Contact" },
                { href: "/login", label: "Student Login" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-ivory/60 hover:text-gold transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-gold text-xs tracking-widest uppercase mb-4 font-medium">Reach Us</p>
            <div className="flex flex-col gap-2.5 text-sm text-ivory/60">
              <p>Chattogram, Bangladesh</p>
              <p>info@whitecollaren.com</p>
              <p>+880 1XXX-XXXXXX</p>
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
