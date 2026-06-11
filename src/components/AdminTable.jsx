"use client";

import { useMemo, useState } from "react";
import Pagination from "./Pagination";

/**
 * Reusable admin data table with built-in pagination.
 *
 * @param {Object} props
 * @param {Array<{key: string, label: string, render?: Function, className?: string}>} props.columns
 * @param {Array<Object>} props.data
 * @param {number} [props.perPage=10]
 * @param {string} [props.emptyTitle]
 * @param {string} [props.emptyMessage]
 */
export default function AdminTable({ columns, data, perPage = 10, emptyTitle = "No records found", emptyMessage = "" }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / perPage));

  // Reset to page 1 if data length shrinks below current page
  const safePage = page > totalPages ? 1 : page;

  const pageData = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return data.slice(start, start + perPage);
  }, [data, safePage, perPage]);

  if (data.length === 0) {
    return (
      <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/80 px-6 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-700">{emptyTitle}</p>
        {emptyMessage && <p className="mt-1.5 text-xs text-slate-500">{emptyMessage}</p>}
      </div>
    );
  }

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-100">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-50/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 ${col.className || ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pageData.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="transition-colors duration-150 even:bg-slate-50/40 hover:bg-fuchsia-50/40"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`whitespace-nowrap px-5 py-3.5 text-slate-700 ${col.className || ""}`}>
                    {col.render ? col.render(row) : row[col.key] ?? "–"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={data.length}
        perPage={perPage}
      />
    </div>
  );
}
