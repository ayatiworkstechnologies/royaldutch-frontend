"use client";

import { useEffect, useMemo, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function AdminCalendarPage() {
  const [startDate, setStartDate] = useState(dateOffset(0));
  const [endDate, setEndDate] = useState(dateOffset(7));
  const [staffId, setStaffId] = useState("");
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const [bookingData, staffData] = await Promise.all([
        api.calendarBookings({ startDate, endDate, staffId }),
        api.staff(),
      ]);
      setBookings(bookingData);
      setStaff(staffData);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    Promise.all([api.calendarBookings({ startDate, endDate, staffId }), api.staff()])
      .then(([bookingData, staffData]) => {
        setBookings(bookingData);
        setStaff(staffData);
      })
      .catch((err) => setError(err.message));
  }, [startDate, endDate, staffId]);

  const grouped = useMemo(() => {
    return bookings.reduce((acc, booking) => {
      acc[booking.booking_date] = [...(acc[booking.booking_date] || []), booking];
      return acc;
    }, {});
  }, [bookings]);

  return (
    <AdminShell>
      <AdminPageHeader title="Calendar View" description="Scan appointments by day, date range and specialist." />
      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
        <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <select value={staffId} onChange={(event) => setStaffId(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="">All staff</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>{member.name}</option>
          ))}
        </select>
        <button onClick={load} className="rounded-md bg-fuchsia-800 px-4 py-2 text-sm font-semibold text-white">Refresh</button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {Object.keys(grouped).length === 0 ? (
          <EmptyState title="No appointments in this range" message="Try a different date range or staff filter." />
        ) : null}
        {Object.entries(grouped).map(([date, items]) => (
          <section key={date} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{date}</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{items.length} bookings</span>
            </div>
            <div className="mt-4 space-y-3">
              {items.map((booking) => (
                <div key={booking.id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold">{booking.booking_time} - {booking.service_name}</p>
                      <p className="mt-1 text-sm text-slate-500">{booking.patient?.full_name} with {booking.staff_name}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AdminShell>
  );
}
