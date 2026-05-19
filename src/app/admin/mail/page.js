"use client";

import { useEffect, useState } from "react";
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
  status: "draft",
  provider_message_id: "",
  error_message: "",
};

export default function AdminMailPage() {
  const [mail, setMail] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const [mailData, bookingData, patientData, invoiceData] = await Promise.all([
      api.mail(),
      api.bookings(),
      api.patients(),
      api.invoices(),
    ]);
    setMail(mailData);
    setBookings(bookingData);
    setPatients(patientData);
    setInvoices(invoiceData);
  }

  useEffect(() => {
    Promise.all([api.mail(), api.bookings(), api.patients(), api.invoices()])
      .then(([mailData, bookingData, patientData, invoiceData]) => {
        setMail(mailData);
        setBookings(bookingData);
        setPatients(patientData);
        setInvoices(invoiceData);
      })
      .catch((err) => setError(err.message));
  }, []);

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
    try {
      if (editingId) await api.updateMail(editingId, payload());
      else await api.createMail(payload());
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function edit(item) {
    setEditingId(item.id);
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
  }

  async function mark(id, status) {
    await api.updateMail(id, { status });
    load();
  }

  async function sendOne(id) {
    setError("");
    try {
      await api.sendMail(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function sendQueued() {
    setError("");
    try {
      await api.sendQueuedMail();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        title="Email Service"
        description="Compose mail with To, CC and BCC, queue booking emails, then send through SMTP."
        action={<button onClick={sendQueued} className="rounded-md bg-[#5b0f4d] px-4 py-2 text-sm font-semibold text-white">Send Queued Mail</button>}
      />
      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <form onSubmit={save} className="mt-5 grid gap-3 soft-card rounded-lg p-5 md:grid-cols-3">
        <select value={form.patient_id} onChange={(e) => applyPatient(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="">Select patient</option>
          {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.full_name} - {patient.email || patient.phone}</option>)}
        </select>
        <select value={form.booking_id} onChange={(e) => setField("booking_id", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="">Link booking</option>
          {bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.booking_code}</option>)}
        </select>
        <select value={form.invoice_id} onChange={(e) => setField("invoice_id", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="">Link invoice</option>
          {invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoice_number}</option>)}
        </select>
        <input required type="email" placeholder="Recipient email" value={form.recipient_email} onChange={(e) => setField("recipient_email", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <input placeholder="Recipient name" value={form.recipient_name} onChange={(e) => setField("recipient_name", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <select value={form.status} onChange={(e) => setField("status", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          {["draft", "queued", "sent", "failed"].map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <input placeholder="CC emails comma separated" value={form.cc_emails} onChange={(e) => setField("cc_emails", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 md:col-span-3" />
        <input placeholder="BCC emails comma separated" value={form.bcc_emails} onChange={(e) => setField("bcc_emails", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 md:col-span-3" />
        <input required placeholder="Subject" value={form.subject} onChange={(e) => setField("subject", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 md:col-span-3" />
        <textarea required placeholder="Email body" value={form.body} onChange={(e) => setField("body", e.target.value)} className="min-h-36 rounded-md border border-slate-300 px-3 py-2 md:col-span-3" />
        <input placeholder="Provider message ID" value={form.provider_message_id} onChange={(e) => setField("provider_message_id", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <input placeholder="Error message" value={form.error_message} onChange={(e) => setField("error_message", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2" />
        <div className="flex flex-wrap gap-2 md:col-span-3">
          <button className="rounded-md bg-fuchsia-800 px-4 py-2 text-sm font-semibold text-white">{editingId ? "Update" : "Create"} Mail</button>
          <button type="button" onClick={() => setField("status", "queued")} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">Set Queued</button>
          {editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">Cancel Edit</button> : null}
        </div>
      </form>

      <div className="mt-5 space-y-3">
        {mail.length === 0 ? <EmptyState title="No mail records yet" message="Compose email drafts or queue messages for SMTP integration." /> : null}
        {mail.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.subject}</p>
                <p className="mt-1 text-sm text-slate-500">To {item.recipient_email} - booking {item.booking_id || "-"} - invoice {item.invoice_id || "-"}</p>
                {item.cc_emails ? <p className="mt-1 text-xs text-slate-500">CC {item.cc_emails}</p> : null}
                {item.bcc_emails ? <p className="mt-1 text-xs text-slate-500">BCC {item.bcc_emails}</p> : null}
                <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm text-slate-700">{item.body}</p>
                {item.error_message ? <p className="mt-2 text-sm text-rose-700">{item.error_message}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={item.status} onChange={(event) => mark(item.id, event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                  <option value="draft">Draft</option>
                  <option value="queued">Queued</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                </select>
                <button onClick={() => sendOne(item.id)} className="rounded-md bg-[#5b0f4d] px-3 py-2 text-sm font-semibold text-white">Send</button>
                <button onClick={() => edit(item)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Edit</button>
                <button onClick={() => api.deleteMail(item.id).then(load)} className="rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-700">Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
