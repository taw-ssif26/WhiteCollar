"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { authAPI } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"student" | "admin">("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fn = tab === "admin" ? authAPI.adminLogin : authAPI.studentLogin;
      const res = await fn(username, password);
      const { access_token, role, name } = res.data;
      saveAuth({ token: access_token, role, name });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center px-4">
      {/* Subtle texture */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-sm bg-gold-gradient flex items-center justify-center">
              <span className="font-serif font-bold text-charcoal text-lg">WC</span>
            </div>
            <p className="font-serif text-ivory text-lg font-semibold">White-Collar</p>
            <p className="text-gold text-[10px] tracking-[0.3em] uppercase">English Care</p>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-charcoal-light border border-charcoal-muted rounded-sm shadow-premium-lg p-8">
          {/* Tabs */}
          <div className="flex mb-8 border-b border-charcoal-muted">
            {(["student", "admin"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setUsername(""); setPassword(""); }}
                className={`flex-1 pb-3 text-sm font-medium capitalize transition-colors relative ${
                  tab === t ? "text-gold" : "text-ivory/40 hover:text-ivory/70"
                }`}
              >
                {t === "student" ? "Student Login" : "Admin Login"}
                {tab === t && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-gold" />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs text-ivory/40 uppercase tracking-wider mb-1.5">
                {tab === "student" ? "Student ID" : "Username"}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={tab === "student" ? "e.g. WC-2025-001" : "admin"}
                required
                autoComplete="username"
                className="w-full bg-charcoal border border-charcoal-muted rounded-sm px-4 py-2.5 text-ivory text-sm placeholder-ivory/20 focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-ivory/40 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-charcoal border border-charcoal-muted rounded-sm px-4 py-2.5 pr-10 text-ivory text-sm placeholder-ivory/20 focus:outline-none focus:border-gold transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory/70"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gold text-charcoal text-sm font-semibold rounded-sm hover:bg-gold-light disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-1"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} /> Sign In
                </>
              )}
            </button>

            {tab === "student" && (
              <p className="text-center text-xs text-ivory/30">
                Your Student ID and initial password are provided by your instructor.
              </p>
            )}
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-ivory/30 text-xs hover:text-ivory/60 transition-colors">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
