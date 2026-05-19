import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import ServiceCard from "@/components/ServiceCard";
import { api } from "@/lib/api";

export default async function CategoryServicesPage({ params }) {
  const { category } = await params;
  const [categories, services] = await Promise.all([api.categories().catch(() => []), api.services(category).catch(() => [])]);
  const current = categories.find((item) => item.slug === category);

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/services" className="text-sm font-semibold text-fuchsia-800">
          Back to services
        </Link>
        <h1 className="mt-3 text-3xl font-semibold">{current?.name || "Category Services"}</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
