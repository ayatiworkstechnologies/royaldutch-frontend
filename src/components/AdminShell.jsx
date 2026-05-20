"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminToken, getAdminToken } from "@/lib/api";

const groups = [
  {
    title: "Daily Work",
    links: [
      ["/admin/dashboard", "Overview"],
      ["/admin/bookings", "Appointments"],
      ["/admin/calendar", "Calendar"],
    ],
  },
  {
    title: "Clinic Setup",
    links: [
      ["/admin/services", "Services"],
      ["/admin/categories", "Categories"],
      ["/admin/staff", "Doctors & Staff"],
    ],
  },
  {
    title: "People & Money",
    links: [
      ["/admin/patients", "Patients"],
      ["/admin/billing", "Billing"],
      ["/admin/payments", "Payments"],
    ],
  },
  {
    title: "Communication",
    links: [
      ["/admin/mail", "Mail"],
      ["/admin/email-templates", "Templates"],
      ["/admin/notifications", "Alerts"],
      ["/admin/settings", "Settings"],
    ],
  },
];

const mobileLinks = groups.flatMap((group) => group.links).slice(0, 8);

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!getAdminToken()) router.replace("/admin/login");
  }, [router]);

  function logout() {
    clearAdminToken();
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#f8f4f7] text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-fuchsia-950/20 bg-[#4a0b3d] p-5 text-white lg:flex lg:flex-col">
        <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#a2258d] text-sm font-bold text-white">RD</span>
          <span>
            <span className="block text-base font-semibold">Royal Dutch Admin</span>
            <span className="text-xs text-fuchsia-100/75">Simple clinic workflow</span>
          </span>
        </Link>

        <nav className="mt-5 flex-1 space-y-5 overflow-y-auto pb-4">
          {groups.map((group) => (
            <section key={group.title}>
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-100/50">{group.title}</p>
              <div className="space-y-1">
                {group.links.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className={`block rounded-md px-3 py-2.5 text-sm font-medium ${
                      pathname === href ? "bg-[#a2258d] text-white shadow-sm" : "text-fuchsia-50/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </nav>

        <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs leading-5 text-fuchsia-50/75">
          Flow: review pending bookings, confirm slots, complete visits, then bill and message patients.
        </div>
        <button onClick={logout} className="mt-3 w-full rounded-md border border-white/10 px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10">
          Logout
        </button>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-800">Royal Dutch Medical Centre</p>
              <h1 className="text-2xl font-semibold tracking-tight">Admin Workspace</h1>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {mobileLinks.map(([href, label]) => (
                <Link key={href} href={href} className="shrink-0 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
