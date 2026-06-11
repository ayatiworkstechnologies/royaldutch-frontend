"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import PublicShell from "@/components/PublicShell";
import { api, duration, money } from "@/lib/api";
import { Calendar, UserCheck, ShieldCheck, Sparkles, ChevronRight, Bookmark, Clock } from "lucide-react";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.categories().catch(() => []),
      api.services().catch(() => [])
    ]).then(([catData, servData]) => {
      setCategories(catData);
      setServices(servData);
      setLoading(false);
    });
  }, []);

  const featured = services.slice(0, 6);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  if (loading) {
    return (
      <PublicShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-fuchsia-200 border-t-fuchsia-800"></div>
          <p className="text-sm font-medium">Entering Royal Dutch Portal...</p>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      {/* Luxury Hero Banner */}
      <section className="luxury-mesh-bg text-white relative overflow-hidden py-16 lg:py-24 border-b border-fuchsia-950/20">
        {/* Fine background details */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div>
              <motion.span 
                variants={itemVariants}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-fuchsia-200 border border-white/10"
              >
                <Sparkles size={12} className="text-amber-300 animate-pulse" />
                Royal Dutch Medical Centre
              </motion.span>
              
              <motion.h1 
                variants={itemVariants}
                className="mt-6 font-serif text-4xl font-semibold tracking-tight sm:text-6xl text-white leading-[1.1]"
              >
                Where Luxury Meets <span className="text-[#e8c0e2] italic font-normal">Expert Medical Care</span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="mt-6 max-w-xl text-base leading-8 text-fuchsia-100/85 sm:text-lg"
              >
                Experience premium wellness and aesthetics. Browse our curated treatments, choose your dedicated specialist, and book your priority appointment in seconds.
              </motion.p>
              
              <motion.div 
                variants={itemVariants} 
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link href="/book" className="btn-premium-primary bg-white text-[#5b0f4d] hover:bg-fuchsia-50 hover:text-[#38072e] shadow-lg shadow-black/10 px-6 py-3.5 text-sm tracking-wider uppercase font-bold">
                  Book Appointment
                </Link>
                <Link href="/services" className="btn-premium-secondary border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white px-6 py-3.5 text-sm tracking-wider uppercase font-bold backdrop-blur-sm">
                  Explore Services
                </Link>
                <Link href="/my-bookings" className="rounded-full border border-white/10 bg-transparent px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-fuchsia-200 hover:bg-white/5 transition-all">
                  My Booking Status
                </Link>
              </motion.div>
            </div>

            {/* Popular Services Dashboard View */}
            <motion.div 
              variants={itemVariants}
              className="glass-panel rounded-2xl p-6 shadow-2xl relative border border-white/15"
            >
              <div className="flex items-center justify-between pb-4 border-b border-fuchsia-950/10">
                <div>
                  <h2 className="text-base font-bold text-fuchsia-950">Popular Treatments</h2>
                  <p className="text-xs text-slate-500 mt-0.5">High-demand clinic wellness packages</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 border border-fuchsia-100 px-2.5 py-0.5 text-[10px] font-bold text-fuchsia-900 uppercase tracking-wider">
                  Live Catalog
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {featured.map((service) => (
                  <Link 
                    key={service.id} 
                    href={`/book/${service.slug}`} 
                    className="block group rounded-xl border border-slate-100 bg-white p-3.5 hover:border-fuchsia-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-fuchsia-950 transition-colors text-sm sm:text-base">{service.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" />
                          {duration(service.duration_minutes)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-fuchsia-900">{money(service.price, service.currency)}</span>
                        <ChevronRight size={14} className="text-slate-400 group-hover:text-fuchsia-900 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Structured Patient Workflow Journey */}
      <section className="bg-white py-16 border-b border-fuchsia-950/5 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-800">Booking Desk</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1 font-serif">Patient Journey Flow</h2>
                </div>
                <Link href="/book" className="btn-premium-primary text-xs tracking-wider uppercase px-5 py-3">
                  Start booking now
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                {[
                  ["1", "Select Treatment", "Pick a premium service from our catalog."],
                  ["2", "Pick Doctor", "Select your specialist or any available doctor."],
                  ["3", "Choose Slot", "Pick a comfortable date and hourly slot."],
                  ["4", "Submit Request", "Confirm clinic details and wait for confirmation."],
                ].map(([number, label, desc]) => (
                  <div key={number} className="premium-card p-5 relative overflow-hidden group">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fdfafc] text-sm font-bold text-fuchsia-800 ring-1 ring-fuchsia-100 group-hover:bg-[#5b0f4d] group-hover:text-white transition-colors duration-300">
                      {number}
                    </span>
                    <p className="mt-4 font-bold text-slate-900 text-sm">{label}</p>
                    <p className="mt-1 text-xs text-slate-500 leading-normal">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Admin Navigation Desk */}
            <div className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-6 backdrop-blur">
              <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-800 flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Operations Panel
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2 font-serif">Admin Control</h2>
              <p className="mt-2 text-xs leading-normal text-slate-500">
                Staff portal for appointment verification, patient records, invoicing flows, and SMTP email settings.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Link href="/admin/login" className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-200/80 hover:border-fuchsia-300 hover:shadow-sm transition-all text-xs font-bold uppercase tracking-wider text-[#5b0f4d]">
                  <span>Admin Login Portal</span>
                  <ChevronRight size={14} />
                </Link>
                <Link href="/admin/bookings" className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-200/80 hover:border-fuchsia-300 hover:shadow-sm transition-all text-xs font-bold uppercase tracking-wider text-[#5b0f4d]">
                  <span>Manage Bookings</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 border-b border-slate-100 pb-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-800">Specialities</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1 font-serif">Service Categories</h2>
          </div>
          <Link href="/services" className="text-xs font-bold uppercase tracking-wider text-fuchsia-800 flex items-center gap-1 hover:underline">
            All categories
            <ChevronRight size={14} />
          </Link>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/services/${category.slug}`} 
              className="premium-card p-6 flex flex-col justify-between min-h-36 group"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-900 ring-1 ring-fuchsia-100 group-hover:bg-[#5b0f4d] group-hover:text-white transition-all duration-300">
                  <Bookmark size={14} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Code: {category.external_id || category.id}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold text-slate-950 group-hover:text-fuchsia-950 transition-colors font-serif">{category.name}</h3>
                <p className="mt-1 text-xs text-slate-500">Explore treatments in this clinical speciality</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
