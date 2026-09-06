"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FileText, Receipt,
  CalendarDays, Image, LogOut, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { href: "/admin/students", icon: <Users size={18} />, label: "Students" },
  { href: "/admin/results", icon: <FileText size={18} />, label: "Results" },
  { href: "/admin/invoices", icon: <Receipt size={18} />, label: "Invoices" },
  { href: "/admin/events", icon: <CalendarDays size={18} />, label: "Events" },
  { href: "/admin/gallery", icon: <Image size={18} />, label: "Gallery" },
];

interface Props {
  onLogout: () => void;
  onClose?: () => void;
}

export default function AdminSidebar({ onLogout, onClose }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-charcoal h-full flex flex-col">
      <div className="px-6 py-5 border-b border-charcoal-muted flex items-center justify-between">
        <div>
          <p className="font-serif text-ivory text-sm font-semibold">White-Collar</p>
          <p className="text-gold text-[10px] tracking-widest uppercase">Admin Panel</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-ivory/40 hover:text-ivory lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors",
              pathname.startsWith(item.href)
                ? "bg-gold text-charcoal"
                : "text-ivory/60 hover:text-ivory hover:bg-charcoal-light"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <div className="px-3 py-2 mb-2">
          <p className="text-ivory/30 text-xs">Signed in as</p>
          <p className="text-ivory/60 text-xs font-medium">Administrator</p>
        </div>
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
