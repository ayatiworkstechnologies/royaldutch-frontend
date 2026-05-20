"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import EmptyState from "@/components/EmptyState";
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
      setNotice(editingId ? "Template updated." : "Template created.");
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
      setTemplates(await api.seedEmailTemplates());
      setNotice("Default templates are ready.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function remove(id) {
    setBusy(`delete-${id}`);
    await api.deleteEmailTemplate(id);
    await load();
    setBusy("");
  }

  return (
    <AdminShell>
      <AdminPageHeader
        title="Email Templates"
        description="Manage reusable Royal Dutch email templates for bookings, reminders and payments."
        action={
          <button onClick={seedDefaults} className="inline-flex items-center gap-2 rounded-md bg-[#5b0f4d] px-4 py-2 text-sm font-semibold text-white">
            <RotateCcw size={16} /> Defaults
          </button>
        }
      />

      {notice ? <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p> : null}
      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <form onSubmit={save} className="mt-5 grid gap-3 rounded-lg border border-fuchsia-100 bg-white p-5 shadow-sm md:grid-cols-3">
        <input required placeholder="Template name" value={form.name} onChange={(event) => setField("name", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <input required placeholder="Slug e.g. confirmed" value={form.slug} onChange={(event) => setField("slug", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <select value={form.status} onChange={(event) => setField("status", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <input placeholder="Description" value={form.description} onChange={(event) => setField("description", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 md:col-span-3" />
        <input required placeholder="Subject" value={form.subject} onChange={(event) => setField("subject", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 md:col-span-3" />
        <textarea required placeholder="Email body" value={form.body} onChange={(event) => setField("body", event.target.value)} className="min-h-48 rounded-md border border-slate-300 px-3 py-2 md:col-span-3" />
        <div className="md:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Available placeholders</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {placeholders.map((item) => (
              <button key={item} type="button" onClick={() => setField("body", `${form.body}${form.body ? " " : ""}${item}`)} className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-[#5b0f4d]">
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-3">
          <button disabled={busy === "save"} className="rounded-md bg-fuchsia-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy === "save" ? "Saving..." : editingId ? "Update Template" : "Create Template"}
          </button>
          {editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">Cancel Edit</button> : null}
        </div>
      </form>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {templates.length === 0 ? <EmptyState title="No email templates yet" message="Click Defaults to add the Royal Dutch booking templates." /> : null}
        {templates.map((template) => (
          <article key={template.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{template.name}</p>
                <p className="mt-1 text-sm text-slate-500">{template.slug} - {template.status}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => edit(template)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Edit</button>
                <button disabled={busy === `delete-${template.id}`} onClick={() => remove(template.id)} className="rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-700 disabled:opacity-60">Delete</button>
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold">{template.subject}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{template.body}</p>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
