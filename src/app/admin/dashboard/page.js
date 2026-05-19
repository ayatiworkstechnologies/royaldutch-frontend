"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import EmptyState from "@/components/EmptyState";
import { api, money } from "@/lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard().then(setStats).catch((err) => setError(err.message));
  }, []);

  const metrics = [
    ["Today", stats?.todays_bookings ?? 0, "Appointments on calendar", "/admin/calendar"],
    ["Pending", stats?.pending_bookings ?? 0, "Need confirmation", "/admin/bookings"],
    ["Confirmed", stats?.confirmed_bookings ?? 0, "Ready for visit", "/admin/bookings"],
    ["Completed", stats?.completed_bookings ?? 0, "Finished visits", "/admin/bookings"],
    ["Revenue", money(stats?.total_revenue ?? 0, "AED"), "Completed service value", "/admin/payments"],
  ];

  const workflow = [
    ["1", "Review pending bookings", "Confirm, cancel, or contact patient.", "/admin/bookings"],
    ["2", "Check today calendar", "See doctors and appointment times.", "/admin/calendar"],
    ["3", "Complete visit", "Mark appointment completed or no-show.", "/admin/bookings"],
    ["4", "Create bill and payment", "Invoice, payment and balance records.", "/admin/billing"],
    ["5", "Send message", "Mail or notification follow-up.", "/admin/mail"],
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Today Workspace"
        description="A simple daily flow for reception and clinic admin work."
        action={<Link href="/admin/bookings" className="rounded-md bg-[#5b0f4d] px-4 py-2 text-sm font-semibold text-white">Start With Pending</Link>}
      />

      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(([label, value, note, href]) => (
          <Link key={label} href={href} className="soft-card rounded-lg p-5 hover:-translate-y-0.5 hover:border-fuchsia-300">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-[#5b0f4d]">{value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="soft-card rounded-lg p-5">
          <h2 className="text-lg font-semibold">Daily Workflow</h2>
          <div className="mt-4 grid gap-3">
            {workflow.map(([number, title, note, href]) => (
              <Link key={number} href={href} className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 hover:border-fuchsia-300">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5b0f4d] text-sm font-semibold text-white">{number}</span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="mt-1 block text-sm text-slate-500">{note}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="soft-card rounded-lg p-5">
          <h2 className="text-lg font-semibold">Most Booked Services</h2>
          <div className="mt-4 space-y-3">
            {(stats?.most_booked_services || []).length === 0 ? <EmptyState title="No booking data yet" message="Service rankings appear after bookings are created." /> : null}
            {(stats?.most_booked_services || []).map((item) => (
              <div key={item.service} className="flex justify-between rounded-md bg-fuchsia-50/60 px-4 py-3 text-sm">
                <span>{item.service}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
