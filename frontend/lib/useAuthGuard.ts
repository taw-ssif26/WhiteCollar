"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, clearAuth, type Role } from "@/lib/auth";

export function useAuthGuard(requiredRole: Role) {
  const router = useRouter();
  const [auth, setAuth] = useState<{ name: string; role: Role } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = getAuth();
    if (!stored || stored.role !== requiredRole) {
      router.replace("/login");
      return;
    }
    setAuth({ name: stored.name, role: stored.role });
    setChecking(false);
  }, [requiredRole, router]);

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  return { auth, checking, logout };
}
