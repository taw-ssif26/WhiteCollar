"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useAuthGuard } from "@/lib/useAuthGuard";
import StudentSidebar from "@/components/student/StudentSidebar";
import { ToastProvider } from "@/components/ui/Toast";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { auth, checking, logout } = useAuthGuard("student");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (checking) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-ivory flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex h-screen sticky top-0">
          <StudentSidebar studentName={auth?.name || ""} onLogout={logout} />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="relative z-50 h-full">
              <StudentSidebar
                studentName={auth?.name || ""}
                onLogout={logout}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile topbar */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-charcoal border-b border-charcoal-muted">
            <button onClick={() => setSidebarOpen(true)} className="text-ivory/60 hover:text-ivory">
              <Menu size={22} />
            </button>
            <p className="font-serif text-ivory text-sm font-semibold">White-Collar</p>
            <p className="text-gold text-[10px] tracking-widest uppercase ml-1">Portal</p>
          </div>

          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
