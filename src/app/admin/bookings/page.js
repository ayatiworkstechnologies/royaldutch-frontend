"use client";

import { useEffect, useMemo, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import AdminTable from "@/components/AdminTable";
import StatusBadge from "@/components/StatusBadge";
import { inputClass } from "@/components/FormSection";
import { api, money } from "@/lib/api";

const statuses = ["pending", "confirmed", "completed", "cancelled", "rescheduled", "no_show"];
const statusTabs = [
  ["", "All"],
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(filters = { status, bookingDate }) {
    setLoading(true);
    setError("");
    try {
      setBookings(await api.bookings(filters));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.bookings().then(setBookings).catch((err) => setError(err.message));
  }, []);

  const visibleBookings = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return bookings;
    return bookings.filter((booking) =>
      [booking.booking_code, booking.patient?.full_name, booking.patient?.phone, booking.service_name, booking.staff_name]
        .some((v) => String(v || "").toLowerCase().includes(needle))
    );
  }, [bookings, query]);

  async function changeStatus(id, nextStatus) {
    await api.updateBookingStatus(id, nextStatus);
    load();
  }

  async function queueMail(id, template) {
    setError("");
    try {
      await api.queueBookingMail(id, template);
    } catch (err) {
      setError(err.message);
    }
  }

  function statusCount(val) {
    if (!val) return bookings.length;
    return bookings.filter((b) => b.status === val).length;
  }

  const columns = [
    {
      key: "patient",
      label: "Patient",
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900">{row.patient?.full_name}</span>
          <br />
          <span className="text-xs text-slate-500">{row.patient?.phone}</span>
          <br />
          <code className="text-[10px] text-slate-400">{row.booking_code}</code>
        </div>
      ),
    },
    {
      key: "appointment",
      label: "Appointment",
      render: (row) => (
        <div>
          <span className="font-semibold">{row.service_name}</span>
          <br />
          <span className="text-xs text-slate-500">{row.booking_date} at {row.booking_time}</span>
        </div>
      ),
    },
    { key: "staff_name", label: "Staff" },
    { key: "price", label: "Price", render: (row) => <span className="font-semibold">{money(row.price, row.currency)}</span> },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.status === "pending" && (
            <button onClick={() => changeStatus(row.id, "confirmed")} className="rounded-lg bg-[#5b0f4d] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#4a0c3f]">Confirm</button>
          )}
          {row.status === "confirmed" && (
            <button onClick={() => changeStatus(row.id, "completed")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700">Complete</button>
          )}
          {row.status !== "cancelled" && row.status !== "completed" && (
            <button onClick={() => changeStatus(row.id, "cancelled")} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">Cancel</button>
          )}
          <select value={row.status} onChange={(e) => changeStatus(row.id, e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs">
            {statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>
      ),
    },
    {
      key: "mail",
      label: "Mail",
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => queueMail(row.id, row.status === "confirmed" ? "reminder" : "confirmed")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-fuchsia-50 hover:text-fuchsia-700">
            Queue
          </button>
          <a className="rounded-lg border border-fuchsia-200 px-3 py-1.5 text-xs font-semibold text-fuchsia-800 transition hover:bg-fuchsia-50" href={`https://wa.me/${String(row.patient?.phone || "").replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader title="Appointments" description="Start with pending requests, confirm slots, then complete visits after service." />
      {error && <p className="mt-4 rounded-lg bg-rose-50 border border-rose-100 p-3.5 text-sm text-rose-700">{error}</p>}

      {/* Status tabs */}
      <div className="mt-5 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm shadow-slate-100">
        {statusTabs.map(([value, label]) => (
          <button
            key={label}
            onClick={() => { setStatus(value); load({ status: value, bookingDate }); }}
            className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              status === value
                ? "bg-[#5b0f4d] text-white shadow-sm shadow-fuchsia-900/20"
                : "bg-slate-50 text-slate-700 hover:bg-fuchsia-50 hover:text-fuchsia-800"
            }`}
          >
            {label} <span className="ml-1 opacity-70">{statusCount(value)}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100 md:grid-cols-4">
        <input placeholder="Search name, phone, service..." value={query} onChange={(e) => setQuery(e.target.value)} className={`${inputClass} md:col-span-2`} />
        <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className={inputClass} />
        <button
          onClick={() => load({ status, bookingDate })}
          className="rounded-lg bg-[#5b0f4d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-fuchsia-900/10 transition hover:bg-[#4a0c3f]"
        >
          {loading ? "Loading..." : "Apply Filters"}
        </button>
      </div>

      <AdminTable columns={columns} data={visibleBookings} perPage={10} emptyTitle="No bookings found" emptyMessage="Try clearing filters or wait for new appointment requests." />
    </AdminShell>
  );
}
