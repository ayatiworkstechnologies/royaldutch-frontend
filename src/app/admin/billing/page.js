"use client";

import { useEffect, useMemo, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import AdminTable from "@/components/AdminTable";
import StatusBadge from "@/components/StatusBadge";
import FormSection, { FormField, inputClass, btnPrimary, btnSecondary } from "@/components/FormSection";
import { api, money } from "@/lib/api";

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bookingId, setBookingId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("pay_at_clinic");
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    try {
      const [invoiceData, bookingData, paymentData] = await Promise.all([
        api.invoices(),
        api.bookings(),
        api.payments(),
      ]);
      setInvoices(invoiceData);
      setBookings(bookingData);
      setPayments(paymentData);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const selectedInvoice = useMemo(() => invoices.find((invoice) => invoice.id === Number(invoiceId)), [invoices, invoiceId]);
  const selectedBooking = useMemo(() => bookings.find((booking) => booking.id === Number(bookingId)), [bookings, bookingId]);

  async function generateInvoice(e) {
    e.preventDefault();
    setError("");
    if (!bookingId) {
      setError("Please select a booking first.");
      return;
    }
    setBusy("invoice");
    try {
      const invoice = await api.createInvoiceFromBooking(bookingId, {});
      setInvoiceId(String(invoice.id));
      setAmount(invoice.balance_due);
      setBookingId("");
      await load();
      // Smooth scroll to the payment form
      const el = document.getElementById("payment-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function recordPayment(event) {
    event.preventDefault();
    setError("");
    if (!selectedInvoice) {
      setError("Please select an invoice first.");
      return;
    }
    setBusy("payment");
    try {
      await api.createPayment({
        booking_id: selectedInvoice.booking_id,
        invoice_id: selectedInvoice.id,
        amount: Number(amount || 0),
        payment_method: method,
        payment_status: Number(amount || 0) >= Number(selectedInvoice.balance_due) ? "paid" : "partially_paid",
        transaction_id: transactionId || null,
      });
      setAmount("");
      setInvoiceId("");
      setTransactionId("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  function selectInvoiceForPayment(invoice) {
    setInvoiceId(String(invoice.id));
    setAmount(invoice.balance_due);
    // Smooth scroll to the payment section
    const el = document.getElementById("payment-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  const invoiceColumns = [
    {
      key: "invoice_number",
      label: "Invoice Ref",
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900">{row.invoice_number}</span>
          <br />
          <span className="text-xs text-slate-500">Booking #{row.booking_id}</span>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Financials",
      render: (row) => (
        <div>
          <span className="font-medium text-slate-900">Total: {money(row.total_amount, row.currency)}</span>
          <br />
          <span className="text-xs text-slate-500">Due: {money(row.balance_due, row.currency)}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        row.status !== "paid" ? (
          <button
            onClick={() => selectInvoiceForPayment(row)}
            className="rounded-lg border border-[#5b0f4d] bg-white px-3 py-1.5 text-xs font-semibold text-[#5b0f4d] transition hover:bg-fuchsia-50"
          >
            Collect Payment
          </button>
        ) : (
          <span className="text-xs font-medium text-emerald-600">Settled</span>
        )
      ),
    },
  ];

  const paymentColumns = [
    {
      key: "id",
      label: "Payment Info",
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900">{money(row.amount, "AED")}</span>
          <br />
          <span className="text-xs text-slate-500">Invoice #{row.invoice_id}</span>
        </div>
      ),
    },
    {
      key: "payment_method",
      label: "Details",
      render: (row) => (
        <div>
          <span className="capitalize text-xs font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">
            {row.payment_method.replaceAll("_", " ")}
          </span>
          {row.transaction_id && (
            <div className="mt-1">
              <code className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-100 px-1 py-0.5 rounded">
                TX: {row.transaction_id}
              </code>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "payment_status",
      label: "Status",
      render: (row) => <StatusBadge status={row.payment_status} />,
    },
    {
      key: "created_at",
      label: "Recorded On",
      render: (row) => (
        <span className="text-xs text-slate-500">
          {row.created_at ? new Date(row.created_at).toLocaleString() : "–"}
        </span>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Finance Desk"
        description="Choose a booking to generate an invoice, and record payments against outstanding balances."
      />
      {error && <p className="mt-4 rounded-lg bg-rose-50 border border-rose-100 p-3.5 text-sm text-rose-700">{error}</p>}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Step 1 FormSection */}
        <FormSection
          title="Step 1: Generate Invoice from Booking"
          onSubmit={generateInvoice}
          actions={
            <button disabled={busy === "invoice" || !bookingId} className={btnPrimary}>
              {busy === "invoice" ? "Generating..." : "Generate Invoice"}
            </button>
          }
        >
          <div className="md:col-span-2 lg:col-span-3">
            <FormField label="Select Booking" required>
              <select
                value={bookingId}
                onChange={(event) => setBookingId(event.target.value)}
                className={inputClass}
              >
                <option value="">Choose booking...</option>
                {bookings
                  .filter((b) => b.status !== "cancelled")
                  .map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.booking_code} - {booking.patient?.full_name} ({booking.service_name})
                    </option>
                  ))}
              </select>
            </FormField>
          </div>

          {selectedBooking && (
            <div className="md:col-span-2 lg:col-span-3 mt-2 rounded-lg border border-fuchsia-100 bg-fuchsia-50/40 p-4 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-[#5b0f4d]">{selectedBooking.service_name}</h4>
                  <p className="mt-1 text-xs text-slate-600">
                    Patient: {selectedBooking.patient?.full_name} ({selectedBooking.patient?.phone})
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Date: {selectedBooking.booking_date} at {selectedBooking.booking_time}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">{money(selectedBooking.price, selectedBooking.currency)}</span>
                </div>
              </div>
            </div>
          )}
        </FormSection>

        {/* Step 2 FormSection */}
        <div id="payment-section">
          <FormSection
            title="Step 2: Collect & Record Payment"
            onSubmit={recordPayment}
            actions={
              <button disabled={busy === "payment" || !invoiceId} className={btnPrimary}>
                {busy === "payment" ? "Saving..." : "Record Payment"}
              </button>
            }
          >
            <div className="md:col-span-2 lg:col-span-3">
              <FormField label="Select Outstanding Invoice" required>
                <select
                  value={invoiceId}
                  onChange={(event) => {
                    setInvoiceId(event.target.value);
                    const inv = invoices.find((item) => item.id === Number(event.target.value));
                    setAmount(inv?.balance_due ?? "");
                  }}
                  className={inputClass}
                >
                  <option value="">Select invoice...</option>
                  {invoices
                    .filter((inv) => inv.status !== "paid")
                    .map((invoice) => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number} - Balance Due: {money(invoice.balance_due, invoice.currency)}
                      </option>
                    ))}
                </select>
              </FormField>
            </div>

            <FormField label="Amount to Collect (AED)" required>
              <input
                required
                type="number"
                min="0.01"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className={inputClass}
              />
            </FormField>

            <FormField label="Payment Method" required>
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                className={inputClass}
              >
                <option value="pay_at_clinic">Pay at Clinic (Cash/Card)</option>
                <option value="online">Online Payment Gateway</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="insurance">Insurance Claim</option>
              </select>
            </FormField>

            <FormField label="Transaction / Reference ID">
              <input
                placeholder="Optional receipt or TX ID"
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                className={inputClass}
              />
            </FormField>
          </FormSection>
        </div>
      </div>

      {/* Tables Section */}
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <h3 className="text-base font-bold text-slate-800">Invoices</h3>
          <p className="mt-0.5 text-xs text-slate-500">All invoices generated from patient bookings.</p>
          <AdminTable
            columns={invoiceColumns}
            data={invoices}
            perPage={5}
            emptyTitle="No invoices generated yet"
            emptyMessage="Choose a booking above to generate your first invoice."
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <h3 className="text-base font-bold text-slate-800">Recent Payments</h3>
          <p className="mt-0.5 text-xs text-slate-500">All payments recorded against invoices.</p>
          <AdminTable
            columns={paymentColumns}
            data={payments}
            perPage={5}
            emptyTitle="No payments recorded yet"
            emptyMessage="Payments recorded against invoices will appear here."
          />
        </div>
      </div>
    </AdminShell>
  );
}
