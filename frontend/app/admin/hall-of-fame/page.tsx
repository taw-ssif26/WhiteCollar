"use client";

import { useEffect, useState } from "react";
import { hallOfFameAdminAPI } from "@/lib/api";
import { Trophy, Plus, Edit2, Trash2, Eye, EyeOff, Upload } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Field, Input, Select, Button, Textarea } from "@/components/ui/FormElements";
import { useToast } from "@/components/ui/Toast";

const CATEGORIES = ["SSC", "HSC", "BCS", "Admission", "Other"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

const EMPTY_FORM = {
  student_name: "",
  achievement: "",
  category: "SSC",
  description: "",
  year: CURRENT_YEAR,
  is_published: true,
  display_order: 0,
};

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
}

export default function AdminHallOfFamePage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    hallOfFameAdminAPI.list().then((r) => setEntries(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: key === "year" || key === "display_order" ? parseInt(e.target.value) : e.target.value });

  const handleAdd = async () => {
    setError("");
    if (!form.student_name.trim() || !form.achievement.trim()) return setError("Name and achievement are required.");
    setSaving(true);
    try {
      await hallOfFameAdminAPI.create(form);
      setShowAdd(false);
      setForm(EMPTY_FORM);
      toast("Entry added to Hall of Fame.");
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to add entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    setError("");
    setSaving(true);
    try {
      await hallOfFameAdminAPI.update(showEdit.id, form);
      setShowEdit(null);
      toast("Entry updated.");
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from Hall of Fame?`)) return;
    await hallOfFameAdminAPI.delete(id);
    toast("Entry removed.", "info");
    load();
  };

  const handleTogglePublish = async (entry: any) => {
    await hallOfFameAdminAPI.update(entry.id, { is_published: !entry.is_published });
    toast(entry.is_published ? "Hidden from public." : "Published.", "info");
    load();
  };

  const handlePhotoUpload = async (id: string, file: File) => {
    await hallOfFameAdminAPI.uploadPhoto(id, file);
    toast("Photo uploaded.");
    load();
  };

  const openEdit = (entry: any) => {
    setShowEdit(entry);
    setForm({
      student_name: entry.student_name,
      achievement: entry.achievement,
      category: entry.category,
      description: entry.description || "",
      year: entry.year,
      is_published: entry.is_published,
      display_order: entry.display_order,
    });
    setError("");
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-charcoal text-3xl font-semibold flex items-center gap-3">
            <Trophy size={26} className="text-gold" /> Hall of Fame
          </h1>
          <p className="text-charcoal/50 text-sm mt-1">{entries.length} entries · {entries.filter(e => e.is_published).length} published</p>
        </div>
        <Button onClick={() => { setShowAdd(true); setForm(EMPTY_FORM); setError(""); }}>
          <Plus size={16} /> Add Entry
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-cream rounded-sm animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 bg-white border border-cream-dark rounded-sm">
          <Trophy size={40} className="text-gold/30 mx-auto mb-4" />
          <p className="text-charcoal/40">No entries yet. Add your first Hall of Fame achiever.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`bg-white border rounded-sm shadow-premium overflow-hidden ${!entry.is_published ? "opacity-60 border-dashed border-charcoal/20" : "border-cream-dark"}`}
            >
              <div className="h-0.5 bg-gold-gradient" />
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  {entry.photo_url ? (
                    <img src={entry.photo_url} alt={entry.student_name} className="w-11 h-11 rounded-full object-cover border border-gold/20 shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-charcoal-light flex items-center justify-center shrink-0">
                      <span className="font-serif text-gold text-sm font-semibold">{getInitials(entry.student_name)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-charcoal font-semibold text-sm truncate">{entry.student_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold/10 text-gold font-medium">{entry.category}</span>
                      <span className="text-charcoal/40 text-xs">{entry.year}</span>
                      {!entry.is_published && <span className="text-[10px] text-charcoal/40">· Hidden</span>}
                    </div>
                  </div>
                </div>
                <p className="text-charcoal/70 text-xs mb-3 line-clamp-2">{entry.achievement}</p>

                {/* Actions */}
                <div className="flex items-center gap-1 border-t border-cream-dark pt-3">
                  <button onClick={() => openEdit(entry)} className="p-1.5 text-charcoal/40 hover:text-gold rounded-sm transition-colors" title="Edit">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleTogglePublish(entry)} className="p-1.5 text-charcoal/40 hover:text-blue-500 rounded-sm transition-colors" title={entry.is_published ? "Hide" : "Publish"}>
                    {entry.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <label className="p-1.5 text-charcoal/40 hover:text-gold rounded-sm transition-colors cursor-pointer" title="Upload photo">
                    <Upload size={13} />
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(entry.id, f); }} />
                  </label>
                  <button onClick={() => handleDelete(entry.id, entry.student_name)} className="p-1.5 text-charcoal/40 hover:text-red-500 rounded-sm transition-colors ml-auto" title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {[
        { open: showAdd, onClose: () => setShowAdd(false), title: "Add to Hall of Fame", onSubmit: handleAdd, label: "Add Entry" },
        { open: !!showEdit, onClose: () => setShowEdit(null), title: `Edit — ${showEdit?.student_name || ""}`, onSubmit: handleUpdate, label: "Save Changes" },
      ].map(({ open, onClose, title, onSubmit, label }) => (
        <Modal key={title} open={open} onClose={onClose} title={title}>
          <div className="flex flex-col gap-4">
            <Field label="Student Name" required>
              <Input value={form.student_name} onChange={set("student_name")} placeholder="Nusrat Jahan" required />
            </Field>
            <Field label="Achievement" required hint='e.g. "SSC GPA 5.0 — Board Stand" or "BCS 44th — Administration Cadre"'>
              <Input value={form.achievement} onChange={set("achievement")} placeholder="SSC GPA 5.0 — Board Stand" required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" required>
                <Select value={form.category} onChange={set("category")}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Year" required>
                <Select value={form.year} onChange={set("year")}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Description (optional)" hint="A short story about their achievement">
              <Textarea value={form.description} onChange={set("description")} placeholder="Improved from C grade to A+ in one year..." rows={3} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Display Order" hint="Lower number = shown first">
                <Input type="number" min="0" value={form.display_order} onChange={set("display_order")} />
              </Field>
              <Field label="Visibility">
                <label className="flex items-center gap-2 text-sm text-charcoal/70 cursor-pointer mt-2">
                  <input type="checkbox" checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="accent-gold" />
                  Publish on website
                </label>
              </Field>
            </div>
            {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-sm px-3 py-2">{error}</p>}
            <div className="flex gap-3 pt-1">
              <Button onClick={onSubmit} loading={saving}>{label}</Button>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
            </div>
          </div>
        </Modal>
      ))}
    </div>
  );
}
