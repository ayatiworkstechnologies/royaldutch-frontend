"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Clock, Search, Sparkles } from "lucide-react";
import BookingFlow from "@/components/BookingFlow";
import PublicShell from "@/components/PublicShell";
import { api, duration, money } from "@/lib/api";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [bookingSlug, setBookingSlug] = useState("");
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.categories().catch(() => []), api.services().catch(() => [])]).then(([catData, serviceData]) => {
      setCategories(catData);
      setServices(serviceData);
      setLoading(false);
    });
  }, []);

  const visibleServices = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return services.filter((service) => {
      const categoryOk = activeCategory === "all" || service.category_id === Number(activeCategory);
      const queryOk = !needle || `${service.name} ${service.description || ""}`.toLowerCase().includes(needle);
      return categoryOk && queryOk;
    });
  }, [activeCategory, query, services]);

  function openBooking(service) {
    setSuccess(null);
    setBookingSlug(service.slug);
  }

  function closeBooking() {
    setBookingSlug("");
    setSuccess(null);
  }

  return (
    <PublicShell>
      <section className="border-b border-fuchsia-950/5 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#5b0f4d]">
              <Sparkles size={13} />
              Royal Dutch Medical Centre
            </span>
            <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Choose a service and book your appointment.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
              Browse categories, select a treatment, and complete the same booking flow in a popup.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${activeCategory === "all" ? "bg-[#5b0f4d] text-white" : "border border-slate-200 bg-white text-slate-600"}`}
            >
              All Services
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => setActiveCategory(String(category.id))}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${activeCategory === String(category.id) ? "bg-[#5b0f4d] text-white" : "border border-slate-200 bg-white text-slate-600"}`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <label className="flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 lg:w-80">
            <Search size={15} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search services..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm font-semibold text-slate-500">Loading services...</div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleServices.map((service) => (
              <article key={service.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-lg font-bold text-slate-950">{service.name}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {service.description || "Clinic service with appointment confirmation by reception."}
                    </p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-fuchsia-50 text-sm font-bold text-[#5b0f4d]">
                    {String(service.name || "S").slice(0, 1)}
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-sm font-bold text-[#5b0f4d]">{money(service.price, service.currency)}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={12} />
                      {duration(service.duration_minutes)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openBooking(service)}
                    className="rounded-full bg-[#5b0f4d] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#4a0c3f]"
                  >
                    Book Now
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && visibleServices.length === 0 && (
          <div className="mt-8 rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            No services found for this category or search.
          </div>
        )}
      </section>

      {bookingSlug && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
          <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-xl bg-[#fcfafc] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#5b0f4d]">Book Appointment</p>
                {success && <p className="mt-1 text-sm font-semibold text-emerald-700">Request sent: {success.booking_code}</p>}
              </div>
              <button type="button" onClick={closeBooking} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {success ? (
                <div className="mx-auto max-w-xl px-6 py-16 text-center">
                  <h2 className="font-serif text-3xl font-bold text-slate-950">Booking request received</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    Your booking code is <span className="font-bold text-[#5b0f4d]">{success.booking_code}</span>. Our reception team will confirm it shortly.
                  </p>
                  <button type="button" onClick={closeBooking} className="mt-6 rounded-full bg-[#5b0f4d] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
                    Close
                  </button>
                </div>
              ) : (
                <BookingFlow serviceSlug={bookingSlug} onBooked={setSuccess} />
              )}
            </div>
          </div>
        </div>
      )}
    </PublicShell>
  );
}
