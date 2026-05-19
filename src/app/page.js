import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { api, duration, money } from "@/lib/api";

export default async function Home() {
  const [categories, services] = await Promise.all([api.categories().catch(() => []), api.services().catch(() => [])]);
  const featured = services.slice(0, 6);

  return (
    <PublicShell>
      <section className="border-b border-fuchsia-950/10 bg-[#5b0f4d] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="relative">
            <div className="absolute -left-8 top-12 hidden grid-cols-4 gap-3 opacity-25 lg:grid">
              {Array.from({ length: 16 }).map((_, index) => (
                <span key={index} className="h-2 w-2 rounded-full bg-white" />
              ))}
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-fuchsia-200">Royal Dutch Medical Centre</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Bloom with Royal Dutch premium clinic services.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-fuchsia-50/90">
              Browse treatments, choose a specialist, pick an available slot and send your appointment request to the clinic team.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services" className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#5b0f4d] shadow-sm hover:bg-fuchsia-50">
                View Services
              </Link>
              <Link href="/my-bookings" className="rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15">
                Check Booking
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-white/15 bg-white p-5 text-slate-950 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Popular Services</h2>
              <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-900">Live catalog</span>
            </div>
            <div className="mt-4 space-y-3">
              {featured.map((service) => (
                <Link key={service.id} href={`/book/${service.slug}`} className="block rounded-md border border-slate-200 bg-white p-4 hover:border-fuchsia-600 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{duration(service.duration_minutes)}</p>
                    </div>
                    <p className="text-sm font-semibold text-fuchsia-900">{money(service.price, service.currency)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="border-b border-fuchsia-950/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["1", "Choose Service"],
              ["2", "Pick Specialist"],
              ["3", "Select Slot"],
              ["4", "Send Request"],
            ].map(([number, label]) => (
              <div key={number} className="rounded-lg border border-fuchsia-100 bg-fuchsia-50/60 p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5b0f4d] text-sm font-semibold text-white">{number}</span>
                <p className="mt-3 text-sm font-semibold text-slate-900">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Service Categories</h2>
          <Link href="/services" className="text-sm font-semibold text-fuchsia-800">
            All services
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/services/${category.slug}`} className="soft-card rounded-lg p-5 hover:-translate-y-0.5 hover:border-fuchsia-300">
              <p className="text-xs font-semibold text-slate-500">Category {category.external_id || category.id}</p>
              <h3 className="mt-2 text-lg font-semibold">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
