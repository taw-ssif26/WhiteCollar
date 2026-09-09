"use client";

import { useEffect, useState } from "react";
import { invoicesAPI, studentsAPI } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Plus, CheckCircle, Trash2, Send, Search } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Field, Input, Select, Button, Textarea } from "@/components/ui/FormElements";
import { useToast } from "@/components/ui/Toast";

const EMPTY_FORM = {
  student_id: "", amount: "", description: "",
  issue_date: new Date().toISOString().split("T")[0],
  due_date: "",
};

export default function AdminInvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPaid, setFilterPaid] = useState<"" | "true" | "false">("");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    const params: any = {};
    if (filterPaid !== "") params.is_paid = filterPaid === "true";
    Promise.all([invoicesAPI.list(params), studentsAPI.list()])
      .then(([r, s]) => { setInvoices(r.data); setStudents(s.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterPaid]);

  const filtered = invoices.filter((i) =>
    !search ||
    i.student_name.toLowerCase().includes(search.toLowerCase()) ||
    i.invoice_number.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnpaid = invoices.filter((i) => !i.is_paid).reduce((s, i) => s + i.amount, 0);

  const handleAdd = async () => {
    setError("");
    if (!form.student_id) return setError("Select a student.");
    setSaving(true);
    try {
      await invoicesAPI.create({ ...form, amount: parseFloat(form.amount) });
      setShowAdd(false);
      setForm(EMPTY_FORM);
      toast("Invoice created and sent.");
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to create invoice.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    await invoicesAPI.markPaid(id);
    toast("Invoice marked as paid.");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    await invoicesAPI.delete(id);
    toast("Invoice deleted.", "info");
    load();
  };

  const handleResend = async (id: string) => {
    try {
      const res = await invoicesAPI.resendWhatsApp(id);
      if (res.data.sent) {
        toast("WhatsApp message sent.");
      } else {
        toast("WhatsApp send failed — check Green-API.", "error");
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
          <h1 className="font-serif text-charcoal text-3xl font-semibold">Invoices</h1>
          <p className="text-charcoal/50 text-sm mt-1">
            {invoices.filter((i) => !i.is_paid).length} unpaid · Total due: {formatCurrency(totalUnpaid)}
          </p>
        </div>
        <Button onClick={() => { setShowAdd(true); setForm(EMPTY_FORM); setError(""); }}>
          <Plus size={16} /> Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30" />
          <input
            placeholder="Search student or invoice…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-cream-dark rounded-sm pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-gold bg-white"
          />
        </div>
        <select
          value={filterPaid}
          onChange={(e) => setFilterPaid(e.target.value as any)}
          className="border border-cream-dark rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
        >
          <option value="">All Invoices</option>
          <option value="false">Unpaid Only</option>
          <option value="true">Paid Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-cream-dark rounded-sm shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-dark bg-cream/50">
                {["Invoice", "Student", "Description", "Amount", "Due Date", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal/50 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-dark">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-cream rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-charcoal/40">No invoices found.</td></tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className={`hover:bg-cream/30 transition-colors ${!inv.is_paid ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs text-charcoal/60">{inv.invoice_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-charcoal">{inv.student_name}</p>
                      <p className="text-xs text-charcoal/40">{inv.student_id}</p>
                    </td>
                    <td className="px-4 py-3 text-charcoal/70 max-w-40 truncate">{inv.description}</td>
                    <td className="px-4 py-3 font-semibold text-charcoal">{formatCurrency(inv.amount)}</td>
                    <td className="px-4 py-3 text-charcoal/60 text-xs">{formatDate(inv.due_date)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        inv.is_paid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                      }`}>
                        {inv.is_paid ? "PAID" : "UNPAID"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!inv.is_paid && (
                          <button
                            onClick={() => handleMarkPaid(inv.id)}
                            className="p-1.5 text-charcoal/40 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm transition-colors"
                            title="Mark as paid"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleResend(inv.id)}
                          className="p-1.5 text-charcoal/40 hover:text-green-600 hover:bg-green-50 rounded-sm transition-colors"
                          title="Resend WhatsApp"
                        >
                          <Send size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 text-charcoal/40 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Invoice Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create Invoice">
        <div className="flex flex-col gap-4">
          <Field label="Student" required>
            <Select value={form.student_id} onChange={set("student_id")}>
              <option value="">Select a student…</option>
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.name} ({s.student_id})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Description" required>
            <Textarea value={form.description} onChange={set("description")} placeholder="Monthly tuition fee — October 2025" rows={2} required />
          </Field>
          <Field label="Amount (৳)" required>
            <Input type="number" min="0" value={form.amount} onChange={set("amount")} placeholder="2500" required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Issue Date" required>
              <Input type="date" value={form.issue_date} onChange={set("issue_date")} required />
            </Field>
            <Field label="Due Date" required>
              <Input type="date" value={form.due_date} onChange={set("due_date")} required />
            </Field>
          </div>
          <p className="text-xs text-charcoal/50">WhatsApp confirmation will be sent automatically when payment is marked.</p>
          {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-sm px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button onClick={handleAdd} loading={saving}>Create Invoice</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
