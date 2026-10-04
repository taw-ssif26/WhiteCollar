"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Receipt, LogOut, X, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/student/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { href: "/student/results", icon: <FileText size={18} />, label: "My Results" },
  { href: "/student/invoices", icon: <Receipt size={18} />, label: "Invoices" },
  { href: "/student/profile", icon: <UserCircle size={18} />, label: "My Profile" },
];

interface Props {
  studentName: string;
  onLogout: () => void;
  onClose?: () => void;
}

export default function StudentSidebar({ studentName, onLogout, onClose }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-charcoal h-full flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-charcoal-muted flex items-center justify-between">
        <div>
          <p className="font-serif text-ivory text-sm font-semibold">White-Collar</p>
          <p className="text-gold text-[10px] tracking-widest uppercase">Student Portal</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-ivory/40 hover:text-ivory lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Student info */}
      <div className="px-6 py-4 border-b border-charcoal-muted">
        <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center mb-2">
          <span className="text-gold text-sm font-semibold font-serif">
            {studentName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </span>
        </div>
        <p className="text-ivory text-sm font-medium truncate">{studentName}</p>
        <p className="text-ivory/40 text-xs mt-0.5">Student</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-gold text-charcoal"
                : "text-ivory/60 hover:text-ivory hover:bg-charcoal-light"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-sm text-sm text-ivory/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
