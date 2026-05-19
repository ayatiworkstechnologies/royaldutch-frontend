export default function AdminPageHeader({ title, description, action }) {
  return (
    <div className="soft-card rounded-lg p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {action}
      </div>
    </div>
  );
}
