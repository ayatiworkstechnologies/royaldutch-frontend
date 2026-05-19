"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function BookingSuccessContent() {
  const params = useSearchParams();
  const code = params.get("code");

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-fuchsia-800">Request received</p>
      <h1 className="mt-3 text-3xl font-semibold">Your appointment request has been received.</h1>
      <p className="mt-4 text-slate-600">Our team will confirm your booking shortly.</p>
      {code ? <p className="mt-5 rounded-md bg-slate-50 p-3 font-semibold">Booking Code: {code}</p> : null}
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/services" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">
          Browse Services
        </Link>
        <Link href="/my-bookings" className="rounded-md bg-fuchsia-800 px-4 py-2 text-sm font-semibold text-white">
          My Bookings
        </Link>
      </div>
    </div>
  );
}
