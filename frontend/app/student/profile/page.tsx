"use client";

import { useEffect, useState } from "react";
import { studentPortalAPI } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { KeyRound, CheckCircle } from "lucide-react";

export default function StudentProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    studentPortalAPI.profile()
      .then((r) => setProfile(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleChangePassword = async () => {
    setPwError("");
    if (pwForm.next !== pwForm.confirm) return setPwError("Passwords do not match.");
    if (pwForm.next.length < 6) return setPwError("Minimum 6 characters.");
    setPwLoading(true);
    try {
      await studentPortalAPI.changePassword(pwForm.current, pwForm.next);
      setPwSuccess(true);
      setPwForm({ current: "", next: "", confirm: "" });
      toast("Password changed successfully.");
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-charcoal text-3xl font-semibold">My Profile</h1>
        <p className="text-charcoal/50 text-sm mt-1">Your account information</p>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-cream-dark rounded-sm shadow-premium p-6 mb-6">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-cream-dark">
          {profile?.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-gold/40"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-charcoal-light border-2 border-gold/20 flex items-center justify-center shrink-0">
              <span className="font-serif text-gold text-2xl font-semibold">
                {getInitials(profile?.name || "")}
              </span>
            </div>
          )}
          <div>
            <h2 className="font-serif text-charcoal text-xl font-semibold">{profile?.name}</h2>
            <p className="text-gold text-xs font-mono mt-1">{profile?.student_id}</p>
            <p className="text-charcoal/50 text-sm mt-0.5">{profile?.batch}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {[
            { label: "School / College", value: profile?.school_college },
            { label: "Class / Year", value: profile?.class_level },
            { label: "Batch", value: profile?.batch },
            { label: "Gender", value: profile?.gender },
            { label: "WhatsApp", value: profile?.whatsapp_number },
            { label: "Email", value: profile?.email || "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-charcoal/40 text-xs uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-charcoal text-sm font-medium capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white border border-cream-dark rounded-sm shadow-premium p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound size={18} className="text-gold" />
          <h2 className="font-serif text-charcoal font-semibold">Change Password</h2>
        </div>

        {pwSuccess ? (
          <div className="flex items-center gap-3 text-emerald-600 py-4">
            <CheckCircle size={20} />
            <p className="font-medium">Password updated successfully.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {[
              { key: "current", label: "Current Password", placeholder: "Your current password" },
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
                  className="w-full border border-cream-dark rounded-sm px-3 py-2.5 text-sm text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            ))}

            {pwError && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                {pwError}
              </p>
            )}

            <button
              onClick={handleChangePassword}
              disabled={pwLoading}
              className="w-full py-2.5 bg-charcoal text-ivory text-sm font-medium rounded-sm hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pwLoading ? (
                <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
