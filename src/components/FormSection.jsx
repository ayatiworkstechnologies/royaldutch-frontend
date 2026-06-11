"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * Collapsible form section with a title bar and labeled fields.
 *
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {boolean} [props.defaultOpen=true]
 * @param {React.ReactNode} props.children
 * @param {Function} [props.onSubmit]
 * @param {React.ReactNode} [props.actions] - Submit/cancel button row
 */
export default function FormSection({ title, defaultOpen = true, children, onSubmit, actions }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const Wrapper = onSubmit ? "form" : "div";
  const wrapperProps = onSubmit ? { onSubmit } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-100"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-3.5 text-left transition-colors hover:from-fuchsia-50/50"
      >
        <span className="text-sm font-bold text-slate-800">{title}</span>
        {isOpen ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
          {actions && <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">{actions}</div>}
        </div>
      )}
    </Wrapper>
  );
}

/**
 * Labeled input field for use inside FormSection.
 */
export function FormField({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
        {required && <span className="ml-0.5 text-rose-400">*</span>}
      </label>
      {children}
    </div>
  );
}

/** Standard input styling class */
export const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-100";

/** Primary button styling */
export const btnPrimary =
  "rounded-lg bg-[#5b0f4d] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-fuchsia-900/10 transition-all duration-200 hover:bg-[#4a0c3f] hover:shadow-md active:scale-[0.98]";

/** Secondary / outline button styling */
export const btnSecondary =
  "rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]";

/** Danger / delete button styling */
export const btnDanger =
  "rounded-lg border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 shadow-sm transition-all duration-200 hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98]";
