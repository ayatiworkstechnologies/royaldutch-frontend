import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import ServiceCard from "@/components/ServiceCard";
import { api } from "@/lib/api";
import { ChevronLeft, Sparkles } from "lucide-react";

export default async function CategoryServicesPage({ params }) {
  const { category } = await params;
  const [categories, services] = await Promise.all([api.categories().catch(() => []), api.services(category).catch(() => [])]);
  const current = categories.find((item) => item.slug === category);

  return (
    <PublicShell>
      {/* Luxury Category Header */}
      <section className="bg-gradient-to-b from-[#5b0f4d] to-[#38072e] text-white py-12 border-b border-fuchsia-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/services" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-fuchsia-200 hover:text-white transition-colors mb-4">
            <ChevronLeft size={12} />
            Back to all services
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-fuchsia-200 border border-white/10">
                <Sparkles size={11} className="text-amber-300" />
                Clinic Speciality Catalog
              </span>
              <h1 className="mt-4 text-3xl sm:text-5xl font-bold font-serif leading-none tracking-tight">
                {current?.name || "Treatments"}
              </h1>
              <p className="mt-4 max-w-2xl text-xs sm:text-sm text-fuchsia-100/70 leading-relaxed">
                Browse our premium clinical services under the {current?.name || "selected"} speciality. Click book now to check slot times.
              </p>
            </div>
            <Link href="/book" className="btn-premium-primary bg-white text-[#5b0f4d] hover:bg-fuchsia-50 hover:text-[#38072e] px-6 py-3 text-xs tracking-wider uppercase font-bold shadow-lg shadow-black/10 shrink-0 self-start md:self-auto">
              Start Booking
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {services.length === 0 ? (
          <div className="text-center py-16 text-slate-500 rounded-2xl border border-slate-100 bg-white shadow-sm max-w-md mx-auto">
            <Sparkles size={24} className="text-fuchsia-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">No Services Found</p>
            <p className="text-xs text-slate-400 mt-1">Check back later or browse other categories.</p>
          </div>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
