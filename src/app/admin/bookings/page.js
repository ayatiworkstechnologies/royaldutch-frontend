"use client";

import { useEffect, useMemo, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
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
    return bookings.filter((booking) => {
      return [
        booking.booking_code,
        booking.patient?.full_name,
        booking.patient?.phone,
        booking.service_name,
        booking.staff_name,
      ].some((value) => String(value || "").toLowerCase().includes(needle));
    });
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

  function statusCount(statusValue) {
    if (!statusValue) return bookings.length;
    return bookings.filter((booking) => booking.status === statusValue).length;
  }

  return (
    <AdminShell>
      <AdminPageHeader title="Appointments" description="Start with pending requests, confirm slots, then complete visits after service." />
      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-5 flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2">
        {statusTabs.map(([value, label]) => (
          <button
            key={label}
            onClick={() => {
              setStatus(value);
              load({ status: value, bookingDate });
            }}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold ${
              status === value ? "bg-[#5b0f4d] text-white" : "bg-slate-50 text-slate-700 hover:bg-fuchsia-50"
            }`}
          >
            {label} <span className="ml-1 opacity-70">{statusCount(value)}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
        <input placeholder="Search name, phone, service" value={query} onChange={(event) => setQuery(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2" />
        <input type="date" value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <button onClick={() => load({ status, bookingDate })} className="rounded-md bg-fuchsia-800 px-4 py-2 text-sm font-semibold text-white">
          {loading ? "Loading..." : "Apply Filters"}
        </button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="admin-table min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {["Patient", "Appointment", "Staff", "Price", "Status", "Action", "Mail"].map((head) => (
                <th key={head} className="px-4 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {visibleBookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-4 py-3">
                  <span className="font-semibold">{booking.patient?.full_name}</span>
                  <br />
                  <span className="text-slate-500">{booking.patient?.phone}</span>
                  <br />
                  <span className="text-xs text-slate-400">{booking.booking_code}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold">{booking.service_name}</span>
                  <br />
                  <span className="text-slate-500">{booking.booking_date} at {booking.booking_time}</span>
                </td>
                <td className="px-4 py-3">{booking.staff_name}</td>
                <td className="px-4 py-3">{money(booking.price, booking.currency)}</td>
                <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex min-w-56 flex-wrap gap-2">
                    {booking.status === "pending" ? (
                      <button onClick={() => changeStatus(booking.id, "confirmed")} className="rounded-md bg-[#5b0f4d] px-3 py-2 text-xs font-semibold text-white">Confirm</button>
                    ) : null}
                    {booking.status === "confirmed" ? (
                      <button onClick={() => changeStatus(booking.id, "completed")} className="rounded-md bg-[#5b0f4d] px-3 py-2 text-xs font-semibold text-white">Complete</button>
                    ) : null}
                    {booking.status !== "cancelled" && booking.status !== "completed" ? (
                      <button onClick={() => changeStatus(booking.id, "cancelled")} className="rounded-md border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">Cancel</button>
                    ) : null}
                    <select value={booking.status} onChange={(event) => changeStatus(booking.id, event.target.value)} className="rounded-md border border-slate-300 px-2 py-2 text-xs">
                      {statuses.map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}
                    </select>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => queueMail(booking.id, booking.status === "confirmed" ? "reminder" : "confirmed")} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold">
                      Queue Email
                    </button>
                    <a className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold" href={`mailto:${booking.patient?.email || ""}`}>Open Email</a>
                    <a className="rounded-md border border-fuchsia-200 px-3 py-2 text-xs font-semibold text-fuchsia-800" href={`https://wa.me/${String(booking.patient?.phone || "").replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visibleBookings.length === 0 ? <div className="mt-5"><EmptyState title="No bookings found" message="Try clearing filters or wait for new appointment requests." /></div> : null}
    </AdminShell>
  );
}
