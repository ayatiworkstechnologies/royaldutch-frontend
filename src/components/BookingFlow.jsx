"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, duration, money } from "@/lib/api";

const today = new Date().toISOString().slice(0, 10);
const steps = ["Service", "Specialist", "Date & Time", "Patient", "Confirm"];

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
    return <div className="mx-auto max-w-7xl px-4 py-10 text-slate-600">Loading booking flow...</div>;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/book" className="text-sm font-semibold text-fuchsia-800">
          Change service
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Book Appointment</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Complete each step and send the request to the clinic team for confirmation.</p>
      </div>

      <div className="mb-6 soft-card rounded-lg p-4">
        <div className="grid gap-2 sm:grid-cols-5">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => index < step && setStep(index)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold ${
                index === step ? "bg-fuchsia-900 text-white shadow-sm" : index < step ? "bg-fuchsia-50 text-fuchsia-900 ring-1 ring-fuchsia-100" : "bg-slate-50 text-slate-500"
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs text-slate-900">{index + 1}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="mb-5 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="soft-card rounded-lg p-6">
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
          {step === 3 ? <PatientStep patient={patient} updatePatient={updatePatient} /> : null}
          {step === 4 ? (
            <ConfirmStep
              service={service}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedStaffName={selectedStaffName}
              patient={patient}
            />
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={previousStep}
              disabled={step === 0 || submitting}
              className="h-11 rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="h-11 rounded-md bg-fuchsia-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-fuchsia-950"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={submitBooking}
                disabled={submitting}
                className="h-11 rounded-md bg-fuchsia-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-fuchsia-950 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? "Sending Request..." : "Confirm Booking"}
              </button>
            )}
          </div>
        </div>

        <BookingSummary
          service={service}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedStaffName={selectedStaffName}
          patient={patient}
        />
      </div>
    </section>
  );
}

function ServiceStep({ service }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-fuchsia-800">Step 1</p>
      <h2 className="mt-2 text-2xl font-semibold">Selected Service</h2>
      <div className="mt-5 rounded-lg border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 to-white p-5">
        <p className="text-xl font-semibold text-slate-950">{service?.name}</p>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Info label="Duration" value={duration(service?.duration_minutes)} />
          <Info label="Price" value={money(service?.price, service?.currency)} />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600">Review the treatment details before choosing a specialist.</p>
    </div>
  );
}

