import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import ServiceCard from "@/components/ServiceCard";
import { api } from "@/lib/api";
import { Sparkles, ChevronRight } from "lucide-react";

export default async function ServicesPage() {
  const [categories, services] = await Promise.all([api.categories().catch(() => []), api.services().catch(() => [])]);

  return (
    <PublicShell>
      {/* Luxury Page Header */}
      <section className="bg-gradient-to-b from-[#5b0f4d] to-[#38072e] text-white py-12 border-b border-fuchsia-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-fuchsia-200 border border-white/10">
                <Sparkles size={11} className="text-amber-300" />
                Royal Dutch Treatments
              </span>
              <h1 className="mt-4 text-3xl sm:text-5xl font-bold font-serif leading-none tracking-tight">Our Services</h1>
              <p className="mt-4 max-w-2xl text-xs sm:text-sm text-fuchsia-100/70 leading-relaxed">
                Explore our premium medical, wellness, and aesthetic treatments designed for your vitality. Filter by category to start booking.
              </p>
            </div>
            <Link href="/book" className="btn-premium-primary bg-white text-[#5b0f4d] hover:bg-fuchsia-50 hover:text-[#38072e] px-6 py-3 text-xs tracking-wider uppercase font-bold shadow-lg shadow-black/10 shrink-0 self-start md:self-auto">
              Start Booking Flow
            </Link>
          </div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Filter by Speciality</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/services/${category.slug}`} 
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:border-[#5b0f4d] hover:text-[#5b0f4d] hover:bg-fuchsia-50/20 transition-all duration-200"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
