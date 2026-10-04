"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";

export default function DashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }
    if (auth.role === "admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/student/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );
}
