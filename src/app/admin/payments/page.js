"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import EmptyState from "@/components/EmptyState";
import { api, money } from "@/lib/api";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.payments().then(setPayments).catch((err) => setError(err.message));
  }, []);

  return (
    <AdminShell>
      <AdminPageHeader
        title="Payment History"
        description="Payments are created from Finance Desk so invoice balance stays correct."
        action={<Link href="/admin/billing" className="rounded-md bg-[#5b0f4d] px-4 py-2 text-sm font-semibold text-white">Open Finance Desk</Link>}
      />
      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="admin-table min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {["Invoice", "Booking", "Amount", "Method", "Status", "Transaction", "Date"].map((head) => (
                <th key={head} className="px-4 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-4 py-3">{payment.invoice_id || "-"}</td>
                <td className="px-4 py-3">{payment.booking_id || "-"}</td>
                <td className="px-4 py-3 font-semibold">{money(payment.amount, "AED")}</td>
                <td className="px-4 py-3">{payment.payment_method.replaceAll("_", " ")}</td>
                <td className="px-4 py-3">{payment.payment_status.replaceAll("_", " ")}</td>
                <td className="px-4 py-3">{payment.transaction_id || "-"}</td>
                <td className="px-4 py-3">{payment.created_at?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {payments.length === 0 ? <div className="mt-5"><EmptyState title="No payments yet" message="Open Finance Desk and record a payment against an invoice." /></div> : null}
    </AdminShell>
  );
}
