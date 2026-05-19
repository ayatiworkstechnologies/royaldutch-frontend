export default function EmptyState({ title = "No records found", message = "New records will appear here." }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white/80 p-8 text-center">
      <div className="mx-auto mb-4 h-10 w-10 rounded-lg bg-fuchsia-50 ring-1 ring-fuchsia-100" />
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}
