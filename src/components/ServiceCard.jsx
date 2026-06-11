import Link from "next/link";
import { duration, money } from "@/lib/api";
import { Clock, ArrowRight, Sparkles } from "lucide-react";

export default function ServiceCard({ service }) {
  return (
    <article className="premium-card p-6 flex flex-col justify-between min-h-[220px] group">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-50 to-fuchsia-100/40 text-sm font-bold text-[#5b0f4d] ring-1 ring-fuchsia-100/50">
            {String(service.name || "S").slice(0, 1)}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2.5 py-0.5 text-[9px] font-bold text-amber-800 uppercase tracking-wider">
            <Sparkles size={10} />
            Premium
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-fuchsia-950 transition-colors font-serif leading-snug">
          {service.name}
        </h3>
        
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-slate-400" />
            {duration(service.duration_minutes)}
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
        <span className="text-sm font-bold text-fuchsia-950">
          {money(service.price, service.currency)}
        </span>
        
        <Link
          href={`/book/${service.slug}`}
          className="btn-premium-primary text-[11px] uppercase tracking-wider py-2 px-4 gap-1.5"
        >
          <span>Book Now</span>
          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
