import Link from "next/link";

export default function PublicShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f7faf9] text-slate-950">
      <header className="border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-semibold tracking-tight text-teal-900">
            Royal Dutch Clinic
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/services">
              Services
            </Link>
            <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/my-bookings">
              My Bookings
            </Link>
            <Link className="rounded-md bg-teal-700 px-3 py-2 text-white hover:bg-teal-800" href="/book">
              Book
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
