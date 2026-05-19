import Link from "next/link";
import { duration, money } from "@/lib/api";

export default function ServiceCard({ service }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex min-h-32 flex-col justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{service.currency || "AED"}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">{service.name}</h3>
          <p className="mt-2 text-sm text-slate-600">{duration(service.duration_minutes)}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{money(service.price, service.currency)}</p>
        </div>
        <Link
          href={`/book/${service.slug}`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Book Now
        </Link>
      </div>
    </article>
  );
}