function SpecialistStep({ assignedStaff, selectedStaff, setSelectedStaff }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-fuchsia-800">Step 2</p>
      <h2 className="mt-2 text-2xl font-semibold">Choose Staff / Doctor</h2>
      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={() => setSelectedStaff("")}
          className={`rounded-lg border p-4 text-left shadow-sm ${selectedStaff === "" ? "border-fuchsia-800 bg-fuchsia-50 ring-2 ring-fuchsia-100" : "border-slate-200 bg-white hover:border-fuchsia-300"}`}
        >
          <p className="font-semibold">Any Available Specialist</p>
          <p className="mt-1 text-sm text-slate-500">The system will assign the first available specialist for your slot.</p>
        </button>
        {assignedStaff.map((member) => (
          <button
            type="button"
            key={member.id}
            onClick={() => setSelectedStaff(String(member.id))}
            className={`rounded-lg border p-4 text-left shadow-sm ${selectedStaff === String(member.id) ? "border-fuchsia-800 bg-fuchsia-50 ring-2 ring-fuchsia-100" : "border-slate-200 bg-white hover:border-fuchsia-300"}`}
          >
            <p className="font-semibold">{member.name}</p>
            <p className="mt-1 text-sm text-slate-500">{member.role} - {member.specialization}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function DateTimeStep({ selectedDate, setSelectedDate, selectedTime, setSelectedTime, slots, loadingSlots }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-fuchsia-800">Step 3</p>
      <h2 className="mt-2 text-2xl font-semibold">Select Date & Time</h2>
      <input
        type="date"
        min={today}
        value={selectedDate}
        onChange={(event) => setSelectedDate(event.target.value)}
        className="mt-5 rounded-md border border-slate-300 px-3 py-3"
      />
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {loadingSlots ? <p className="col-span-full text-sm text-slate-500">Loading available slots...</p> : null}
        {!loadingSlots && slots.length === 0 ? <p className="col-span-full text-sm text-slate-500">No slots available for this date.</p> : null}
        {slots.map((slot) => (
          <button
            type="button"
            key={slot}
            onClick={() => setSelectedTime(slot)}
            className={`rounded-md border px-3 py-3 text-sm font-semibold shadow-sm ${
              selectedTime === slot ? "border-fuchsia-900 bg-fuchsia-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-fuchsia-600"
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  );
}

function PatientStep({ patient, updatePatient }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-fuchsia-800">Step 4</p>
      <h2 className="mt-2 text-2xl font-semibold">Patient Details</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <input required placeholder="Full Name" value={patient.full_name} onChange={(event) => updatePatient("full_name", event.target.value)} className="rounded-md border border-slate-300 px-3 py-3" />
        <input required placeholder="Mobile Number" value={patient.phone} onChange={(event) => updatePatient("phone", event.target.value)} className="rounded-md border border-slate-300 px-3 py-3" />
        <input type="email" placeholder="Email" value={patient.email} onChange={(event) => updatePatient("email", event.target.value)} className="rounded-md border border-slate-300 px-3 py-3" />
        <input type="number" min="1" placeholder="Age" value={patient.age} onChange={(event) => updatePatient("age", event.target.value)} className="rounded-md border border-slate-300 px-3 py-3" />
        <select value={patient.gender} onChange={(event) => updatePatient("gender", event.target.value)} className="rounded-md border border-slate-300 px-3 py-3">
          <option value="">Gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>
        <label className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-3 text-sm">
          <input type="checkbox" checked={patient.first_visit} onChange={(event) => updatePatient("first_visit", event.target.checked)} />
          First visit
        </label>
        <textarea placeholder="Message / Concern" value={patient.notes} onChange={(event) => updatePatient("notes", event.target.value)} className="min-h-28 rounded-md border border-slate-300 px-3 py-3 sm:col-span-2" />
      </div>
    </div>
  );
}

function ConfirmStep({ service, selectedDate, selectedTime, selectedStaffName, patient }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-fuchsia-800">Step 5</p>
      <h2 className="mt-2 text-2xl font-semibold">Confirm Booking</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Info label="Service" value={service?.name} />
        <Info label="Staff" value={selectedStaffName} />
        <Info label="Date" value={selectedDate} />
        <Info label="Time" value={selectedTime} />
        <Info label="Patient" value={patient.full_name} />
        <Info label="Mobile" value={patient.phone} />
      </div>
      <p className="mt-5 rounded-md bg-amber-50 p-3 text-sm text-amber-800">Booking status will be Pending until the clinic team confirms it.</p>
    </div>
  );
}

function BookingSummary({ service, selectedDate, selectedTime, selectedStaffName, patient }) {
  return (
    <aside className="h-fit soft-card rounded-lg p-5 lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-800">Appointment desk</p>
      <h2 className="mt-1 text-lg font-semibold">Booking Summary</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <SummaryRow label="Service" value={service?.name || "-"} />
        <SummaryRow label="Duration" value={duration(service?.duration_minutes)} />
        <SummaryRow label="Price" value={money(service?.price, service?.currency)} />
        <SummaryRow label="Staff" value={selectedStaffName || "Any Available Specialist"} />
        <SummaryRow label="Date" value={selectedDate || "-"} />
        <SummaryRow label="Time" value={selectedTime || "Choose slot"} />
        <SummaryRow label="Patient" value={patient.full_name || "Enter details"} />
      </dl>
    </aside>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value || "-"}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
