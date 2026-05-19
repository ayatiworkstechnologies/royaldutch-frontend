"use client";

import { useMemo, useState } from "react";
import ServiceCard from "@/components/ServiceCard";

export default function BookServicePicker({ categories, services }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const visibleServices = useMemo(() => {
    if (activeCategory === "all") return services;
    const category = categories.find((item) => item.slug === activeCategory);
    if (!category) return services;
    return services.filter((service) => service.category_id === category.id);
  }, [activeCategory, categories, services]);

  return (
    <div>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
            activeCategory === "all" ? "border-fuchsia-900 bg-fuchsia-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-fuchsia-300"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            onClick={() => setActiveCategory(category.slug)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
              activeCategory === category.slug ? "border-fuchsia-900 bg-fuchsia-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-fuchsia-300"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
