"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Send, ShieldCheck } from "lucide-react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import AdminTable from "@/components/AdminTable";
import FormSection, { FormField, inputClass, btnPrimary, btnSecondary } from "@/components/FormSection";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";

const empty = {
  booking_id: "",
  patient_id: "",
  invoice_id: "",
  recipient_email: "",
  cc_emails: "",
  bcc_emails: "",
  recipient_name: "",
  subject: "",
  body: "",
  status: "queued",
  provider_message_id: "",
  error_message: "",
};

export default function AdminMailPage() {
  const [mail, setMail] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [smtp, setSmtp] = useState(null);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [mailData, bookingData, patientData, invoiceData, templateData, smtpData] = await Promise.all([
      api.mail(), api.bookings(), api.patients(), api.invoices(), api.emailTemplates(), api.smtpStatus(),
    ]);
    setMail(mailData);
    setBookings(bookingData);
    setPatients(patientData);
    setInvoices(invoiceData);
    setTemplates(templateData);
    setSmtp(smtpData);
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  const stats = useMemo(() => {
    const base = { all: mail.length, draft: 0, queued: 0, sent: 0, failed: 0 };
    mail.forEach((item) => { base[item.status] = (base[item.status] || 0) + 1; });
    return base;
  }, [mail]);

  const visibleMail = useMemo(() => filter === "all" ? mail : mail.filter((item) => item.status === filter), [filter, mail]);

  function setField(field, value) { setForm((c) => ({ ...c, [field]: value })); }

  function applyPatient(patientId) {
    const patient = patients.find((item) => item.id === Number(patientId));
    setForm((c) => ({ ...c, patient_id: patientId, recipient_name: patient?.full_name || c.recipient_name, recipient_email: patient?.email || c.recipient_email }));
  }

  function applyBooking(bookingId) {
    const booking = bookings.find((item) => item.id === Number(bookingId));
    setForm((c) => ({ ...c, booking_id: bookingId, patient_id: booking?.patient_id || c.patient_id }));
  }

  function useTemplate(templateId) {
    const template = templates.find((item) => item.id === Number(templateId));
    if (template) setForm((c) => ({ ...c, subject: template.subject, body: template.body, status: "queued" }));
  }

  function payload() {
    return {
      ...form,
      booking_id: form.booking_id ? Number(form.booking_id) : null,
      patient_id: form.patient_id ? Number(form.patient_id) : null,
      invoice_id: form.invoice_id ? Number(form.invoice_id) : null,
      recipient_name: form.recipient_name || null,
      cc_emails: form.cc_emails || null,
      bcc_emails: form.bcc_emails || null,
      provider_message_id: form.provider_message_id || null,
      error_message: form.error_message || null,
    };
  }

  async function save(e) {
    e.preventDefault();
    setError(""); setNotice(""); setBusy("save");
    try {
      if (editingId) await api.updateMail(editingId, payload());
      else await api.createMail(payload());
      setForm(empty); setEditingId(null);
      setNotice(editingId ? "Mail updated." : "Mail queued.");
      await load();
    } catch (err) { setError(err.message); } finally { setBusy(""); }
  }

  function edit(item) {
    setEditingId(item.id); setNotice(""); setError("");
    setForm({
      booking_id: item.booking_id || "", patient_id: item.patient_id || "", invoice_id: item.invoice_id || "",
      recipient_email: item.recipient_email, cc_emails: item.cc_emails || "", bcc_emails: item.bcc_emails || "",
      recipient_name: item.recipient_name || "", subject: item.subject, body: item.body, status: item.status,
      provider_message_id: item.provider_message_id || "", error_message: item.error_message || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function sendOne(id) {
    setError(""); setNotice(""); setBusy(`send-${id}`);
    try {
      const result = await api.sendMail(id);
      await load();
      if (result.status === "sent") setNotice(`Mail #${id} sent successfully.`);
      else setError(result.error_message || `Mail #${id} failed.`);
    } catch (err) { setError(err.message); } finally { setBusy(""); }
  }

  async function sendQueued(includeFailed = false) {
    setError(""); setNotice(""); setBusy(includeFailed ? "retry" : "queue");
    try {
      const result = await api.sendQueuedMail(includeFailed);
      await load();
      setNotice(`Mail send completed: ${result.sent} sent, ${result.failed} failed, ${result.total} checked.`);
    } catch (err) { setError(err.message); } finally { setBusy(""); }
  }

  async function checkSmtp() {
    setError(""); setNotice(""); setBusy("smtp");
    try {
      const result = await api.smtpStatus();
      setSmtp(result);
      if (result.ok) setNotice("SMTP login working.");
      else setError(result.error || "SMTP is not connected.");
    } catch (err) { setError(err.message); } finally { setBusy(""); }
  }

  async function remove(id) {
    setBusy(`delete-${id}`);
    await api.deleteMail(id);
    await load();
    setBusy("");
  }

  const columns = [
    {
      key: "subject",
      label: "Subject",
      render: (row) => (
        <div className="max-w-xs">
          <span className="font-semibold text-slate-900">{row.subject}</span>
          <br />
          <span className="text-xs text-slate-500 truncate block">{row.recipient_email}</span>
        </div>
      ),
    },
    { key: "booking_id", label: "Booking", render: (row) => row.booking_id || "–" },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          <button disabled={busy === `send-${row.id}`} onClick={() => sendOne(row.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#5b0f4d] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#4a0c3f] disabled:opacity-60">
            <Send size={12} /> {busy === `send-${row.id}` ? "..." : "Send"}
          </button>
          <button onClick={() => edit(row)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-fuchsia-50 hover:text-fuchsia-700">
            Edit
          </button>
          <button disabled={busy === `delete-${row.id}`} onClick={() => remove(row.id)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Email Service"
        description="Send appointment, payment and clinic emails through the configured SMTP account."
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={checkSmtp} className="inline-flex items-center gap-2 rounded-lg border border-fuchsia-200 px-4 py-2.5 text-sm font-semibold text-[#5b0f4d] transition hover:bg-fuchsia-50">
              <ShieldCheck size={16} /> Test SMTP
            </button>
            <button onClick={() => sendQueued(false)} className="inline-flex items-center gap-2 rounded-lg bg-[#5b0f4d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4a0c3f]">
              <Send size={16} /> Send Queue
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {["all", "draft", "queued", "sent", "failed"].map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`rounded-xl border p-4 text-left transition-all duration-200 shadow-sm ${filter === item ? "border-[#5b0f4d] bg-fuchsia-50 shadow-fuchsia-100" : "border-slate-200 bg-white hover:border-fuchsia-200"}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{item}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats[item] || 0}</p>
          </button>
        ))}
      </div>

      {/* SMTP Status */}
      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">SMTP Status</p>
            <p className="mt-1 text-sm text-slate-500">{smtp ? `${smtp.host}:${smtp.port} - ${smtp.from_email || smtp.login}` : "Checking SMTP settings"}</p>
          </div>
          <StatusBadge status={smtp?.ok ? "active" : "failed"} />
        </div>
      </section>

      {notice && <p className="mt-4 rounded-lg bg-emerald-50 border border-emerald-100 p-3.5 text-sm text-emerald-700">{notice}</p>}
      {error && <p className="mt-4 rounded-lg bg-rose-50 border border-rose-100 p-3.5 text-sm text-rose-700">{error}</p>}

      {/* Compose Form */}
      <FormSection
        title={editingId ? `Edit Mail #${editingId}` : "Compose Mail"}
        onSubmit={save}
        actions={
          <>
            <button disabled={busy === "save"} className={`${btnPrimary} disabled:opacity-60`}>
              {busy === "save" ? "Saving..." : editingId ? "Update Mail" : "Create Mail"}
            </button>
            <button type="button" onClick={() => sendQueued(true)} className={`${btnSecondary} inline-flex items-center gap-2`}>
              <RefreshCw size={14} /> Retry Failed
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className={btnSecondary}>Cancel</button>
            )}
          </>
        }
      >
        <FormField label="Template">
          <select onChange={(e) => useTemplate(e.target.value)} className={inputClass} defaultValue="">
            <option value="">Apply saved template</option>
            {templates.filter((t) => t.status === "active").map((t) => <option key={t.id} value={t.id}>{t.name} ({t.slug})</option>)}
          </select>
        </FormField>
        <FormField label="Patient">
          <select value={form.patient_id} onChange={(e) => applyPatient(e.target.value)} className={inputClass}>
            <option value="">Select patient</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name} - {p.email || p.phone}</option>)}
          </select>
        </FormField>
        <FormField label="Link Booking">
          <select value={form.booking_id} onChange={(e) => applyBooking(e.target.value)} className={inputClass}>
            <option value="">Link booking</option>
            {bookings.map((b) => <option key={b.id} value={b.id}>{b.booking_code}</option>)}
          </select>
        </FormField>
        <FormField label="Link Invoice">
          <select value={form.invoice_id} onChange={(e) => setField("invoice_id", e.target.value)} className={inputClass}>
            <option value="">Link invoice</option>
            {invoices.map((inv) => <option key={inv.id} value={inv.id}>{inv.invoice_number}</option>)}
          </select>
        </FormField>
        <FormField label="To Email" required>
          <input required type="email" placeholder="recipient@email.com" value={form.recipient_email} onChange={(e) => setField("recipient_email", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Recipient Name">
          <input placeholder="Name" value={form.recipient_name} onChange={(e) => setField("recipient_name", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="CC Emails">
          <input placeholder="cc@email.com" value={form.cc_emails} onChange={(e) => setField("cc_emails", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="BCC Emails">
          <input placeholder="bcc@email.com" value={form.bcc_emails} onChange={(e) => setField("bcc_emails", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Status">
          <select value={form.status} onChange={(e) => setField("status", e.target.value)} className={inputClass}>
            {["draft", "queued", "sent", "failed"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        <div className="md:col-span-2 lg:col-span-3">
          <FormField label="Subject" required>
            <input required placeholder="Email subject" value={form.subject} onChange={(e) => setField("subject", e.target.value)} className={inputClass} />
          </FormField>
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <FormField label="Body" required>
            <textarea required placeholder="Email body" value={form.body} onChange={(e) => setField("body", e.target.value)} className={`${inputClass} min-h-40`} />
          </FormField>
        </div>
      </FormSection>

      <AdminTable columns={columns} data={visibleMail} perPage={10} emptyTitle="No mail records found" emptyMessage="Create a queued email, then send it through SMTP." />
    </AdminShell>
  );
}
