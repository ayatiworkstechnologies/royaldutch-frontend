"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import EmptyState from "@/components/EmptyState";
import { api, money } from "@/lib/api";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  CheckCircle, 
  Coins, 
  ChevronRight, 
  Activity, 
  TrendingUp,
  Sparkles
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard().then(setStats).catch((err) => setError(err.message));
  }, []);

  const metrics = [
    { label: "Today", value: stats?.todays_bookings ?? 0, note: "On daily schedule", href: "/admin/calendar", icon: Calendar, color: "from-blue-500 to-indigo-600" },
    { label: "Pending", value: stats?.pending_bookings ?? 0, note: "Verifications needed", href: "/admin/bookings", icon: Clock, color: "from-amber-500 to-orange-600" },
    { label: "Confirmed", value: stats?.confirmed_bookings ?? 0, note: "Ready for visit", href: "/admin/bookings", icon: CheckCircle2, color: "from-fuchsia-500 to-purple-600" },
    { label: "Completed", value: stats?.completed_bookings ?? 0, note: "Finished slots", href: "/admin/bookings", icon: CheckCircle, color: "from-emerald-500 to-teal-600" },
    { label: "Revenue", value: money(stats?.total_revenue ?? 0, "AED"), note: "Settled invoices", href: "/admin/payments", icon: Coins, color: "from-[#861265] to-[#38072e]" },
  ];

  const workflow = [
    ["1", "Review pending bookings", "Verify slot availability and confirm requests.", "/admin/bookings"],
    ["2", "Daily calendar schedule", "Observe doctor shifts and hour slots.", "/admin/calendar"],
    ["3", "Mark visit complete", "Check patients in or file no-shows.", "/admin/bookings"],
    ["4", "Generate billing invoice", "Create balance records and record payments.", "/admin/billing"],
    ["5", "Follow up notification", "Send patient emails or template SMTP alerts.", "/admin/mail"],
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Operational Overview"
        description="Daily clinics pipeline for reception desks, scheduling desks, and billing operations."
        action={
          <Link href="/admin/bookings" className="btn-premium-primary text-xs uppercase tracking-wider py-2.5 px-5 shadow-lg shadow-fuchsia-950/10 gap-1">
            <span>Verify Pending</span>
            <ChevronRight size={14} />
          </Link>
        }
      />

      {error ? (
        <div className="mt-5 rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs sm:text-sm text-rose-850">
          {error}
        </div>
      ) : null}

      {/* Metrics Cards Grid */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link 
              key={item.label} 
              href={item.href} 
              className="premium-card p-5 relative overflow-hidden flex flex-col justify-between group"
            >
              {/* Colored top glowing bar */}
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${item.color}`} />
              
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 group-hover:text-[#5b0f4d] transition-colors">{item.value}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 group-hover:bg-[#fdfafc] group-hover:text-[#5b0f4d] transition-all border border-slate-100">
                  <IconComponent size={16} />
                </span>
              </div>
              
              <p className="mt-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={10} className="text-slate-400 animate-pulse" />
                {item.note}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Daily Workflow Timeline */}
        <section className="premium-card p-6 md:p-8">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <span className="p-1.5 rounded-lg bg-fuchsia-50 text-[#5b0f4d] ring-1 ring-fuchsia-100/60">
              <Sparkles size={16} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-serif">Daily Workflow Roadmap</h2>
              <p className="text-xs text-slate-500">Standard operating procedure for the reception desk</p>
            </div>
          </div>
          
          <div className="grid gap-4">
            {workflow.map(([number, title, note, href]) => (
              <Link 
                key={number} 
                href={href} 
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 hover:border-fuchsia-200 hover:shadow-sm transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-50 to-fuchsia-100/40 text-sm font-bold text-[#5b0f4d] ring-1 ring-fuchsia-100/40 group-hover:from-[#5b0f4d] group-hover:to-[#38072e] group-hover:text-white transition-all duration-300">
                    {number}
                  </span>
                  <div>
                    <span className="block font-bold text-slate-900 text-sm sm:text-base group-hover:text-fuchsia-950 transition-colors">{title}</span>
                    <span className="mt-0.5 block text-xs text-slate-500 leading-normal">{note}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-[#5b0f4d] group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {/* Most Booked Services Leaderboard */}
        <section className="premium-card p-6 md:p-8 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <span className="p-1.5 rounded-lg bg-fuchsia-50 text-[#5b0f4d] ring-1 ring-fuchsia-100/60">
              <TrendingUp size={16} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-serif">Service Leaderboard</h2>
              <p className="text-xs text-slate-500">Highest booked services in the clinic</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {(stats?.most_booked_services || []).length === 0 ? (
              <EmptyState title="No metrics reported" message="Treatment stats will compute once bookings are created." />
            ) : null}
            
            {(stats?.most_booked_services || []).map((item, index) => (
              <div 
                key={item.service} 
                className="flex items-center justify-between rounded-xl bg-gradient-to-r from-fuchsia-50/30 to-transparent border border-fuchsia-100/30 px-4 py-3 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-100/50 text-[10px] font-bold text-[#5b0f4d]">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-800">{item.service}</span>
                </div>
                <strong className="text-[#5b0f4d] font-bold bg-fuchsia-50 px-2.5 py-0.5 rounded-lg text-xs">{item.count} bookings</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
