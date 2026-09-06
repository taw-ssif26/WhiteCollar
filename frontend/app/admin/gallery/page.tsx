"use client";

import { useEffect, useState } from "react";
import { galleryAdminAPI } from "@/lib/api";
import { Plus, Trash2, Upload, ImageIcon } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Field, Input, Select, Button } from "@/components/ui/FormElements";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const CATEGORIES = ["General", "Classes", "Events", "Achievements", "Campus"];

  const load = () => {
    setLoading(true);
    galleryAdminAPI.list().then((r) => setItems(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    setError("");
    if (!title || !file) return setError("Title and image are required.");
    setSaving(true);
    try {
      await galleryAdminAPI.create(title, category, file);
      setShowAdd(false);
      setTitle(""); setCategory("General"); setFile(null);
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this photo?")) return;
    await galleryAdminAPI.delete(id);
    load();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-charcoal text-3xl font-semibold">Gallery</h1>
          <p className="text-charcoal/50 text-sm mt-1">{items.length} photos</p>
        </div>
        <Button onClick={() => { setShowAdd(true); setError(""); }}>
          <Plus size={16} /> Add Photo
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-cream rounded-sm animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white border border-cream-dark rounded-sm">
          <ImageIcon size={40} className="text-gold/30 mx-auto mb-4" />
          <p className="text-charcoal/40">No photos yet. Upload your first photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-square bg-charcoal-light rounded-sm overflow-hidden border border-cream-dark">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={24} className="text-ivory/20" />
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/70 transition-all duration-200 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                <div className="text-center px-3">
                  <p className="text-ivory text-xs font-medium">{item.title}</p>
                  <p className="text-gold text-[10px] mt-0.5">{item.category}</p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs rounded-sm hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Photo">
        <div className="flex flex-col gap-4">
          <Field label="Title" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="IELTS Batch — October 2025" required />
          </Field>
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Photo" required>
            <label className="flex flex-col items-center gap-3 border-2 border-dashed border-cream-dark rounded-sm p-6 cursor-pointer hover:border-gold/50 transition-colors">
              <Upload size={24} className="text-gold/50" />
              {file ? (
                <p className="text-charcoal text-sm font-medium">{file.name}</p>
              ) : (
                <p className="text-charcoal/50 text-sm">Click to upload (JPEG, PNG, WebP · max 5MB)</p>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </Field>

          {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-sm px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button onClick={handleAdd} loading={saving}>Upload Photo</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
