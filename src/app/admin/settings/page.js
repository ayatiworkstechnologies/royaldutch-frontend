import Link from "next/link";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <AdminPageHeader title="Clinic Settings" description="Operational configuration reference for the connected booking system." />
      <section className="mt-5 soft-card rounded-lg p-5">
        <h3 className="font-semibold">Recommended Daily Workflow</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {["Pending", "Calendar", "Visit", "Billing", "Message"].map((label, index) => (
            <div key={label} className="rounded-lg border border-fuchsia-100 bg-fuchsia-50/50 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5b0f4d] text-sm font-semibold text-white">{index + 1}</span>
              <p className="mt-3 text-sm font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-semibold">Environment</h3>
          <dl className="mt-4 grid gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Backend API</dt>
              <dd className="mt-1 font-semibold">NEXT_PUBLIC_API_BASE_URL</dd>
            </div>
            <div>
              <dt className="text-slate-500">Default Admin</dt>
              <dd className="mt-1 font-semibold">admin@clinicflow.local</dd>
            </div>
            <div>
              <dt className="text-slate-500">SMTP Mail</dt>
              <dd className="mt-1 font-semibold">SMTP_HOST, SMTP_PORT, SMTP_USERNAME</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-semibold">Enabled Modules</h3>
          <div className="mt-4 grid gap-2">
            {[
              ["/admin/services", "Services and Categories"],
              ["/admin/staff", "Staff and Availability"],
              ["/admin/bookings", "Bookings and Status"],
              ["/admin/calendar", "Calendar"],
              ["/admin/patients", "Patients"],
              ["/admin/payments", "Payments"],
              ["/admin/billing", "Billing"],
              ["/admin/mail", "Mail"],
              ["/admin/notifications", "Notifications"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-md border border-slate-200 px-4 py-3 text-sm font-semibold hover:border-fuchsia-600">
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="font-semibold">Mail Settings</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ["Host", "SMTP_HOST"],
            ["Port", "SMTP_PORT"],
            ["Login", "SMTP_USERNAME or SMTP_USER"],
            ["From", "SMTP_FROM_EMAIL"],
            ["Sender Name", "SMTP_FROM_NAME"],
            ["SSL", "SMTP_USE_SSL=true"],
            ["CC", "Add per email in Mail module"],
            ["BCC", "Add per email in Mail module"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
