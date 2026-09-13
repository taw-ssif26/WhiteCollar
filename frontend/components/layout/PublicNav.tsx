"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/home", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-charcoal/95 backdrop-blur-md shadow-premium" : "bg-transparent"
    )}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-sm overflow-hidden border border-gold/30 bg-charcoal-light">
            <Image src="/logo.jpeg" alt="White-Collar Logo" width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <div className="hidden sm:block">
            <p className="font-serif text-ivory text-sm font-semibold leading-tight">White-Collar</p>
            <p className="text-gold text-[10px] tracking-widest font-medium uppercase">English Care</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors relative group",
                pathname === link.href ? "text-gold" : "text-ivory/80 hover:text-ivory"
              )}
            >
              {link.label}
              <span className={cn(
                "absolute -bottom-1 left-0 h-px bg-gold transition-all duration-200",
                pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
              )} />
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2 border border-gold/50 text-gold text-sm font-medium rounded-sm hover:bg-gold hover:text-charcoal transition-all duration-200"
        >
          Student Login
        </Link>

        <button className="md:hidden text-ivory p-1" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-charcoal border-t border-charcoal-muted animate-fade-in">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn("text-sm font-medium py-1", pathname === link.href ? "text-gold" : "text-ivory/80")}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center px-5 py-2.5 border border-gold text-gold text-sm font-medium rounded-sm hover:bg-gold hover:text-charcoal transition-all"
            >
              Student Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
