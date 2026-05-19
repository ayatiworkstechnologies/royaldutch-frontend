import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import ServiceCard from "@/components/ServiceCard";
import { api } from "@/lib/api";

export default async function ServicesPage() {
  const [categories, services] = await Promise.all([api.categories().catch(() => []), api.services().catch(() => [])]);

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-fuchsia-800">Treatments</p>
            <h1 className="mt-2 text-3xl font-semibold">All Services</h1>
          </div>
          <Link href="/book" className="rounded-md bg-fuchsia-800 px-4 py-2 text-sm font-semibold text-white">
            Start Booking
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link key={category.id} href={`/services/${category.slug}`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:border-fuchsia-600">
              {category.name}
            </Link>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
