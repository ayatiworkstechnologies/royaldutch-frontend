"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import EmptyState from "@/components/EmptyState";
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
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save(event) {
    event.preventDefault();
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

  return (
    <AdminShell>
      <AdminPageHeader title="Notifications" description="Manage dashboard, email, WhatsApp and SMS notification queue records." />
      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <form onSubmit={save} className="mt-5 grid gap-3 soft-card rounded-lg p-5 md:grid-cols-3">
        <input placeholder="Booking ID" value={form.booking_id} onChange={(e) => setField("booking_id", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <select value={form.channel} onChange={(e) => setField("channel", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="dashboard">Dashboard</option>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
        </select>
        <input required placeholder="Recipient" value={form.recipient} onChange={(e) => setField("recipient", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <input placeholder="Subject" value={form.subject} onChange={(e) => setField("subject", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 md:col-span-1" />
        <textarea required placeholder="Message" value={form.message} onChange={(e) => setField("message", e.target.value)} className="min-h-20 rounded-md border border-slate-300 px-3 py-2 md:col-span-2" />
        <button className="rounded-md bg-fuchsia-800 px-4 py-2 text-sm font-semibold text-white">Create Notification</button>
      </form>

      <div className="mt-5 space-y-3">
        {notifications.length === 0 ? <EmptyState title="No notifications yet" message="Booking alerts and manual notifications will appear here." /> : null}
        {notifications.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.subject || item.channel}</p>
                <p className="mt-1 text-sm text-slate-500">{item.recipient} - booking {item.booking_id || "-"}</p>
                <p className="mt-2 text-sm text-slate-700">{item.message}</p>
              </div>
              <select value={item.status} onChange={(event) => mark(item.id, event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="queued">Queued</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
