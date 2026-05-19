"use client";

import { useState } from "react";
import PublicShell from "@/components/PublicShell";
import StatusBadge from "@/components/StatusBadge";
import { api, money } from "@/lib/api";

export default function MyBookingsPage() {
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      setBookings(await api.lookupBookings(phone));
    } catch (err) {
      setError(err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">My Bookings</h1>
        <form onSubmit={lookup} className="mt-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 sm:flex-row">
          <input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Enter mobile number" className="h-11 flex-1 rounded-md border border-slate-300 px-3" />
          <button className="h-11 rounded-md bg-fuchsia-800 px-5 text-sm font-semibold text-white">{loading ? "Checking..." : "Lookup"}</button>
        </form>
        {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
        <div className="mt-6 space-y-3">
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{booking.service_name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {booking.booking_date} at {booking.booking_time} with {booking.staff_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Code: {booking.booking_code}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={booking.status} />
                  <p className="mt-2 text-sm font-semibold">{money(booking.price, booking.currency)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
