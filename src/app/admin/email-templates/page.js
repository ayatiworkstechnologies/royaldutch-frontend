"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import AdminTable from "@/components/AdminTable";
import StatusBadge from "@/components/StatusBadge";
import FormSection, { FormField, inputClass, btnPrimary, btnSecondary } from "@/components/FormSection";
import { api } from "@/lib/api";

const empty = {
  name: "",
  slug: "",
  description: "",
  subject: "",
  body: "",
  status: "active",
};

const placeholders = [
  "{patient_name}",
  "{patient_email}",
  "{patient_phone}",
  "{service_name}",
  "{staff_name}",
  "{booking_code}",
  "{booking_date}",
  "{booking_time}",
  "{appointment_time}",
  "{clinic_name}",
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    setTemplates(await api.emailTemplates());
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function edit(template) {
    setEditingId(template.id);
    setForm({
      name: template.name,
      slug: template.slug,
      description: template.description || "",
      subject: template.subject,
      body: template.body,
      status: template.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event) {
    event.preventDefault();
    setBusy("save");
    setError("");
    setNotice("");
    try {
      const payload = { ...form, description: form.description || null };
      if (editingId) await api.updateEmailTemplate(editingId, payload);
      else await api.createEmailTemplate(payload);
      setForm(empty);
      setEditingId(null);
      setNotice(editingId ? "Template updated successfully." : "Template created successfully.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function seedDefaults() {
    setBusy("seed");
    setError("");
    setNotice("");
    try {
      const seeded = await api.seedEmailTemplates();
      setTemplates(seeded);
      setNotice("Default templates have been seeded.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function remove(id) {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    setBusy(`delete-${id}`);
    try {
      await api.deleteEmailTemplate(id);
      setNotice("Template deleted.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  const columns = [
    {
      key: "name",
      label: "Name / Slug",
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900">{row.name}</span>
          <br />
          <code className="text-xs font-mono text-fuchsia-700 bg-fuchsia-50 px-1 py-0.5 rounded">{row.slug}</code>
        </div>
      ),
    },
    { key: "subject", label: "Subject Line" },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "description", label: "Description", render: (row) => row.description || <span className="text-slate-400">–</span> },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => edit(row)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-fuchsia-50 hover:text-fuchsia-700 hover:border-fuchsia-200"
          >
            Edit
          </button>
          <button
            disabled={busy === `delete-${row.id}`}
            onClick={() => remove(row.id)}
            className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 disabled:opacity-60"
          >
            {busy === `delete-${row.id}` ? "Deleting..." : "Delete"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Email Templates"
        description="Manage reusable Royal Dutch email templates for bookings, reminders and payments."
        action={
          <button
            onClick={seedDefaults}
            disabled={busy === "seed"}
            className="inline-flex items-center gap-2 rounded-lg bg-[#5b0f4d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a0c3f] shadow-sm disabled:opacity-60"
          >
            <RotateCcw size={16} /> {busy === "seed" ? "Seeding..." : "Seed Defaults"}
          </button>
        }
      />

      {notice && <p className="mt-4 rounded-lg bg-emerald-50 border border-emerald-100 p-3.5 text-sm text-emerald-700">{notice}</p>}
      {error && <p className="mt-4 rounded-lg bg-rose-50 border border-rose-100 p-3.5 text-sm text-rose-700">{error}</p>}

      <FormSection
        title={editingId ? `Edit Template: ${form.name}` : "Create Email Template"}
        onSubmit={save}
        actions={
          <>
            <button disabled={busy === "save"} className={btnPrimary}>
              {busy === "save" ? "Saving..." : editingId ? "Update Template" : "Create Template"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(empty);
                }}
                className={btnSecondary}
              >
                Cancel Edit
              </button>
            )}
          </>
        }
      >
        <FormField label="Template Name" required>
          <input
            required
            placeholder="e.g. Booking Confirmed"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Template Slug" required>
          <input
            required
            placeholder="e.g. confirmed"
            value={form.slug}
            onChange={(event) => setField("slug", event.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Status">
          <select
            value={form.status}
            onChange={(event) => setField("status", event.target.value)}
            className={inputClass}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FormField>
        <div className="md:col-span-2 lg:col-span-3">
          <FormField label="Description">
            <input
              placeholder="Internal notes about when this template is sent"
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <FormField label="Email Subject" required>
            <input
              required
              placeholder="e.g. Your Appointment at Royal Dutch Clinic is Confirmed!"
              value={form.subject}
              onChange={(event) => setField("subject", event.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <FormField label="Email Body (Markdown or Plain Text)" required>
            <textarea
              required
              placeholder="Dear {patient_name}, ..."
              value={form.body}
              onChange={(event) => setField("body", event.target.value)}
              className={`${inputClass} min-h-[16rem] font-mono text-xs leading-relaxed`}
            />
          </FormField>
        </div>
        <div className="md:col-span-2 lg:col-span-3 bg-slate-50 rounded-lg p-4 border border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Available placeholders (Click to insert)</p>
          <div className="flex flex-wrap gap-1.5">
            {placeholders.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setField("body", `${form.body}${form.body ? " " : ""}${item}`)}
                className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#5b0f4d] hover:border-fuchsia-300 hover:bg-fuchsia-50/30 transition duration-150"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </FormSection>

      <AdminTable
        columns={columns}
        data={templates}
        perPage={5}
        emptyTitle="No email templates yet"
        emptyMessage="Click 'Seed Defaults' to add the Royal Dutch default booking templates."
      />
    </AdminShell>
  );
}
