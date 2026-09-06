"use client";

import { useEffect, useState } from "react";
import { dashboardAPI, api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, FileText, Receipt, TrendingUp, AlertTriangle, KeyRound, X, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Password change modal
  const [showPw, setShowPw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    dashboardAPI.get()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleChangePassword = async () => {
    setPwError("");
    if (pwForm.next !== pwForm.confirm) return setPwError("Passwords do not match.");
    if (pwForm.next.length < 6) return setPwError("Minimum 6 characters.");
    setPwLoading(true);
    try {
      await api.post("/admin/change-password", {
        current_password: pwForm.current,
        new_password: pwForm.next,
      });
      setPwSuccess(true);
      setPwForm({ current: "", next: "", confirm: "" });
      toast("Admin password changed successfully.");
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

  const { stats, recent_results, unpaid_fees } = data;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-charcoal text-3xl font-semibold">Dashboard</h1>
          <p className="text-charcoal/50 text-sm mt-1">Overview of White-Collar English Care</p>
        </div>
        <button
          onClick={() => { setShowPw(true); setPwError(""); setPwSuccess(false); }}
          className="flex items-center gap-2 px-4 py-2 border border-cream-dark text-charcoal/60 text-sm rounded-sm hover:border-gold/50 hover:text-gold transition-colors"
        >
          <KeyRound size={15} /> Change Password
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Users size={20} className="text-gold" />, label: "Active Students", value: stats.active_students },
          { icon: <FileText size={20} className="text-gold" />, label: "Exams Recorded", value: stats.total_results },
          { icon: <Receipt size={20} className="text-red-400" />, label: "Unpaid Invoices", value: stats.unpaid_invoices },
          { icon: <TrendingUp size={20} className="text-emerald-500" />, label: "Revenue Collected", value: formatCurrency(stats.total_revenue) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-cream-dark rounded-sm shadow-premium p-5">
            <div className="flex items-center gap-2 mb-3">{stat.icon}</div>
            <p className="font-serif text-charcoal text-2xl font-bold">{stat.value}</p>
            <p className="text-charcoal/50 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent results */}
        <div className="bg-white border border-cream-dark rounded-sm shadow-premium">
          <div className="px-5 py-4 border-b border-cream-dark">
            <h2 className="font-serif text-charcoal font-semibold">Recent Results</h2>
          </div>
          {recent_results.length === 0 ? (
            <p className="text-charcoal/40 text-sm text-center py-8">No results recorded yet.</p>
          ) : (
            <div className="divide-y divide-cream-dark">
              {recent_results.map((r: any, i: number) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-charcoal text-sm font-medium">{r.student_name}</p>
                    <p className="text-charcoal/40 text-xs">{r.exam_name} · {formatDate(r.exam_date)}</p>
                  </div>
                  <span className={`text-sm font-bold ${
                    r.percentage >= 70 ? "text-emerald-600" :
                    r.percentage >= 50 ? "text-yellow-600" : "text-red-500"
                  }`}>
                    {r.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unpaid fees */}
        <div className="bg-white border border-red-100 rounded-sm shadow-premium">
          <div className="px-5 py-4 border-b border-red-100 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            <h2 className="font-serif text-charcoal font-semibold">Unpaid Fees</h2>
          </div>
          {unpaid_fees.length === 0 ? (
            <p className="text-emerald-600 text-sm text-center py-8">✓ All fees are clear.</p>
          ) : (
            <div className="divide-y divide-red-50">
              {unpaid_fees.map((f: any, i: number) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-charcoal text-sm font-medium">{f.student_name}</p>
                    <p className="text-charcoal/40 text-xs">#{f.invoice_number} · Due {formatDate(f.due_date)}</p>
                  </div>
                  <span className="text-red-500 text-sm font-bold">{formatCurrency(f.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Change password modal */}
      {showPw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPw(false)} />
          <div className="relative bg-white rounded-sm shadow-premium-lg w-full max-w-sm animate-fade-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark">
              <h2 className="font-serif text-charcoal font-semibold">Change Admin Password</h2>
              <button onClick={() => setShowPw(false)} className="text-charcoal/40 hover:text-charcoal">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              {pwSuccess ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <CheckCircle size={36} className="text-emerald-500" />
                  <p className="font-medium text-charcoal">Password changed successfully.</p>
                  <button onClick={() => setShowPw(false)} className="text-sm text-gold hover:underline">Close</button>
                </div>
              ) : (
                <>
                  {[
                    { key: "current", label: "Current Password", placeholder: "Current admin password" },
                    { key: "next", label: "New Password", placeholder: "At least 6 characters" },
                    { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs text-charcoal/50 uppercase tracking-wider mb-1.5">{label}</label>
                      <input
                        type="password"
                        placeholder={placeholder}
                        value={pwForm[key as keyof typeof pwForm]}
                        onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                        className="w-full border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-gold"
                      />
                    </div>
                  ))}
                  {pwError && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-sm px-3 py-2">{pwError}</p>}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleChangePassword}
                      disabled={pwLoading}
                      className="flex-1 py-2.5 bg-charcoal text-ivory text-sm font-medium rounded-sm hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {pwLoading ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : "Update Password"}
                    </button>
                    <button onClick={() => setShowPw(false)} className="px-4 py-2.5 border border-cream-dark text-charcoal/70 text-sm rounded-sm hover:border-gold/50">
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
