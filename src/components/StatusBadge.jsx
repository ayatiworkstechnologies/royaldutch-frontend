export default function StatusBadge({ status }) {
  const colors = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-fuchsia-100 text-fuchsia-900",
    completed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-rose-100 text-rose-800",
    no_show: "bg-slate-200 text-slate-700",
    rescheduled: "bg-blue-100 text-blue-800",
    active: "bg-emerald-100 text-emerald-800",
    inactive: "bg-slate-200 text-slate-600",
    draft: "bg-slate-100 text-slate-600",
    queued: "bg-amber-100 text-amber-800",
    sent: "bg-emerald-100 text-emerald-800",
    failed: "bg-rose-100 text-rose-800",
    paid: "bg-emerald-100 text-emerald-800",
    partially_paid: "bg-amber-100 text-amber-800",
    unpaid: "bg-rose-100 text-rose-800",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ring-black/5 ${colors[status] || "bg-slate-100 text-slate-700"}`}>
      {String(status || "unknown").replaceAll("_", " ")}
    </span>
  );
}
