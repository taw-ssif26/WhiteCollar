"use client";

import { useEffect, useState } from "react";
import { eventsAdminAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2, Edit2, Eye, EyeOff } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Field, Input, Button, Textarea } from "@/components/ui/FormElements";

const EMPTY_FORM = { title: "", description: "", event_date: "", is_published: true };

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    eventsAdminAPI.list().then((r) => setEvents(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const handleAdd = async () => {
    setError("");
    setSaving(true);
    try {
      await eventsAdminAPI.create({ ...form, event_date: new Date(form.event_date).toISOString() });
      setShowAdd(false);
      setForm(EMPTY_FORM);
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to create event.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    setError("");
    setSaving(true);
    try {
      await eventsAdminAPI.update(showEdit.id, { ...form, event_date: new Date(form.event_date).toISOString() });
      setShowEdit(null);
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to update event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await eventsAdminAPI.delete(id);
    load();
  };

  const openEdit = (event: any) => {
    setShowEdit(event);
    const localDate = new Date(event.event_date);
    const dateStr = localDate.toISOString().slice(0, 16);
    setForm({ title: event.title, description: event.description, event_date: dateStr, is_published: event.is_published });
    setError("");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-charcoal text-3xl font-semibold">Events</h1>
          <p className="text-charcoal/50 text-sm mt-1">{events.length} total</p>
        </div>
        <Button onClick={() => { setShowAdd(true); setForm(EMPTY_FORM); setError(""); }}>
          <Plus size={16} /> Add Event
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-cream rounded-sm animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white border border-cream-dark rounded-sm">
          <p className="text-charcoal/40">No events yet. Add your first event.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white border border-cream-dark rounded-sm shadow-premium p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-serif text-charcoal font-semibold">{event.title}</h2>
                  {!event.is_published && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Draft</span>
                  )}
                </div>
                <p className="text-charcoal/60 text-sm mb-2 line-clamp-2">{event.description}</p>
                <p className="text-gold text-xs">{new Date(event.event_date).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(event)} className="p-1.5 text-charcoal/40 hover:text-gold rounded-sm transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(event.id)} className="p-1.5 text-charcoal/40 hover:text-red-500 rounded-sm transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {[
        { open: showAdd, onClose: () => setShowAdd(false), title: "Add Event", onSubmit: handleAdd, label: "Add Event" },
        { open: !!showEdit, onClose: () => setShowEdit(null), title: "Edit Event", onSubmit: handleUpdate, label: "Save Changes" },
      ].map(({ open, onClose, title, onSubmit, label }) => (
        <Modal key={title} open={open} onClose={onClose} title={title}>
          <div className="flex flex-col gap-4">
            <Field label="Title" required>
              <Input value={form.title} onChange={set("title")} placeholder="IELTS Masterclass" required />
            </Field>
            <Field label="Description" required>
              <Textarea value={form.description} onChange={set("description")} placeholder="Event details…" rows={4} required />
            </Field>
            <Field label="Date & Time" required>
              <Input type="datetime-local" value={form.event_date} onChange={set("event_date")} required />
            </Field>
            <label className="flex items-center gap-2 text-sm text-charcoal/70 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="accent-gold"
              />
              Publish immediately (visible on website)
            </label>
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
