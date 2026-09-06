"use client";

import { useEffect, useState } from "react";
import { resultsAPI, studentsAPI } from "@/lib/api";
import { formatDate, getGrade } from "@/lib/utils";
import { Plus, Trash2, Send, Search } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Field, Input, Select, Button, Textarea } from "@/components/ui/FormElements";
import { useToast } from "@/components/ui/Toast";

const EMPTY_FORM = {
  student_id: "", exam_name: "", total_marks: "", obtained_marks: "",
  exam_date: "", remarks: "", send_whatsapp: true,
};

export default function AdminResultsPage() {
  const { toast } = useToast();
  const [results, setResults] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([resultsAPI.list(), studentsAPI.list()])
      .then(([r, s]) => { setResults(r.data); setStudents(s.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = results.filter((r) =>
    !search ||
    r.student_name.toLowerCase().includes(search.toLowerCase()) ||
    r.exam_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    setError("");
    if (!form.student_id) return setError("Please select a student.");
    if (parseInt(form.obtained_marks) > parseInt(form.total_marks)) {
      return setError("Obtained marks cannot exceed total marks.");
    }
    setSaving(true);
    try {
      await resultsAPI.create({
        ...form,
        total_marks: parseInt(form.total_marks),
        obtained_marks: parseInt(form.obtained_marks),
      });
      setShowAdd(false);
      setForm(EMPTY_FORM);
      toast("Result added successfully.");
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to add result.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete result for ${name}?`)) return;
    await resultsAPI.delete(id);
    toast("Result deleted.", "info");
    load();
  };

  const handleResend = async (id: string) => {
    try {
      const res = await resultsAPI.resendWhatsApp(id);
      if (res.data.sent) {
        toast("WhatsApp message sent successfully.");
      } else {
        toast("WhatsApp send failed — check Green-API configuration.", "error");
      }
    } catch {
      toast("Failed to send WhatsApp message.", "error");
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-charcoal text-3xl font-semibold">Results</h1>
          <p className="text-charcoal/50 text-sm mt-1">{results.length} records</p>
        </div>
        <Button onClick={() => { setShowAdd(true); setForm(EMPTY_FORM); setError(""); }}>
          <Plus size={16} /> Add Result
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30" />
        <input
          placeholder="Search student or exam…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-cream-dark rounded-sm pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-gold bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-cream-dark rounded-sm shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-dark bg-cream/50">
                {["Student", "Exam", "Score", "Date", "WhatsApp", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal/50 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-dark">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-cream rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-charcoal/40">No results found.</td></tr>
              ) : (
                filtered.map((r) => {
                  const grade = getGrade(r.percentage);
                  return (
                    <tr key={r.id} className="hover:bg-cream/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-charcoal">{r.student_name}</p>
                        <p className="text-xs text-charcoal/40 font-mono">{r.student_id}</p>
                      </td>
                      <td className="px-4 py-3 text-charcoal/80">{r.exam_name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${grade.color}`}>{grade.label}</span>
                          <span className="text-charcoal/50 text-xs">{r.obtained_marks}/{r.total_marks} ({r.percentage}%)</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-charcoal/60 text-xs">{formatDate(r.exam_date)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          r.whatsapp_sent ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {r.whatsapp_sent ? "Sent" : "Not sent"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleResend(r.id)}
                            className="p-1.5 text-charcoal/40 hover:text-green-600 hover:bg-green-50 rounded-sm transition-colors"
                            title="Resend WhatsApp"
                          >
                            <Send size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id, r.student_name)}
                            className="p-1.5 text-charcoal/40 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Result Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Exam Result">
        <div className="flex flex-col gap-4">
          <Field label="Student" required>
            <Select value={form.student_id} onChange={set("student_id")} required>
              <option value="">Select a student…</option>
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.name} ({s.student_id})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Exam Name" required>
            <Input value={form.exam_name} onChange={set("exam_name")} placeholder="Monthly Test — October 2025" required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Total Marks" required>
              <Input type="number" min="1" value={form.total_marks} onChange={set("total_marks")} placeholder="100" required />
            </Field>
            <Field label="Obtained Marks" required>
              <Input type="number" min="0" value={form.obtained_marks} onChange={set("obtained_marks")} placeholder="78" required />
            </Field>
          </div>
          <Field label="Exam Date" required>
            <Input type="date" value={form.exam_date} onChange={set("exam_date")} required />
          </Field>
          <Field label="Remarks (optional)">
            <Textarea value={form.remarks} onChange={set("remarks")} placeholder="Excellent performance in speaking section…" rows={2} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-charcoal/70 cursor-pointer">
            <input
              type="checkbox"
              checked={form.send_whatsapp}
              onChange={(e) => setForm({ ...form, send_whatsapp: e.target.checked })}
              className="accent-gold"
            />
            Send WhatsApp notification to student
          </label>
          {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-sm px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button onClick={handleAdd} loading={saving}>Add Result</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
