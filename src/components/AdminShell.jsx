"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminToken, getAdminToken } from "@/lib/api";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Calendar, 
  Sparkles, 
  FolderHeart, 
  Users, 
  UserSquare2, 
  Receipt, 
  CreditCard, 
  Mail, 
  FileJson, 
  Bell, 
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react";

const groups = [
  {
    title: "Daily Work",
    links: [
      ["/admin/dashboard", "Overview", LayoutDashboard],
      ["/admin/bookings", "Appointments", CalendarCheck],
      ["/admin/calendar", "Calendar", Calendar],
    ],
  },
  {
    title: "Clinic Setup",
    links: [
      ["/admin/services", "Services", Sparkles],
      ["/admin/categories", "Categories", FolderHeart],
      ["/admin/staff", "Doctors & Staff", Users],
    ],
  },
  {
    title: "People & Money",
    links: [
      ["/admin/patients", "Patients", UserSquare2],
      ["/admin/billing", "Billing", Receipt],
      ["/admin/payments", "Payments", CreditCard],
    ],
  },
  {
    title: "Communication",
    links: [
      ["/admin/mail", "Mail", Mail],
      ["/admin/email-templates", "Templates", FileJson],
      ["/admin/notifications", "Alerts", Bell],
      ["/admin/settings", "Settings", Settings],
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
    <div className="min-h-screen bg-[#fcfafc] text-slate-950 flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-fuchsia-950/20 bg-gradient-to-b from-[#38072e] to-[#1e0319] p-6 text-white lg:flex lg:flex-col z-35 shadow-2xl">
        <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md hover:bg-white/10 transition-all duration-350">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-400 to-[#a2258d] text-xs font-bold text-white shadow-md shadow-fuchsia-950/20">
            RD
          </span>
          <div>
            <span className="block text-sm font-bold tracking-wider">Royal Dutch</span>
            <span className="text-[10px] text-fuchsia-200/60 uppercase tracking-widest font-semibold">Admin Desk</span>
          </div>
        </Link>

        <nav className="mt-8 flex-1 space-y-6 overflow-y-auto pb-4 no-scrollbar">
          {groups.map((group) => (
            <section key={group.title} className="space-y-2">
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-200/40">{group.title}</p>
              <div className="space-y-1">
                {group.links.map(([href, label, IconComponent]) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 relative ${
                        isActive 
                          ? "bg-white/10 text-white shadow-inner border-l-2 border-fuchsia-400 pl-4" 
                          : "text-fuchsia-200/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <IconComponent size={14} className={isActive ? "text-fuchsia-300" : "text-fuchsia-200/50"} />
                        <span>{label}</span>
                      </span>
                      {isActive && <ChevronRight size={12} className="text-fuchsia-400" />}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        {/* Footer Sidebar Workflow Note */}
        <div className="mt-auto border-t border-white/5 pt-4">
          <button 
            onClick={logout} 
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/10 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-800">Operational Dashboard</p>
              <h1 className="text-xl font-bold font-serif tracking-tight text-slate-950">Workspace Desk</h1>
            </div>
            
            {/* Mobile View Navigation Tags */}
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden no-scrollbar">
              {mobileLinks.map(([href, label, IconComponent]) => {
                const isActive = pathname === href;
                return (
                  <Link 
                    key={href} 
                    href={href} 
                    className={`flex items-center gap-1.5 shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive 
                        ? "border-[#5b0f4d] bg-[#5b0f4d] text-white" 
                        : "border-slate-200 bg-white text-slate-600 hover:border-fuchsia-300"
                    }`}
                  >
                    <IconComponent size={12} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
}
