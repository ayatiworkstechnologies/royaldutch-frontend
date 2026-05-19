"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminToken } from "@/lib/api";

const links = [
  ["/admin/dashboard", "Dashboard"],
  ["/admin/bookings", "Bookings"],
  ["/admin/services", "Services"],
  ["/admin/categories", "Categories"],
  ["/admin/staff", "Staff"],
  ["/admin/patients", "Patients"],
  ["/admin/payments", "Payments"],
  ["/admin/settings", "Settings"],
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearAdminToken();
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-slate-950 p-5 text-white lg:block">
        <Link href="/admin/dashboard" className="block text-xl font-semibold">
          ClinicFlow Admin
        </Link>
        <nav className="mt-8 space-y-1">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`block rounded-md px-3 py-2 text-sm ${
                pathname === href ? "bg-teal-600 text-white" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="mt-8 w-full rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200">
          Logout
        </button>
      </aside>
      <div className="lg:pl-64">
        <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Royal Dutch Clinic</p>
              <h1 className="text-2xl font-semibold">Admin Management</h1>
            </div>
            <div className="flex flex-wrap gap-2 lg:hidden">
              {links.slice(0, 5).map(([href, label]) => (
                <Link key={href} href={href} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
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
