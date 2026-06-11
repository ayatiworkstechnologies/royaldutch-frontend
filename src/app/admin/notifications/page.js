"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import AdminTable from "@/components/AdminTable";
import FormSection, { FormField, inputClass, btnPrimary } from "@/components/FormSection";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";

const empty = {
  booking_id: "",
  channel: "dashboard",
  recipient: "admin",
  subject: "",
  message: "",
  status: "queued",
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  async function load() {
    setNotifications(await api.notifications());
  }

  useEffect(() => {
    api.notifications().then(setNotifications).catch((err) => setError(err.message));
  }, []);

  function setField(field, value) {
    setForm((c) => ({ ...c, [field]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createNotification({
        ...form,
        booking_id: form.booking_id ? Number(form.booking_id) : null,
      });
      setForm(empty);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function mark(id, status) {
    await api.updateNotification(id, { status });
    load();
  }

  const columns = [
    {
      key: "subject",
      label: "Subject",
      render: (row) => <span className="font-semibold text-slate-900">{row.subject || row.channel}</span>,
    },
    {
      key: "channel",
      label: "Channel",
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
          {row.channel}
        </span>
      ),
    },
    { key: "recipient", label: "Recipient" },
    { key: "booking_id", label: "Booking", render: (row) => row.booking_id || "–" },
    {
      key: "message",
      label: "Message",
      render: (row) => <span className="max-w-xs truncate block text-slate-600">{row.message}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => mark(row.id, e.target.value)}
          className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold"
        >
          <option value="queued">Queued</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader title="Notifications" description="Manage dashboard, email, WhatsApp and SMS notification queue records." />
      {error && <p className="mt-4 rounded-lg bg-rose-50 border border-rose-100 p-3.5 text-sm text-rose-700">{error}</p>}

      <FormSection
        title="Create Notification"
        onSubmit={save}
        actions={<button className={btnPrimary}>Create Notification</button>}
      >
        <FormField label="Booking ID">
          <input placeholder="Link a booking ID" value={form.booking_id} onChange={(e) => setField("booking_id", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Channel">
          <select value={form.channel} onChange={(e) => setField("channel", e.target.value)} className={inputClass}>
            <option value="dashboard">Dashboard</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
          </select>
        </FormField>
        <FormField label="Recipient" required>
          <input required placeholder="admin, patient, etc." value={form.recipient} onChange={(e) => setField("recipient", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Subject">
          <input placeholder="Notification subject" value={form.subject} onChange={(e) => setField("subject", e.target.value)} className={inputClass} />
        </FormField>
        <div className="md:col-span-2 lg:col-span-3">
          <FormField label="Message" required>
            <textarea required placeholder="Notification message" value={form.message} onChange={(e) => setField("message", e.target.value)} className={`${inputClass} min-h-20`} />
          </FormField>
        </div>
      </FormSection>

      <AdminTable columns={columns} data={notifications} perPage={10} emptyTitle="No notifications yet" emptyMessage="Booking alerts and manual notifications will appear here." />
    </AdminShell>
  );
}
