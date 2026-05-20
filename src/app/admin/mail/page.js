"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, RefreshCw, Send, ShieldCheck } from "lucide-react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import EmptyState from "@/components/EmptyState";
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

function badgeClass(status) {
  if (status === "sent") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (status === "failed") return "bg-rose-50 text-rose-700 ring-rose-100";
  if (status === "queued") return "bg-amber-50 text-amber-700 ring-amber-100";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

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
      api.mail(),
      api.bookings(),
      api.patients(),
      api.invoices(),
      api.emailTemplates(),
      api.smtpStatus(),
    ]);
    setMail(mailData);
    setBookings(bookingData);
    setPatients(patientData);
    setInvoices(invoiceData);
    setTemplates(templateData);
    setSmtp(smtpData);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const stats = useMemo(() => {
    const base = { all: mail.length, draft: 0, queued: 0, sent: 0, failed: 0 };
    mail.forEach((item) => {
      base[item.status] = (base[item.status] || 0) + 1;
    });
    return base;
  }, [mail]);

  const visibleMail = useMemo(() => {
    if (filter === "all") return mail;
    return mail.filter((item) => item.status === filter);
  }, [filter, mail]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function applyPatient(patientId) {
    const patient = patients.find((item) => item.id === Number(patientId));
    setForm((current) => ({
      ...current,
      patient_id: patientId,
      recipient_name: patient?.full_name || current.recipient_name,
      recipient_email: patient?.email || current.recipient_email,
    }));
  }

  function applyBooking(bookingId) {
    const booking = bookings.find((item) => item.id === Number(bookingId));
    setForm((current) => ({
      ...current,
      booking_id: bookingId,
      patient_id: booking?.patient_id || current.patient_id,
    }));
  }

  function useTemplate(templateId) {
    const template = templates.find((item) => item.id === Number(templateId));
    if (!template) return;
    setForm((current) => ({ ...current, subject: template.subject, body: template.body, status: "queued" }));
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

  async function save(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy("save");
    try {
      if (editingId) await api.updateMail(editingId, payload());
      else await api.createMail(payload());
      setForm(empty);
      setEditingId(null);
      setNotice(editingId ? "Mail updated." : "Mail queued.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  function edit(item) {
    setEditingId(item.id);
    setNotice("");
    setError("");
    setForm({
      booking_id: item.booking_id || "",
      patient_id: item.patient_id || "",
      invoice_id: item.invoice_id || "",
      recipient_email: item.recipient_email,
      cc_emails: item.cc_emails || "",
      bcc_emails: item.bcc_emails || "",
      recipient_name: item.recipient_name || "",
      subject: item.subject,
      body: item.body,
      status: item.status,
      provider_message_id: item.provider_message_id || "",
      error_message: item.error_message || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function mark(id, status) {
    setBusy(`mark-${id}`);
    await api.updateMail(id, { status, error_message: status === "queued" ? null : undefined });
    await load();
    setBusy("");
  }

  async function sendOne(id) {
    setError("");
    setNotice("");
    setBusy(`send-${id}`);
    try {
      const result = await api.sendMail(id);
      await load();
      if (result.status === "sent") setNotice(`Mail #${id} sent successfully.`);
      else setError(result.error_message || `Mail #${id} failed.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function sendQueued(includeFailed = false) {
    setError("");
    setNotice("");
    setBusy(includeFailed ? "retry" : "queue");
    try {
      const result = await api.sendQueuedMail(includeFailed);
      await load();
      setNotice(`Mail send completed: ${result.sent} sent, ${result.failed} failed, ${result.total} checked.`);
      if (result.failed) {
        const firstError = result.results?.find((item) => item.error_message)?.error_message;
        if (firstError) setError(firstError);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function checkSmtp() {
    setError("");
    setNotice("");
    setBusy("smtp");
    try {
      const result = await api.smtpStatus();
      setSmtp(result);
      if (result.ok) setNotice("SMTP login working.");
      else setError(result.error || "SMTP is not connected.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function remove(id) {
    setBusy(`delete-${id}`);
    await api.deleteMail(id);
    await load();
    setBusy("");
  }

  return (
    <AdminShell>
      <AdminPageHeader
        title="Email Service"
        description="Send appointment, payment and clinic emails through the configured SMTP account."
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={checkSmtp} className="inline-flex items-center gap-2 rounded-md border border-fuchsia-200 px-4 py-2 text-sm font-semibold text-[#5b0f4d]">
              <ShieldCheck size={16} /> Test SMTP
            </button>
            <button onClick={() => sendQueued(false)} className="inline-flex items-center gap-2 rounded-md bg-[#5b0f4d] px-4 py-2 text-sm font-semibold text-white">
              <Send size={16} /> Send Queue
            </button>
          </div>
        }
      />

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {["all", "draft", "queued", "sent", "failed"].map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`rounded-lg border p-4 text-left ${filter === item ? "border-[#5b0f4d] bg-fuchsia-50" : "border-slate-200 bg-white"}`}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{item}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stats[item] || 0}</p>
          </button>
        ))}
      </div>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">SMTP Status</p>
            <p className="mt-1 text-sm text-slate-500">
              {smtp ? `${smtp.host}:${smtp.port} - ${smtp.from_email || smtp.login}` : "Checking SMTP settings"}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${smtp?.ok ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-rose-50 text-rose-700 ring-rose-100"}`}>
            {smtp?.ok ? "Connected" : "Needs Check"}
          </span>
        </div>
      </section>

      {notice ? <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p> : null}
      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <form onSubmit={save} className="mt-5 grid gap-4 rounded-lg border border-fuchsia-100 bg-white p-5 shadow-sm md:grid-cols-3">
        <div className="md:col-span-3">
          <p className="text-sm font-semibold text-slate-900">{editingId ? `Edit Mail #${editingId}` : "Compose Mail"}</p>
          <select onChange={(event) => useTemplate(event.target.value)} className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm md:w-96" defaultValue="">
            <option value="">Apply saved template</option>
            {templates.filter((template) => template.status === "active").map((template) => (
              <option key={template.id} value={template.id}>{template.name} ({template.slug})</option>
            ))}
          </select>
        </div>

        <select value={form.patient_id} onChange={(event) => applyPatient(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="">Select patient</option>
          {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.full_name} - {patient.email || patient.phone}</option>)}
        </select>
        <select value={form.booking_id} onChange={(event) => applyBooking(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="">Link booking</option>
          {bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.booking_code}</option>)}
        </select>
        <select value={form.invoice_id} onChange={(event) => setField("invoice_id", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="">Link invoice</option>
          {invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoice_number}</option>)}
        </select>

        <input required type="email" placeholder="To email" value={form.recipient_email} onChange={(event) => setField("recipient_email", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <input placeholder="CC emails" value={form.cc_emails} onChange={(event) => setField("cc_emails", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <input placeholder="BCC emails" value={form.bcc_emails} onChange={(event) => setField("bcc_emails", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <input placeholder="Recipient name" value={form.recipient_name} onChange={(event) => setField("recipient_name", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <select value={form.status} onChange={(event) => setField("status", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          {["draft", "queued", "sent", "failed"].map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <input placeholder="Provider message ID" value={form.provider_message_id} onChange={(event) => setField("provider_message_id", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <input required placeholder="Subject" value={form.subject} onChange={(event) => setField("subject", event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 md:col-span-3" />
        <textarea required placeholder="Email body" value={form.body} onChange={(event) => setField("body", event.target.value)} className="min-h-40 rounded-md border border-slate-300 px-3 py-2 md:col-span-3" />
        <div className="flex flex-wrap gap-2 md:col-span-3">
          <button disabled={busy === "save"} className="rounded-md bg-fuchsia-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy === "save" ? "Saving..." : editingId ? "Update Mail" : "Create Mail"}
          </button>
          <button type="button" onClick={() => sendQueued(true)} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">
            <RefreshCw size={16} /> Retry Failed
          </button>
          {editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">Cancel Edit</button> : null}
        </div>
      </form>

      <div className="mt-5 space-y-3">
        {visibleMail.length === 0 ? <EmptyState title="No mail records found" message="Create a queued email, then send it through SMTP." /> : null}
        {visibleMail.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Mail size={16} className="text-[#5b0f4d]" />
                  <p className="font-semibold text-slate-900">{item.subject}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badgeClass(item.status)}`}>{item.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">To {item.recipient_email} - booking {item.booking_id || "-"} - invoice {item.invoice_id || "-"}</p>
                {item.cc_emails ? <p className="mt-1 text-xs text-slate-500">CC {item.cc_emails}</p> : null}
                {item.bcc_emails ? <p className="mt-1 text-xs text-slate-500">BCC {item.bcc_emails}</p> : null}
                <p className="mt-3 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.body}</p>
                {item.error_message ? <p className="mt-3 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{item.error_message}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <select disabled={busy === `mark-${item.id}`} value={item.status} onChange={(event) => mark(item.id, event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                  <option value="draft">Draft</option>
                  <option value="queued">Queued</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                </select>
                <button disabled={busy === `send-${item.id}`} onClick={() => sendOne(item.id)} className="inline-flex items-center gap-2 rounded-md bg-[#5b0f4d] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  <Send size={15} /> {busy === `send-${item.id}` ? "Sending" : "Send"}
                </button>
                <button onClick={() => edit(item)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Edit</button>
                <button disabled={busy === `delete-${item.id}`} onClick={() => remove(item.id)} className="rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-700 disabled:opacity-60">Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
