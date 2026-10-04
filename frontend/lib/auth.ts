"use client";

export type Role = "admin" | "student";

export interface AuthUser {
  token: string;
  role: Role;
  name: string;
}

export function saveAuth(user: AuthUser) {
  localStorage.setItem("wc_token", user.token);
  localStorage.setItem("wc_role", user.role);
  localStorage.setItem("wc_name", user.name);
}

export function getAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("wc_token");
  const role = localStorage.getItem("wc_role") as Role | null;
  const name = localStorage.getItem("wc_name");
  if (!token || !role) return null;
  return { token, role, name: name || "" };
}

export function clearAuth() {
  localStorage.removeItem("wc_token");
  localStorage.removeItem("wc_role");
  localStorage.removeItem("wc_name");
}

export function redirectAfterLogin(role: Role): string {
  return role === "admin" ? "/dashboard" : "/dashboard";
}
