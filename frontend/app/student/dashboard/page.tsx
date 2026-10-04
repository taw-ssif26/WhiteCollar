"use client";

import { useEffect, useState } from "react";
import { studentPortalAPI } from "@/lib/api";
import { formatDate, formatCurrency, getGrade, getInitials } from "@/lib/utils";
import { FileText, Receipt, TrendingUp, CheckCircle, Clock, KeyRound, X } from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Change password modal state
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      studentPortalAPI.profile(),
      studentPortalAPI.results(),
      studentPortalAPI.invoices(),
    ])
      .then(([p, r, i]) => {
        setProfile(p.data);
        setResults(r.data);
        setInvoices(i.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChangePassword = async () => {
    setPwError("");
    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    setPwLoading(true);
    try {
      await studentPortalAPI.changePassword(pwForm.current, pwForm.next);
      setPwSuccess(true);
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (e: any) {
      setPwError(e.response?.data?.detail || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const unpaidInvoices = invoices.filter((i) => !i.is_paid);
  const latestResult = results[0];
  const avgPercentage =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
      : null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <p className="text-charcoal/50 text-sm mb-1">Welcome back,</p>
        <h1 className="font-serif text-charcoal text-3xl font-semibold">{profile?.name}</h1>
      </div>

      {/* Profile card */}
      <div className="bg-charcoal rounded-sm p-6 mb-6 flex flex-col sm:flex-row items-start gap-5">
        {profile?.photo_url ? (
          <img
            src={profile.photo_url}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gold/40 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center shrink-0">
            <span className="font-serif text-gold text-xl font-semibold">
              {getInitials(profile?.name || "")}
            </span>
          </div>
        )}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Student ID", value: profile?.student_id },
            { label: "Batch", value: profile?.batch },
            { label: "Class", value: profile?.class_level },
            { label: "Institution", value: profile?.school_college },
            { label: "Gender", value: profile?.gender },
            { label: "WhatsApp", value: profile?.whatsapp_number },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-ivory/40 text-[10px] uppercase tracking-wider">{f.label}</p>
              <p className="text-ivory text-sm font-medium capitalize">{f.value || "—"}</p>
            </div>
          ))}
        </div>
        {/* Change password button */}
        <button
          onClick={() => { setShowPwModal(true); setPwError(""); setPwSuccess(false); }}
          className="flex items-center gap-2 px-3 py-2 border border-ivory/20 text-ivory/50 text-xs rounded-sm hover:border-gold/50 hover:text-gold transition-colors shrink-0"
        >
          <KeyRound size={13} /> Change Password
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: <FileText size={18} className="text-gold" />, label: "Exams Taken", value: results.length },
          {
            icon: <TrendingUp size={18} className="text-gold" />,
            label: "Avg Score",
            value: avgPercentage !== null ? `${avgPercentage}%` : "—",
          },
          { icon: <Receipt size={18} className="text-gold" />, label: "Total Invoices", value: invoices.length },
          {
            icon: <Clock size={18} className="text-red-400" />,
            label: "Unpaid",
            value: unpaidInvoices.length,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-cream-dark rounded-sm shadow-premium p-4">
            <div className="flex items-center gap-2 mb-2">{stat.icon}</div>
            <p className="font-serif text-charcoal text-2xl font-semibold">{stat.value}</p>
            <p className="text-charcoal/50 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Latest result + unpaid invoices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest result */}
        <div className="bg-white border border-cream-dark rounded-sm shadow-premium p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-charcoal font-semibold">Latest Result</h2>
            <Link href="/student/results" className="text-gold text-xs hover:underline">
              View all →
            </Link>
          </div>
          {latestResult ? (
            <div>
              <p className="text-charcoal font-medium">{latestResult.exam_name}</p>
              <p className="text-charcoal/50 text-xs mb-3">{formatDate(latestResult.exam_date)}</p>
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-charcoal/40 text-xs">Score</p>
                  <p className="font-serif text-charcoal text-2xl font-semibold">
                    {latestResult.obtained_marks}
                    <span className="text-charcoal/30 text-base font-normal">/{latestResult.total_marks}</span>
                  </p>
                </div>
                <div className="mb-1">
                  <span className={`text-sm font-bold ${getGrade(latestResult.percentage).color}`}>
                    {getGrade(latestResult.percentage).label}
                  </span>
                  <p className="text-charcoal/50 text-xs">{latestResult.percentage}%</p>
                </div>
              </div>
              {latestResult.remarks && (
                <p className="mt-3 text-charcoal/60 text-xs italic border-t border-cream pt-3">
                  "{latestResult.remarks}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-charcoal/40 text-sm py-4 text-center">No exam results yet.</p>
          )}
        </div>

        {/* Unpaid invoices */}
        <div className="bg-white border border-cream-dark rounded-sm shadow-premium p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-charcoal font-semibold">Pending Payments</h2>
            <Link href="/student/invoices" className="text-gold text-xs hover:underline">
              View all →
            </Link>
          </div>
          {unpaidInvoices.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-600 py-4">
              <CheckCircle size={18} />
              <p className="text-sm font-medium">All payments are clear.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {unpaidInvoices.slice(0, 3).map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between border-b border-cream last:border-0 pb-3 last:pb-0"
                >
                  <div>
                    <p className="text-charcoal text-sm font-medium">{inv.description}</p>
                    <p className="text-charcoal/40 text-xs">Due {formatDate(inv.due_date)}</p>
                  </div>
                  <p className="text-red-500 font-semibold text-sm">{formatCurrency(inv.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Change password modal */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPwModal(false)} />
          <div className="relative bg-white rounded-sm shadow-premium-lg w-full max-w-sm animate-fade-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark">
              <h2 className="font-serif text-charcoal font-semibold">Change Password</h2>
              <button onClick={() => setShowPwModal(false)} className="text-charcoal/40 hover:text-charcoal">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              {pwSuccess ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <CheckCircle size={36} className="text-emerald-500" />
                  <p className="font-medium text-charcoal">Password changed successfully.</p>
                  <button
                    onClick={() => setShowPwModal(false)}
                    className="text-sm text-gold hover:underline"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {[
                    { key: "current", label: "Current Password", placeholder: "Your current password" },
                    { key: "next", label: "New Password", placeholder: "At least 6 characters" },
                    { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs text-charcoal/50 uppercase tracking-wider mb-1.5">
                        {label}
                      </label>
                      <input
                        type="password"
                        placeholder={placeholder}
                        value={pwForm[key as keyof typeof pwForm]}
                        onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                        className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-gold"
                      />
                    </div>
                  ))}
                  {pwError && (
                    <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                      {pwError}
                    </p>
                  )}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleChangePassword}
                      disabled={pwLoading}
                      className="flex-1 py-2.5 bg-charcoal text-ivory text-sm font-medium rounded-sm hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-50"
                    >
                      {pwLoading ? (
                        <span className="inline-block w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      ) : (
                        "Update Password"
                      )}
                    </button>
                    <button
                      onClick={() => setShowPwModal(false)}
                      className="px-4 py-2.5 border border-cream-dark text-charcoal/70 text-sm rounded-sm hover:border-gold/50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
