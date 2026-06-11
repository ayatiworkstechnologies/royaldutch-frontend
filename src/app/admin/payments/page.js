"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import AdminTable from "@/components/AdminTable";
import StatusBadge from "@/components/StatusBadge";
import { btnPrimary } from "@/components/FormSection";
import { api, money } from "@/lib/api";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.payments().then(setPayments).catch((err) => setError(err.message));
  }, []);

  const columns = [
    { key: "invoice_id", label: "Invoice", render: (row) => row.invoice_id || "–" },
    { key: "booking_id", label: "Booking", render: (row) => row.booking_id || "–" },
    { key: "amount", label: "Amount", render: (row) => <span className="font-semibold text-slate-900">{money(row.amount, "AED")}</span> },
    { key: "payment_method", label: "Method", render: (row) => <span className="capitalize">{row.payment_method.replaceAll("_", " ")}</span> },
    {
      key: "payment_status",
      label: "Status",
      render: (row) => <StatusBadge status={row.payment_status} />,
    },
    { key: "transaction_id", label: "Transaction", render: (row) => row.transaction_id ? <code className="rounded bg-slate-100 px-2 py-0.5 text-xs">{row.transaction_id}</code> : "–" },
    { key: "created_at", label: "Date", render: (row) => row.created_at?.slice(0, 10) || "–" },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Payment History"
        description="Payments are created from Finance Desk so invoice balance stays correct."
        action={
          <Link href="/admin/billing" className={btnPrimary}>
            Open Finance Desk
          </Link>
        }
      />
      {error && <p className="mt-4 rounded-lg bg-rose-50 border border-rose-100 p-3.5 text-sm text-rose-700">{error}</p>}

      <AdminTable columns={columns} data={payments} perPage={10} emptyTitle="No payments yet" emptyMessage="Open Finance Desk and record a payment against an invoice." />
    </AdminShell>
  );
}
