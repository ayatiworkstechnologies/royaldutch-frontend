"use client";

import { useState } from "react";
import PublicShell from "@/components/PublicShell";
import StatusBadge from "@/components/StatusBadge";
import { api, money } from "@/lib/api";
import { 
  Phone, 
  Calendar, 
  Clock, 
  User, 
  Sparkles, 
  AlertCircle,
  Hash
} from "lucide-react";

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
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-50 border border-fuchsia-100 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-fuchsia-800">
            <Sparkles size={11} className="text-amber-500" />
            Patient Desk
          </span>
          <h1 className="mt-4 text-3xl font-bold font-serif tracking-tight text-slate-900 sm:text-4xl">My Appointments</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
            Enter the mobile number associated with your appointment request to review slots, schedules, and active confirmations.
          </p>
        </div>

        {/* Premium Lookup Card */}
        <div className="premium-card p-6 md:p-8 max-w-2xl mx-auto shadow-xl">
          <form onSubmit={lookup} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-grow flex items-center">
              <Phone size={14} className="absolute left-4 text-slate-400" />
              <input 
                required 
                value={phone} 
                onChange={(event) => setPhone(event.target.value)} 
                placeholder="Enter mobile phone number..." 
                className="premium-input pl-10 w-full text-sm font-semibold" 
              />
            </div>
            <button className="btn-premium-primary py-3 px-6 text-xs sm:text-sm tracking-wider uppercase font-bold shrink-0 shadow-md">
              {loading ? "Searching..." : "Lookup Bookings"}
            </button>
          </form>

          {error ? (
            <div className="mt-4 rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs sm:text-sm text-rose-800 flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>

        {/* Search Results */}
        <div className="mt-10 space-y-4 max-w-2xl mx-auto">
          {bookings.length === 0 && !loading && !error && (
            <div className="text-center py-10 text-slate-400 text-xs">
              No active search query. Type your number above.
            </div>
          )}

          {bookings.map((booking) => (
            <article 
              key={booking.id} 
              className="premium-card p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-50 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">{booking.service_name}</h3>
                  <div className="mt-2.5 space-y-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      {booking.booking_date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" />
                      At {booking.booking_time} (Session duration details)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" />
                      Doctor: {booking.staff_name || "Any Specialist"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-2 shrink-0">
                  <StatusBadge status={booking.status} />
                  <span className="text-sm font-bold text-fuchsia-950 mt-1">
                    {money(booking.price, booking.currency)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Hash size={12} />
                  Code: {booking.booking_code}
                </span>
                <span>Royal Dutch Medical Centre</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
