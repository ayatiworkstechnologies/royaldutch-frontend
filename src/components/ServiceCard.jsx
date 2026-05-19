import Link from "next/link";
import { duration, money } from "@/lib/api";

export default function ServiceCard({ service }) {
  return (
    <article className="group soft-card rounded-lg p-5 hover:-translate-y-0.5 hover:border-fuchsia-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)]">
      <div className="flex min-h-40 flex-col justify-between gap-5">
        <div>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-50 text-sm font-bold text-fuchsia-900 ring-1 ring-fuchsia-100">
            {String(service.name || "S").slice(0, 1)}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-800">{service.currency || "AED"}</p>
          <h3 className="mt-2 text-lg font-semibold leading-6 text-slate-950">{service.name}</h3>
          <div className="mt-3 space-y-1">
            <p className="text-sm text-slate-600">{duration(service.duration_minutes)}</p>
            <p className="text-sm font-semibold text-slate-950">{money(service.price, service.currency)}</p>
          </div>
        </div>
        <Link
          href={`/book/${service.slug}`}
          className="inline-flex h-11 items-center justify-center rounded-md bg-fuchsia-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-fuchsia-950"
        >
          Book Now
        </Link>
      </div>
    </article>
  );
}
