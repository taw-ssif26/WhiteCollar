"use client";

import { useEffect, useState, useRef } from "react";
import { studentsAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Plus, Search, Upload, Edit2, Trash2, UserCheck, UserX, Send } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Field, Input, Select, Button } from "@/components/ui/FormElements";

const EMPTY_FORM = {
  name: "", school_college: "", class_level: "", batch: "",
  gender: "male", email: "", whatsapp_number: "", password: "",
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterBatch, setFilterBatch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<any>(null);
  const [showBulk, setShowBulk] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [newStudentInfo, setNewStudentInfo] = useState<any>(null);
  const [bulkResult, setBulkResult] = useState<any>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const bulkRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    studentsAPI.list({ search, batch: filterBatch })
      .then((r) => setStudents(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterBatch]);

  const batches = Array.from(new Set(students.map((s) => s.batch))).filter(Boolean);

  const handleAdd = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await studentsAPI.create(form);
      setNewStudentInfo(res.data);
      setShowAdd(false);
      setForm(EMPTY_FORM);
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to create student.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    setError("");
    setSaving(true);
    try {
      await studentsAPI.update(showEdit.student_id, form);
      setShowEdit(null);
      setForm(EMPTY_FORM);
      load();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to update student.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student: any) => {
    if (!confirm(`Delete ${student.name}? This cannot be undone.`)) return;
    await studentsAPI.delete(student.student_id);
    load();
  };

  const handleToggleActive = async (student: any) => {
    await studentsAPI.update(student.student_id, { is_active: !student.is_active });
    load();
  };

  const handlePhotoUpload = async (studentId: string, file: File) => {
    await studentsAPI.uploadPhoto(studentId, file);
    load();
  };

  const handleBulkImport = async (file: File) => {
    setSaving(true);
    try {
      const res = await studentsAPI.bulkImport(file);
      setBulkResult(res.data);
      load();
    } catch (e: any) {
      const detail = e.response?.data?.detail;
      setBulkResult({ error: typeof detail === "string" ? detail : JSON.stringify(detail) });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (student: any) => {
    setShowEdit(student);
    setForm({
      name: student.name,
      school_college: student.school_college,
      class_level: student.class_level,
      batch: student.batch,
      gender: student.gender,
      email: student.email || "",
      whatsapp_number: student.whatsapp_number,
      password: "",
    });
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-charcoal text-3xl font-semibold">Students</h1>
          <p className="text-charcoal/50 text-sm mt-1">{students.length} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setShowBulk(true)}>
            <Upload size={16} /> Bulk Import
          </Button>
          <Button onClick={() => { setShowAdd(true); setForm(EMPTY_FORM); setError(""); }}>
            <Plus size={16} /> Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30" />
          <input
            type="text"
            placeholder="Search by name or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-cream-dark rounded-sm pl-9 pr-4 py-2 text-sm text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-gold bg-white"
          />
        </div>
        <select
          value={filterBatch}
          onChange={(e) => setFilterBatch(e.target.value)}
          className="border border-cream-dark rounded-sm px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-gold bg-white min-w-32"
        >
          <option value="">All Batches</option>
          {batches.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-cream-dark rounded-sm shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-dark bg-cream/50">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal/50 font-medium">Student</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal/50 font-medium hidden sm:table-cell">ID</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal/50 font-medium hidden md:table-cell">Batch</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal/50 font-medium hidden lg:table-cell">WhatsApp</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-charcoal/50 font-medium hidden lg:table-cell">Joined</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-charcoal/50 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-charcoal/50 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-dark">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-cream rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-charcoal/40">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {s.photo_url ? (
                          <img src={s.photo_url} alt={s.name} className="w-8 h-8 rounded-full object-cover border border-cream-dark" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-charcoal-light border border-charcoal-muted flex items-center justify-center shrink-0">
                            <span className="text-gold text-xs font-semibold font-serif">
                              {s.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-charcoal">{s.name}</p>
                          <p className="text-xs text-charcoal/40">{s.school_college}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-charcoal/60 hidden sm:table-cell font-mono text-xs">{s.student_id}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-0.5 bg-cream text-charcoal/70 text-xs rounded-full">{s.batch}</span>
                    </td>
                    <td className="px-4 py-3 text-charcoal/60 hidden lg:table-cell text-xs">{s.whatsapp_number}</td>
                    <td className="px-4 py-3 text-charcoal/60 hidden lg:table-cell text-xs">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        s.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                      }`}>
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 text-charcoal/40 hover:text-gold hover:bg-gold/10 rounded-sm transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(s)}
                          className="p-1.5 text-charcoal/40 hover:text-blue-500 hover:bg-blue-50 rounded-sm transition-colors"
                          title={s.is_active ? "Deactivate" : "Activate"}
                        >
                          {s.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <label className="p-1.5 text-charcoal/40 hover:text-gold hover:bg-gold/10 rounded-sm transition-colors cursor-pointer" title="Upload photo">
                          <Send size={14} />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoUpload(s.student_id, file);
                            }}
                          />
                        </label>
                        <button
                          onClick={() => handleDelete(s)}
                          className="p-1.5 text-charcoal/40 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                          title="Delete"
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

      {/* Add student modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Student">
        <StudentForm
          form={form} setForm={setForm} error={error}
          onSubmit={handleAdd} saving={saving} onCancel={() => setShowAdd(false)}
          submitLabel="Add Student"
        />
      </Modal>

      {/* Edit student modal */}
      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title={`Edit — ${showEdit?.name}`}>
        <StudentForm
          form={form} setForm={setForm} error={error}
          onSubmit={handleUpdate} saving={saving} onCancel={() => setShowEdit(null)}
          submitLabel="Save Changes"
          isEdit
        />
      </Modal>

      {/* New student credentials modal */}
      <Modal open={!!newStudentInfo} onClose={() => setNewStudentInfo(null)} title="Student Created">
        {newStudentInfo && (
          <div className="flex flex-col gap-4">
            <p className="text-charcoal/70 text-sm">
              Student added successfully. Share these credentials with the student:
            </p>
            <div className="bg-cream rounded-sm p-4 font-mono text-sm space-y-1">
              <p><span className="text-charcoal/50">Student ID:</span> <strong>{newStudentInfo.student_id}</strong></p>
              <p><span className="text-charcoal/50">Password:</span> <strong>{newStudentInfo.default_password}</strong></p>
            </div>
            <p className="text-xs text-charcoal/40">The student can change their password after first login.</p>
            <Button onClick={() => setNewStudentInfo(null)}>Done</Button>
          </div>
        )}
      </Modal>

      {/* Bulk import modal */}
      <Modal open={showBulk} onClose={() => { setShowBulk(false); setBulkResult(null); }} title="Bulk Import Students">
        <div className="flex flex-col gap-4">
          <p className="text-charcoal/70 text-sm">
            Upload a CSV file with these columns:
          </p>
          <div className="bg-cream rounded-sm p-3 font-mono text-xs text-charcoal/70">
            name, school_college, class_level, batch, gender, whatsapp_number, email (optional)
          </div>
          <p className="text-xs text-charcoal/50">
            Gender must be: male / female / other. Default password for each student will be their Student ID.
          </p>

          {!bulkResult ? (
            <>
              <label className="flex flex-col items-center gap-3 border-2 border-dashed border-cream-dark rounded-sm p-8 cursor-pointer hover:border-gold/50 transition-colors">
                <Upload size={28} className="text-gold/50" />
                <p className="text-charcoal/50 text-sm">Click to upload CSV</p>
                <input
                  ref={bulkRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBulkImport(file);
                  }}
                />
              </label>
              {saving && (
                <div className="flex items-center gap-2 text-gold text-sm">
                  <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                  Importing…
                </div>
              )}
            </>
          ) : (
            <div>
              {bulkResult.error ? (
                <div className="bg-red-50 border border-red-200 rounded-sm p-3 text-red-600 text-sm">
                  {bulkResult.error}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                    ✓ {bulkResult.created} student{bulkResult.created !== 1 ? "s" : ""} imported
                  </div>
                  {bulkResult.errors?.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-3">
                      <p className="text-yellow-700 text-xs font-medium mb-1">Rows skipped:</p>
                      {bulkResult.errors.map((err: string, i: number) => (
                        <p key={i} className="text-yellow-600 text-xs">{err}</p>
                      ))}
                    </div>
                  )}
                  <Button onClick={() => { setShowBulk(false); setBulkResult(null); }}>Done</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function StudentForm({ form, setForm, error, onSubmit, saving, onCancel, submitLabel, isEdit = false }: any) {
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name" required className="col-span-2">
          <Input value={form.name} onChange={set("name")} placeholder="Rafiul Islam" required />
        </Field>
        <Field label="School / College" required>
          <Input value={form.school_college} onChange={set("school_college")} placeholder="Notre Dame College" required />
        </Field>
        <Field label="Class / Year" required>
          <Input value={form.class_level} onChange={set("class_level")} placeholder="Class 12 / Year 2" required />
        </Field>
        <Field label="Batch" required>
          <Input value={form.batch} onChange={set("batch")} placeholder="Batch A 2025" required />
        </Field>
        <Field label="Gender" required>
          <Select value={form.gender} onChange={set("gender")} required>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </Field>
        <Field label="WhatsApp Number" required>
          <Input value={form.whatsapp_number} onChange={set("whatsapp_number")} placeholder="01XXXXXXXXX" required />
        </Field>
        <Field label="Email (optional)">
          <Input type="email" value={form.email} onChange={set("email")} placeholder="student@example.com" />
        </Field>
        <Field label={isEdit ? "New Password (leave blank to keep)" : "Password (blank = Student ID)"} className="col-span-2">
          <Input
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder={isEdit ? "Leave blank to keep current" : "Default: Student ID"}
          />
        </Field>
      </div>

      {error && (
        <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-sm px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button onClick={onSubmit} loading={saving}>{submitLabel}</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
