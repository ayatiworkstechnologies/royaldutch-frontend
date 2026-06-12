import Link from "next/link";
import AiHelpButton from "@/components/AiHelpButton";
import { Phone, Clock, MapPin } from "lucide-react";

export default function PublicShell({ children }) {
  return (
    <div className="min-h-screen bg-[#fcfafc] text-slate-950 flex flex-col font-sans">
      <header className="sticky top-0 z-40 w-full border-b border-fuchsia-950/5 bg-white/80 backdrop-blur-md">
        {/* Luxury Top Info Bar */}
        <div className="royal-topbar hidden sm:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-[11px] font-medium tracking-wider text-fuchsia-100/90 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Clock size={11} className="text-amber-300" />
                Monday - Saturday 10:00 AM - 08:00 PM
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={11} className="text-amber-300" />
                Dubai, UAE
              </span>
            </div>
            <a href="tel:+9714000000" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={11} className="text-amber-300" />
              Toll Free: 800-ROYAL
            </a>
          </div>
        </div>

        {/* Main Header Container */}
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:py-5 lg:px-8">
          <Link href="/" className="group flex flex-col items-center text-center lg:items-start lg:text-left">
            <span className="royal-logo-text block text-3xl font-bold tracking-tight leading-none sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#5b0f4d] to-[#861265] group-hover:opacity-90 transition-opacity">
              Royal Dutch
            </span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-[#a21caf]/80">
              Medical Centre
            </span>
          </Link>
          
          <nav className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 sm:text-sm">
            <Link className="rounded-full px-4 py-2 hover:bg-fuchsia-50 hover:text-fuchsia-950 transition-all duration-200" href="/">
              Home
            </Link>
            <Link className="rounded-full px-4 py-2 hover:bg-fuchsia-50 hover:text-fuchsia-950 transition-all duration-200" href="/services">
              Services
            </Link>
            <Link className="hidden rounded-full px-4 py-2 hover:bg-fuchsia-50 hover:text-fuchsia-950 transition-all duration-200 sm:block" href="/my-bookings">
              My Bookings
            </Link>
            <Link className="hidden rounded-full px-4 py-2 hover:bg-fuchsia-50 hover:text-fuchsia-950 transition-all duration-200 sm:block" href="/admin/login">
              Admin Portal
            </Link>
            <Link className="ml-2 btn-premium-primary px-5 py-2.5 text-xs tracking-wider" href="/book">
              Book Appointment
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">{children}</main>

      <footer className="border-t border-fuchsia-950/5 bg-white py-8 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-serif text-sm font-semibold text-[#5b0f4d] mb-2">Royal Dutch Medical Centre</p>
          <p>© {new Date().getFullYear()} Royal Dutch Medical Centre. All rights reserved.</p>
        </div>
      </footer>

      <AiHelpButton />
    </div>
  );
}
