"use client";

import { useEffect, useMemo, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import EmptyState from "@/components/EmptyState";
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

  async function load() {
    const [invoiceData, bookingData, paymentData] = await Promise.all([api.invoices(), api.bookings(), api.payments()]);
    setInvoices(invoiceData);
    setBookings(bookingData);
    setPayments(paymentData);
  }

  useEffect(() => {
    Promise.all([api.invoices(), api.bookings(), api.payments()])
      .then(([invoiceData, bookingData, paymentData]) => {
        setInvoices(invoiceData);
        setBookings(bookingData);
        setPayments(paymentData);
      })
      .catch((err) => setError(err.message));
  }, []);

  const selectedInvoice = useMemo(() => invoices.find((invoice) => invoice.id === Number(invoiceId)), [invoices, invoiceId]);
  const selectedBooking = useMemo(() => bookings.find((booking) => booking.id === Number(bookingId)), [bookings, bookingId]);

  async function generateInvoice() {
    setError("");
    if (!bookingId) {
      setError("Select a booking first.");
      return;
    }
    try {
      const invoice = await api.createInvoiceFromBooking(bookingId, {});
      setInvoiceId(String(invoice.id));
      setAmount(invoice.balance_due);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function recordPayment(event) {
    event.preventDefault();
    setError("");
    if (!selectedInvoice) {
      setError("Select an invoice first.");
      return;
    }
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
      setTransactionId("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader title="Finance Desk" description="Simple flow: choose booking, generate invoice, record payment. Balance updates automatically." />
      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="soft-card rounded-lg p-5">
          <h2 className="text-lg font-semibold">Step 1: Create Invoice From Booking</h2>
          <p className="mt-1 text-sm text-slate-500">Use this after a booking is confirmed or completed.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px]">
            <select value={bookingId} onChange={(event) => setBookingId(event.target.value)} className="rounded-md border border-slate-300 px-3 py-3">
              <option value="">Select booking</option>
              {bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.booking_code} - {booking.patient?.full_name} - {booking.service_name}
                </option>
              ))}
            </select>
            <button onClick={generateInvoice} className="rounded-md bg-[#5b0f4d] px-4 py-3 text-sm font-semibold text-white">
              Generate Invoice
            </button>
          </div>
          {selectedBooking ? (
            <div className="mt-4 rounded-lg border border-fuchsia-100 bg-fuchsia-50/60 p-4 text-sm">
              <p className="font-semibold">{selectedBooking.service_name}</p>
              <p className="mt-1 text-slate-600">{selectedBooking.patient?.full_name} - {selectedBooking.booking_date} at {selectedBooking.booking_time}</p>
              <p className="mt-1 font-semibold">{money(selectedBooking.price, selectedBooking.currency)}</p>
            </div>
          ) : null}
        </div>

        <form onSubmit={recordPayment} className="soft-card rounded-lg p-5">
          <h2 className="text-lg font-semibold">Step 2: Record Payment</h2>
          <p className="mt-1 text-sm text-slate-500">Select invoice and enter received amount.</p>
          <div className="mt-4 space-y-3">
            <select value={invoiceId} onChange={(event) => {
              setInvoiceId(event.target.value);
              const invoice = invoices.find((item) => item.id === Number(event.target.value));
              setAmount(invoice?.balance_due ?? "");
            }} className="w-full rounded-md border border-slate-300 px-3 py-3">
              <option value="">Select invoice</option>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} - balance {money(invoice.balance_due, invoice.currency)}
                </option>
              ))}
            </select>
            <input required type="number" min="0" placeholder="Amount received" value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-3" />
            <select value={method} onChange={(event) => setMethod(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-3">
              <option value="pay_at_clinic">Pay at Clinic</option>
              <option value="online">Online</option>
              <option value="advance">Advance</option>
              <option value="full">Full</option>
            </select>
            <input placeholder="Transaction ID optional" value={transactionId} onChange={(event) => setTransactionId(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-3" />
            <button className="w-full rounded-md bg-[#5b0f4d] px-4 py-3 text-sm font-semibold text-white">Save Payment</button>
          </div>
        </form>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Invoices</h2>
          <div className="mt-4 space-y-3">
            {invoices.length === 0 ? <EmptyState title="No invoices yet" message="Generate an invoice from a booking." /> : null}
            {invoices.map((invoice) => (
              <button key={invoice.id} onClick={() => { setInvoiceId(String(invoice.id)); setAmount(invoice.balance_due); }} className="block w-full rounded-lg border border-slate-200 p-4 text-left hover:border-fuchsia-300">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-semibold">{invoice.invoice_number}</p>
                    <p className="mt-1 text-sm text-slate-500">Booking {invoice.booking_id || "-"} - {invoice.status.replace("_", " ")}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{money(invoice.total_amount, invoice.currency)}</p>
                    <p className="text-slate-500">Balance {money(invoice.balance_due, invoice.currency)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Recent Payments</h2>
          <div className="mt-4 space-y-3">
            {payments.length === 0 ? <EmptyState title="No payments yet" message="Payments recorded against invoices appear here." /> : null}
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-semibold">{money(payment.amount, "AED")}</p>
                    <p className="mt-1 text-sm text-slate-500">Invoice {payment.invoice_id || "-"} - Booking {payment.booking_id || "-"}</p>
                  </div>
                  <p className="text-sm font-semibold capitalize">{payment.payment_status.replace("_", " ")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
