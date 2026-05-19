import Link from "next/link";

export default function PublicShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f8f4f7] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-fuchsia-950/10 bg-white/95 backdrop-blur">
        <div className="royal-topbar">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide sm:justify-end">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/70 text-[10px]">O</span>
            <span>Opening Hours: Monday to Saturday 10:00 AM - 08:00 PM</span>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:px-8">
          <Link href="/" className="text-center">
            <span className="royal-logo-text block text-3xl font-bold leading-none sm:text-4xl">
              Royal Dutch
            </span>
            <span className="royal-logo-text mt-1 block text-sm font-semibold uppercase tracking-[0.18em]">
              Medical Centre
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Link className="rounded-md px-3 py-2 hover:bg-fuchsia-50 hover:text-fuchsia-900" href="/services">
              Services
            </Link>
            <Link className="hidden rounded-md px-3 py-2 hover:bg-fuchsia-50 hover:text-fuchsia-900 sm:block" href="/my-bookings">
              My Bookings
            </Link>
            <Link className="rounded-md bg-[#5b0f4d] px-4 py-2 text-white shadow-sm hover:bg-[#4a0b3d]" href="/book">
              Book
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <Link
        href="/book"
        className="fixed bottom-4 left-4 right-4 z-40 flex h-12 items-center justify-center rounded-md bg-[#5b0f4d] text-sm font-semibold text-white shadow-[0_16px_40px_rgba(91,15,77,0.28)] hover:bg-[#4a0b3d] sm:hidden"
      >
        Book Appointment
      </Link>
    </div>
  );
}
