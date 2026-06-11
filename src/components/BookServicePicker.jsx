"use client";

import { useMemo, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
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
    <div className="space-y-8">
      {/* Sleek Filter Tabs bar with sliding Framer Motion indicators */}
      <LayoutGroup>
        <div className="rounded-2xl border border-fuchsia-950/5 bg-white p-2.5 shadow-[0_8px_30px_rgb(91,15,77,0.02)] backdrop-blur">
          <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar scroll-smooth">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`relative shrink-0 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeCategory === "all" ? "text-white" : "text-slate-600 hover:text-[#5b0f4d]"
              }`}
            >
              {activeCategory === "all" && (
                <motion.span 
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-[#5b0f4d] rounded-full -z-10 shadow-md shadow-fuchsia-950/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              All Treatments
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => setActiveCategory(category.slug)}
                className={`relative shrink-0 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeCategory === category.slug ? "text-white" : "text-slate-600 hover:text-[#5b0f4d]"
                }`}
              >
                {activeCategory === category.slug && (
                  <motion.span 
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-[#5b0f4d] rounded-full -z-10 shadow-md shadow-fuchsia-950/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </LayoutGroup>

      {/* Grid listing services with animate presence */}
      <motion.div 
        layout
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visibleServices.map((service) => (
          <motion.div 
            layout
            key={service.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <ServiceCard service={service} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
