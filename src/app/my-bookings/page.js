"use client";

import { useEffect, useState } from "react";
import PublicShell from "@/components/PublicShell";
import StatusBadge from "@/components/StatusBadge";
import { api, clearCustomerSession, getCustomerProfile, money, setCustomerSession } from "@/lib/api";
import { AlertCircle, Calendar, Clock, Download, FileText, Hash, Mail, Save, ShieldCheck, Sparkles, User } from "lucide-react";

export default function MyBookingsPage() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [profile, setProfile] = useState(null);
  const [patient, setPatient] = useState(null);
  const [patientForm, setPatientForm] = useState({ full_name: "", phone: "", email: "", gender: "", age: "", notes: "" });
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState("");

  useEffect(() => {
    const saved = getCustomerProfile();
    if (saved?.email) {
      setProfile(saved);
      setEmail(saved.email);
      loadPortal();
    }
  }, []);

  useEffect(() => {
    if (!googleClientId || step === "portal") return;

    function renderGoogleButton() {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          setError("");
          setLoading(true);
          try {
            const data = await api.googleLogin(response.credential);
            setCustomerSession(data);
            setProfile({ name: data.name, email: data.email, role: data.role });
            await loadPortal();
            setStep("portal");
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        },
      });
      const target = document.getElementById("google-customer-login");
      if (target) {
        target.innerHTML = "";
        window.google.accounts.id.renderButton(target, {
          theme: "outline",
          size: "large",
          width: Math.min(360, target.clientWidth || 360),
          text: "continue_with",
        });
      }
    }

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);
  }, [googleClientId, step]);

  function fillPatientForm(data) {
    setPatient(data);
    setPatientForm({
      full_name: data?.full_name || "",
      phone: data?.phone || "",
      email: data?.email || "",
      gender: data?.gender || "",
      age: data?.age ? String(data.age) : "",
      notes: data?.notes || "",
    });
  }

  async function loadPortal() {
    setLoading(true);
    setError("");
    try {
      const [profileData, bookingData, invoiceData] = await Promise.all([
        api.myProfile(),
        api.myBookings(),
        api.myInvoices(),
      ]);
      fillPatientForm(profileData);
      setBookings(bookingData);
      setInvoices(invoiceData);
      setStep("portal");
    } catch {
      clearCustomerSession();
      setProfile(null);
      setStep("email");
    } finally {
      setLoading(false);
    }
  }

  async function requestOtp(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.requestCustomerOtp(email);
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.verifyCustomerOtp(email, code);
      setCustomerSession(data);
      setProfile({ name: data.name, email: data.email, role: data.role });
      await loadPortal();
      setStep("portal");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearCustomerSession();
    setProfile(null);
    setPatient(null);
    setBookings([]);
    setInvoices([]);
    setCode("");
    setStep("email");
  }

  function updatePatientForm(field, value) {
    setPatientForm((current) => ({ ...current, [field]: value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingProfile(true);
    try {
      const updated = await api.updateMyProfile({
        full_name: patientForm.full_name,
        phone: patientForm.phone,
        gender: patientForm.gender || null,
        age: patientForm.age ? Number(patientForm.age) : null,
        notes: patientForm.notes || null,
      });
      fillPatientForm(updated);
      setNotice("Personal details updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function downloadInvoice(invoice) {
    setError("");
    setDownloadingInvoice(invoice.id);
    try {
      const blob = await api.myInvoicePdf(invoice.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoice_number || "invoice"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingInvoice("");
    }
  }

  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-100 bg-fuchsia-50 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-fuchsia-800">
            <Sparkles size={11} className="text-amber-500" />
            Customer Portal
          </span>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">My Appointments</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Enter your email, verify the OTP, and open your appointment portal.
          </p>
        </div>

        {step !== "portal" && (
          <div className="premium-card mx-auto max-w-xl p-6 shadow-xl md:p-8">
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {step === "email" ? (
              <div className="space-y-5">
                {googleClientId ? (
                  <>
                    <div id="google-customer-login" className="flex min-h-11 justify-center" />
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-x-0 border-t border-slate-200" />
                      <span className="relative bg-white px-3 text-xs font-bold uppercase tracking-wider text-slate-400">or email OTP</span>
                    </div>
                  </>
                ) : null}

                <form onSubmit={requestOtp} className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail size={15} className="absolute left-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="premium-input w-full pl-10 text-sm font-semibold"
                    />
                  </div>
                  <button className="btn-premium-primary w-full py-3 text-xs font-bold uppercase tracking-wider">
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </form>
                {!googleClientId ? (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
                    Google login is available after setting <strong>NEXT_PUBLIC_GOOGLE_CLIENT_ID</strong>.
                  </div>
                ) : null}
              </div>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-4">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                  OTP sent to <strong>{email}</strong>. Check your inbox.
                </div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">6 Digit OTP</label>
                <input
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="premium-input w-full text-center text-2xl font-bold tracking-[0.5em]"
                />
                <button className="btn-premium-primary w-full py-3 text-xs font-bold uppercase tracking-wider">
                  {loading ? "Verifying..." : "Open Portal"}
                </button>
                <button type="button" onClick={() => setStep("email")} className="w-full text-xs font-bold text-slate-500">
                  Use another email
                </button>
              </form>
            )}
          </div>
        )}

        {step === "portal" && (
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  Signed in as {profile?.name || profile?.email}
                </p>
                <p className="mt-1 text-xs text-slate-500">{profile?.email}</p>
              </div>
              <button onClick={logout} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                Logout
              </button>
            </div>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}
            {notice && (
              <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                {notice}
              </div>
            )}

            {loading ? <p className="py-10 text-center text-sm text-slate-500">Loading portal...</p> : null}
            {!loading && patient ? (
              <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
                <form onSubmit={saveProfile} className="premium-card bg-white p-6">
                  <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-slate-900">Personal Details</h2>
                      <p className="mt-1 text-xs text-slate-500">Keep your clinic profile updated.</p>
                    </div>
                    <User size={18} className="text-[#5b0f4d]" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input required placeholder="Full name" value={patientForm.full_name} onChange={(event) => updatePatientForm("full_name", event.target.value)} className="premium-input text-sm sm:col-span-2" />
                    <input required placeholder="Phone" value={patientForm.phone} onChange={(event) => updatePatientForm("phone", event.target.value)} className="premium-input text-sm" />
                    <input disabled value={patientForm.email} className="premium-input bg-slate-50 text-sm text-slate-500" />
                    <select value={patientForm.gender} onChange={(event) => updatePatientForm("gender", event.target.value)} className="premium-input text-sm">
                      <option value="">Gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                    <input type="number" min="1" placeholder="Age" value={patientForm.age} onChange={(event) => updatePatientForm("age", event.target.value)} className="premium-input text-sm" />
                    <textarea placeholder="Notes" value={patientForm.notes} onChange={(event) => updatePatientForm("notes", event.target.value)} className="premium-input min-h-24 text-sm sm:col-span-2" />
                  </div>
                  <button disabled={savingProfile} className="btn-premium-primary mt-5 inline-flex w-full items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider">
                    <Save size={14} />
                    {savingProfile ? "Saving..." : "Save Details"}
                  </button>
                </form>

                <div className="premium-card bg-white p-6">
                  <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-slate-900">Invoices</h2>
                      <p className="mt-1 text-xs text-slate-500">View and download your billing PDFs.</p>
                    </div>
                    <FileText size={18} className="text-[#5b0f4d]" />
                  </div>
                  {invoices.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                      No invoices found.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoices.map((invoice) => (
                        <div key={invoice.id} className="rounded-xl border border-slate-100 bg-[#fcfafc] p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{invoice.invoice_number}</p>
                              <p className="mt-1 text-xs text-slate-500">Issued {invoice.issue_date}</p>
                              <p className="mt-2 text-sm font-extrabold text-[#5b0f4d]">{money(invoice.total_amount, invoice.currency)}</p>
                            </div>
                            <StatusBadge status={invoice.status} />
                          </div>
                          <button type="button" onClick={() => downloadInvoice(invoice)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#5b0f4d] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#5b0f4d] hover:bg-fuchsia-50">
                            <Download size={14} />
                            {downloadingInvoice === invoice.id ? "Downloading..." : "Download PDF"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {!loading && bookings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                No appointments found for this email.
              </div>
            ) : null}

            {!loading && bookings.length > 0 ? (
              <h2 className="mb-4 font-serif text-xl font-bold text-slate-900">Appointments</h2>
            ) : null}
            <div className="space-y-4">
              {bookings.map((booking) => (
                <article key={booking.id} className="premium-card bg-white p-6">
                  <div className="mb-4 flex flex-col gap-4 border-b border-slate-50 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-serif text-base font-bold text-slate-900">{booking.service_name}</h3>
                      <div className="mt-2.5 space-y-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><Calendar size={13} />{booking.booking_date}</span>
                        <span className="flex items-center gap-1.5"><Clock size={13} />At {booking.booking_time}</span>
                        <span className="flex items-center gap-1.5"><User size={13} />Doctor: {booking.staff_name || "Any Specialist"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <StatusBadge status={booking.status} />
                      <span className="text-sm font-bold text-fuchsia-950">{money(booking.price, booking.currency)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1"><Hash size={12} />Code: {booking.booking_code}</span>
                    <span>Royal Dutch Medical Centre</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </PublicShell>
  );
}
