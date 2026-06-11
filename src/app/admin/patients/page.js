"use client";

import { useEffect, useMemo, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import AdminTable from "@/components/AdminTable";
import FormSection, { FormField, inputClass, btnPrimary, btnSecondary } from "@/components/FormSection";
import { api } from "@/lib/api";

const empty = { full_name: "", phone: "", email: "", gender: "", age: "", notes: "" };

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setPatients(await api.patients());
  }

  useEffect(() => {
    api.patients().then(setPatients).catch((err) => setError(err.message));
  }, []);

  function setField(field, value) {
    setForm((c) => ({ ...c, [field]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, age: form.age ? Number(form.age) : null };
      if (editingId) await api.updatePatient(editingId, payload);
      else await api.createPatient(payload);
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function edit(patient) {
    setEditingId(patient.id);
    setForm({
      full_name: patient.full_name || "",
      phone: patient.phone || "",
      email: patient.email || "",
      gender: patient.gender || "",
      age: patient.age || "",
      notes: patient.notes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return patients;
    return patients.filter((p) =>
      [p.full_name, p.phone, p.email].some((v) => String(v || "").toLowerCase().includes(needle))
    );
  }, [patients, query]);

  const columns = [
    { key: "full_name", label: "Name", render: (row) => <span className="font-semibold text-slate-900">{row.full_name}</span> },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email", render: (row) => row.email || <span className="text-slate-400">–</span> },
    { key: "gender", label: "Gender", render: (row) => <span className="capitalize">{row.gender || "–"}</span> },
    { key: "age", label: "Age", render: (row) => row.age || "–" },
    { key: "created_at", label: "Created", render: (row) => row.created_at?.slice(0, 10) || "–" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button onClick={() => edit(row)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-fuchsia-50 hover:text-fuchsia-700 hover:border-fuchsia-200">
          Edit
        </button>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader title="Patient Management" description="View, search and manage patient records." />
      {error && <p className="mt-4 rounded-lg bg-rose-50 border border-rose-100 p-3.5 text-sm text-rose-700">{error}</p>}

      <FormSection
        title={editingId ? `Edit Patient #${editingId}` : "Add New Patient"}
        onSubmit={save}
        actions={
          <>
            <button className={btnPrimary}>{editingId ? "Update" : "Add"} Patient</button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className={btnSecondary}>
                Cancel
              </button>
            )}
          </>
        }
      >
        <FormField label="Full Name" required>
          <input required placeholder="Patient full name" value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Phone" required>
          <input required placeholder="+971 5xx xxx xxxx" value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Email">
          <input type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Gender">
          <select value={form.gender} onChange={(e) => setField("gender", e.target.value)} className={inputClass}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </FormField>
        <FormField label="Age">
          <input type="number" min="0" max="150" placeholder="Age" value={form.age} onChange={(e) => setField("age", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Notes">
          <input placeholder="Optional notes" value={form.notes} onChange={(e) => setField("notes", e.target.value)} className={inputClass} />
        </FormField>
      </FormSection>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100">
        <input
          placeholder="Search by name, phone or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${inputClass} max-w-md`}
        />
      </div>

      <AdminTable columns={columns} data={filtered} perPage={10} emptyTitle="No patients found" emptyMessage="Patient records appear here after bookings are created." />
    </AdminShell>
  );
}
