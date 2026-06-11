"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api, duration, money } from "@/lib/api";
import { 
  User, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  UserCheck,
  FileText,
  BadgeAlert,
  ChevronRight,
  X
} from "lucide-react";

const today = new Date().toISOString().slice(0, 10);
const steps = [
  { name: "Service", icon: Sparkles },
  { name: "Specialist", icon: User },
  { name: "Date & Time", icon: CalendarIcon },
  { name: "Patient", icon: UserCheck },
  { name: "Confirm", icon: FileText }
];

export default function BookingFlow({ serviceSlug }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [service, setService] = useState(null);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [patient, setPatient] = useState({
    full_name: "",
    phone: "",
    email: "",
    gender: "",
    age: "",
    notes: "",
    first_visit: true,
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [modalMode, setModalMode] = useState("email"); // "email" or "code"
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    if (isLoginModalOpen && modalMode === "code") {
      setTimeout(() => {
        const firstInput = document.getElementById("otp-0");
        if (firstInput) firstInput.focus();
      }, 100);
    }
  }, [isLoginModalOpen, modalMode]);

  const assignedStaff = useMemo(() => staff.filter((member) => member.service_ids?.includes(service?.id)), [staff, service]);
  const selectedStaffName = selectedStaff ? assignedStaff.find((member) => member.id === Number(selectedStaff))?.name : "Any Available Specialist";

  useEffect(() => {
    async function load() {
      try {
        const [serviceData, staffData] = await Promise.all([api.service(serviceSlug), api.staff()]);
        setService(serviceData);
        setStaff(staffData);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [serviceSlug]);

  useEffect(() => {
    async function loadSlots() {
      if (!service?.id || !selectedDate) return;
      setLoadingSlots(true);
      setSelectedTime("");
      try {
        const data = await api.slots({ serviceId: service.id, selectedDate, staffId: selectedStaff });
        setSlots(data.slots || []);
      } catch (err) {
        setSlots([]);
        setError(err.message);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [service, selectedDate, selectedStaff]);

  useEffect(() => {
    if (step === 3) {
      setIsLoginModalOpen(true);
    }
  }, [step]);

  function handleSendCode(e) {
    e.preventDefault();
    if (loginEmail) {
      setModalMode("code");
    }
  }

  function handleOtpChange(e, index) {
    const value = e.target.value;
    const cleanValue = value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];

    if (!cleanValue) {
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    if (cleanValue.length > 1) {
      if (otp[index] !== "" && cleanValue.startsWith(otp[index])) {
        const char = cleanValue[cleanValue.length - 1];
        newOtp[index] = char;
        setOtp(newOtp);
        if (index < 5) {
          const nextInput = document.getElementById(`otp-${index + 1}`);
          if (nextInput) nextInput.focus();
        }
      } else {
        const digits = cleanValue.split("").slice(0, 6 - index);
        digits.forEach((digit, idx) => {
          newOtp[index + idx] = digit;
        });
        setOtp(newOtp);
        const nextIdx = Math.min(index + digits.length, 5);
        const nextInput = document.getElementById(`otp-${nextIdx}`);
        if (nextInput) nextInput.focus();
      }
    } else {
      newOtp[index] = cleanValue;
      setOtp(newOtp);
      if (index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  }

  function handleOtpKeyDown(e, index) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      if (otp[index] !== "") {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) {
          prevInput.focus();
        }
      }
    }
  }

  function handleVerifyCode(e) {
    if (e) e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) {
      updatePatient("email", loginEmail);
      if (!patient.full_name) {
        updatePatient("full_name", "Registered Patient");
        updatePatient("phone", "+971 50 123 4567");
      }
      setIsLoginModalOpen(false);
      setModalMode("email");
      setOtp(["", "", "", "", "", ""]);
    }
  }

  function handleSocialLogin(provider) {
    const mockEmail = `${provider}-user@example.com`;
    setLoginEmail(mockEmail);
    updatePatient("email", mockEmail);
    if (!patient.full_name) {
      updatePatient("full_name", `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`);
      updatePatient("phone", "+971 50 999 8888");
    }
    setIsLoginModalOpen(false);
    setModalMode("email");
  }

  function updatePatient(field, value) {
    setPatient((current) => ({ ...current, [field]: value }));
  }

  function canContinue() {
    if (step === 0) return Boolean(service);
    if (step === 1) return true;
    if (step === 2) return Boolean(selectedDate && selectedTime);
    if (step === 3) return Boolean(patient.full_name && patient.phone);
    return true;
  }

  function nextStep() {
    setError("");
    if (!canContinue()) {
      setError("Please complete this step before continuing.");
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function previousStep() {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submitBooking() {
    setError("");
    setSubmitting(true);
    try {
      const booking = await api.createBooking({
        service_id: service.id,
        staff_id: selectedStaff ? Number(selectedStaff) : null,
        booking_date: selectedDate,
        booking_time: `${selectedTime}:00`,
        patient: {
          full_name: patient.full_name,
          phone: patient.phone,
          email: patient.email || null,
          gender: patient.gender || null,
          age: patient.age ? Number(patient.age) : null,
        },
        notes: patient.notes || null,
        first_visit: Boolean(patient.first_visit),
      });
      router.push(`/booking-success?code=${encodeURIComponent(booking.booking_code)}&status=${booking.status}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!service && !error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-200 border-t-fuchsia-800 mx-auto"></div>
        <p className="mt-4 text-sm font-semibold">Initializing booking wizard...</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner and Navigation */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Link href="/book" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-fuchsia-800 hover:text-fuchsia-950 transition-colors">
            <ArrowLeft size={12} />
            Change service
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl font-serif text-slate-900">Book Appointment</h1>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-500 leading-relaxed">
            Follow our premium booking process to reserve your therapy slot. Our reception team will review and confirm.
          </p>
        </div>
      </div>

      {/* Modern Stepper Indicator */}
      <div className="mb-8 soft-card rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-50/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          {steps.map((item, index) => {
            const IconComponent = item.icon;
            const isCompleted = index < step;
            const isActive = index === step;
            
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => index < step && setStep(index)}
                disabled={index >= step}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300 ${
                  isActive 
                    ? "bg-[#5b0f4d] text-white shadow-lg shadow-fuchsia-950/15 scale-[1.02]" 
                    : isCompleted 
                      ? "bg-fuchsia-50/80 text-fuchsia-900 border border-fuchsia-100/60 cursor-pointer" 
                      : "bg-slate-50/50 text-slate-400 border border-slate-100 cursor-not-allowed"
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                  isActive 
                    ? "bg-white text-[#5b0f4d]" 
                    : isCompleted 
                      ? "bg-fuchsia-200 text-[#5b0f4d]" 
                      : "bg-slate-200 text-slate-500"
                }`}>
                  {isCompleted ? <Check size={14} /> : index + 1}
                </span>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">Step {index + 1}</p>
                  <p className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <IconComponent size={14} />
                    {item.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs sm:text-sm text-rose-800 flex items-center gap-2">
          <BadgeAlert size={16} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Step Wizard Card */}
        <div className="premium-card p-6 md:p-8 flex flex-col justify-between min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex-grow"
            >
              {step === 0 ? <ServiceStep service={service} /> : null}
              {step === 1 ? (
                <SpecialistStep
                  assignedStaff={assignedStaff}
                  selectedStaff={selectedStaff}
                  setSelectedStaff={setSelectedStaff}
                />
              ) : null}
              {step === 2 ? (
                <DateTimeStep
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                  slots={slots}
                  loadingSlots={loadingSlots}
                />
              ) : null}
              {step === 3 ? <PatientStep patient={patient} updatePatient={updatePatient} setIsLoginModalOpen={setIsLoginModalOpen} /> : null}
              {step === 4 ? (
                <ConfirmStep
                  service={service}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  selectedStaffName={selectedStaffName}
                  patient={patient}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>

          {/* Stepper Navigation Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={previousStep}
              disabled={step === 0 || submitting}
              className="btn-premium-secondary py-3 px-6 text-xs sm:text-sm tracking-wider uppercase font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="flex items-center gap-1">
                <ArrowLeft size={14} />
                Back
              </span>
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-premium-primary py-3 px-6 text-xs sm:text-sm tracking-wider uppercase font-bold"
              >
                <span className="flex items-center gap-1">
                  Continue
                  <ArrowRight size={14} />
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={submitBooking}
                disabled={submitting}
                className="btn-premium-primary bg-gradient-to-r from-emerald-600 to-[#5b0f4d] py-3 px-6 text-xs sm:text-sm tracking-wider uppercase font-bold disabled:cursor-not-allowed disabled:bg-slate-400 disabled:opacity-50"
              >
                {submitting ? "Submitting request..." : "Confirm & Send"}
              </button>
            )}
          </div>
        </div>

        {/* Side Summary Block */}
        <BookingSummary
          service={service}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedStaffName={selectedStaffName}
          patient={patient}
        />
      </div>

      {/* Login / Sign Up Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setIsLoginModalOpen(false);
              setModalMode("email");
              setOtp(["", "", "", "", "", ""]);
            }}
          />
          <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 duration-200 text-left animate-fade-in">
            <button 
              type="button"
              onClick={() => {
                setIsLoginModalOpen(false);
                setModalMode("email");
                setOtp(["", "", "", "", "", ""]);
              }}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>

            {modalMode === "email" ? (
              <>
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-serif text-slate-900">Log in or sign up to book</h3>
                  <p className="mt-1.5 text-sm text-slate-500">We’ll need to verify it’s you to continue</p>
                </div>

                <form onSubmit={handleSendCode} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Email</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="Enter your email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm transition focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-100"
                    />
                    <p className="mt-1.5 text-[10px] text-slate-450">We'll send you a verification code</p>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full rounded-lg bg-[#5b0f4d] py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#4a0c3f] transition-all duration-200 active:scale-[0.98]"
                  >
                    Continue
                  </button>
                </form>

                <div className="relative my-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-150" /></div>
                  <span className="relative bg-white px-3 text-xs uppercase font-semibold text-slate-400 tracking-wider">or</span>
                </div>

                <div className="space-y-3">
                  <button 
                    type="button" 
                    onClick={() => {
                      setModalMode("code");
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
                  >
                    Continue with mobile
                  </button>

                  <button 
                    type="button" 
                    onClick={() => handleSocialLogin("facebook")}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
                  >
                    <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Continue with Facebook
                  </button>

                  <button 
                    type="button" 
                    onClick={() => handleSocialLogin("google")}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-serif text-slate-900">Enter Verification Code</h3>
                  <p className="mt-1.5 text-sm text-slate-500">
                    We sent a 6-digit verification code to <span className="font-semibold text-slate-700">{loginEmail || "your email"}</span>.
                  </p>
                </div>

                <form onSubmit={handleVerifyCode} className="mt-6 space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3 text-center">
                      Verification Code
                    </label>
                    <div className="grid grid-cols-6 gap-2 max-w-sm mx-auto">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={2}
                          value={digit}
                          onChange={(e) => handleOtpChange(e, idx)}
                          onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                          className="w-full h-12 text-center text-xl font-bold rounded-xl border border-slate-200 bg-white shadow-sm transition focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-100 text-slate-900"
                        />
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={otp.join("").length !== 6}
                    className="w-full rounded-lg bg-[#5b0f4d] py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#4a0c3f] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verify & Continue
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalMode("email");
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    className="w-full text-xs font-bold text-slate-500 hover:text-slate-700 transition"
                  >
                    Go Back
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function ServiceStep({ service }) {
  return (
    <div>
      <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 border border-fuchsia-100 px-3 py-1 text-[10px] font-bold text-fuchsia-900 uppercase tracking-wider">
        Step 1 of 5
      </span>
      <h2 className="mt-3 text-2xl font-bold font-serif text-slate-900">Treatment Summary</h2>
      
      <div className="mt-6 rounded-2xl border border-fuchsia-100/80 bg-gradient-to-br from-fuchsia-50/30 via-white to-white p-6 shadow-sm">
        <p className="text-xl font-bold font-serif text-slate-950">{service?.name}</p>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">{service?.description || "No service details provided."}</p>
        
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info label="Session Duration" value={duration(service?.duration_minutes)} />
          <Info label="Total Price" value={money(service?.price, service?.currency)} />
        </div>
      </div>
    </div>
  );
}

function SpecialistStep({ assignedStaff, selectedStaff, setSelectedStaff }) {
  return (
    <div>
      <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 border border-fuchsia-100 px-3 py-1 text-[10px] font-bold text-fuchsia-900 uppercase tracking-wider">
        Step 2 of 5
      </span>
      <h2 className="mt-3 text-2xl font-bold font-serif text-slate-900">Choose Specialist</h2>
      
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setSelectedStaff("")}
          className={`rounded-2xl border p-5 text-left transition-all duration-300 relative group flex flex-col justify-between ${
            selectedStaff === "" 
              ? "border-[#5b0f4d] bg-fuchsia-50/40 ring-1 ring-[#5b0f4d]" 
              : "border-slate-200 bg-white hover:border-fuchsia-300"
          }`}
        >
          <div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-100/60 text-[#5b0f4d] mb-4">
              <Sparkles size={16} />
            </div>
            <p className="font-bold text-slate-900 text-sm sm:text-base">Any Available Specialist</p>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">System will assign first doctor matching slot availability.</p>
          </div>
          {selectedStaff === "" && (
            <span className="absolute top-4 right-4 h-5 w-5 rounded-full bg-[#5b0f4d] flex items-center justify-center text-white">
              <Check size={12} />
            </span>
          )}
        </button>

        {assignedStaff.map((member) => (
          <button
            type="button"
            key={member.id}
            onClick={() => setSelectedStaff(String(member.id))}
            className={`rounded-2xl border p-5 text-left transition-all duration-300 relative group flex flex-col justify-between ${
              selectedStaff === String(member.id) 
                ? "border-[#5b0f4d] bg-fuchsia-50/40 ring-1 ring-[#5b0f4d]" 
                : "border-slate-200 bg-white hover:border-fuchsia-300"
            }`}
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-100/60 text-[#5b0f4d] mb-4 font-bold text-sm">
                {String(member.name || "D").slice(0, 1)}
              </div>
              <p className="font-bold text-slate-900 text-sm sm:text-base">{member.name}</p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{member.role} - {member.specialization}</p>
            </div>
            {selectedStaff === String(member.id) && (
              <span className="absolute top-4 right-4 h-5 w-5 rounded-full bg-[#5b0f4d] flex items-center justify-center text-white">
                <Check size={12} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function DateTimeStep({ selectedDate, setSelectedDate, selectedTime, setSelectedTime, slots, loadingSlots }) {
  return (
    <div>
      <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 border border-fuchsia-100 px-3 py-1 text-[10px] font-bold text-fuchsia-900 uppercase tracking-wider">
        Step 3 of 5
      </span>
      <h2 className="mt-3 text-2xl font-bold font-serif text-slate-900">Select Date & Time</h2>
      
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preferred Date</label>
          <input
            type="date"
            min={today}
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="premium-input w-full font-semibold"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Available Slots</label>
        
        {loadingSlots ? (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-200 border-t-fuchsia-800"></div>
            <span>Fetching real-time slots...</span>
          </div>
        ) : null}
        
        {!loadingSlots && slots.length === 0 ? (
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-6 text-center text-xs text-slate-500">
            No scheduling slots found on this date. Try another date.
          </div>
        ) : null}

        {!loadingSlots && slots.length > 0 ? (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
            {slots.map((slot) => (
              <button
                type="button"
                key={slot}
                onClick={() => setSelectedTime(slot)}
                className={`rounded-xl border py-3 text-xs font-bold transition-all shadow-sm ${
                  selectedTime === slot 
                    ? "border-[#5b0f4d] bg-[#5b0f4d] text-white ring-1 ring-fuchsia-850" 
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#5b0f4d]"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PatientStep({ patient, updatePatient, setIsLoginModalOpen }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 border border-fuchsia-100 px-3 py-1 text-[10px] font-bold text-fuchsia-900 uppercase tracking-wider">
            Step 4 of 5
          </span>
          <h2 className="mt-2 text-2xl font-bold font-serif text-slate-900">Patient Credentials</h2>
        </div>
        <button 
          type="button" 
          onClick={() => setIsLoginModalOpen(true)}
          className="text-xs font-bold text-[#5b0f4d] hover:underline hover:text-[#4a0c3f] transition-all bg-fuchsia-50 hover:bg-fuchsia-100/50 border border-fuchsia-100 px-3 py-2 rounded-xl text-left"
        >
          Sign in or register to book faster
        </button>
      </div>
      
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
          <input 
            required 
            placeholder="John Doe" 
            value={patient.full_name} 
            onChange={(event) => updatePatient("full_name", event.target.value)} 
            className="premium-input" 
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mobile Number *</label>
          <input 
            required 
            placeholder="+971 50 000 0000" 
            value={patient.phone} 
            onChange={(event) => updatePatient("phone", event.target.value)} 
            className="premium-input" 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
          <input 
            type="email" 
            placeholder="john@example.com" 
            value={patient.email} 
            onChange={(event) => updatePatient("email", event.target.value)} 
            className="premium-input" 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Age (Years)</label>
          <input 
            type="number" 
            min="1" 
            placeholder="30" 
            value={patient.age} 
            onChange={(event) => updatePatient("age", event.target.value)} 
            className="premium-input" 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender</label>
          <select 
            value={patient.gender} 
            onChange={(event) => updatePatient("gender", event.target.value)} 
            className="premium-input font-medium"
          >
            <option value="">Select gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/30 p-3 text-xs font-semibold select-none cursor-pointer w-full">
            <input 
              type="checkbox" 
              checked={patient.first_visit} 
              onChange={(event) => updatePatient("first_visit", event.target.checked)} 
              className="h-4 w-4 rounded border-slate-300 text-fuchsia-800 focus:ring-fuchsia-800"
            />
            <span>This is my first clinic visit</span>
          </label>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Medical Concerns / Notes</label>
          <textarea 
            placeholder="Describe symptoms or clinical context for the doctor..." 
            value={patient.notes} 
            onChange={(event) => updatePatient("notes", event.target.value)} 
            className="premium-input min-h-24 sm:col-span-2" 
          />
        </div>
      </div>
    </div>
  );
}

function ConfirmStep({ service, selectedDate, selectedTime, selectedStaffName, patient }) {
  return (
    <div>
      <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 border border-fuchsia-100 px-3 py-1 text-[10px] font-bold text-fuchsia-900 uppercase tracking-wider">
        Step 5 of 5
      </span>
      <h2 className="mt-3 text-2xl font-bold font-serif text-slate-900">Confirm Booking Details</h2>
      
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ConfirmRow label="Treatment" value={service?.name} />
        <ConfirmRow label="Doctor / Specialist" value={selectedStaffName} />
        <ConfirmRow label="Schedule Date" value={selectedDate} />
        <ConfirmRow label="Session Time" value={selectedTime} />
        <ConfirmRow label="Patient Name" value={patient.full_name} />
        <ConfirmRow label="Contact Number" value={patient.phone} />
      </div>
      
      <div className="mt-6 rounded-xl bg-amber-50/50 border border-amber-100 p-4 text-xs text-amber-900 flex items-start gap-2.5">
        <Sparkles size={14} className="text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          By sending this request, you lock this time slot. The status will stay <strong className="text-[#5b0f4d]">Pending</strong> until confirmed by reception.
        </p>
      </div>
    </div>
  );
}

function BookingSummary({ service, selectedDate, selectedTime, selectedStaffName, patient }) {
  return (
    <aside className="h-fit glass-panel rounded-2xl p-6 lg:sticky lg:top-28 shadow-xl">
      <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-800">Summary Desk</span>
      <h2 className="mt-1 text-lg font-bold font-serif text-slate-900 border-b border-slate-100 pb-3">Reserving Slot</h2>
      
      <dl className="mt-4 space-y-4 text-xs sm:text-sm">
        <SummaryRow label="Treatment" value={service?.name || "-"} />
        <SummaryRow label="Duration" value={duration(service?.duration_minutes)} />
        <SummaryRow label="Staff Specialist" value={selectedStaffName || "Any Specialist"} />
        <SummaryRow label="Date" value={selectedDate || "-"} />
        <SummaryRow label="Time Slot" value={selectedTime || "Not picked"} />
        <SummaryRow label="Patient Name" value={patient.full_name || "Not entered"} />
        <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
          <dt className="font-bold text-slate-800">Consultation Fee</dt>
          <dd className="font-extrabold text-[#5b0f4d] text-base">{money(service?.price, service?.currency)}</dd>
        </div>
      </dl>
    </aside>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-900 text-sm sm:text-base">{value || "-"}</p>
    </div>
  );
}

function ConfirmRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-[#5b0f4d] text-sm sm:text-base">{value || "-"}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-slate-500 font-semibold">{label}</dt>
      <dd className="text-right font-bold text-slate-900">{value}</dd>
    </div>
  );
}
