"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import FormSection, { FormField, inputClass, btnPrimary } from "@/components/FormSection";
import { api } from "@/lib/api";

const emptySettings = {
  clinic_name: "",
  clinic_email: "",
  clinic_phone: "",
  clinic_address: "",
  invoice_footer: "",
  invoice_terms: "",
  tax_registration_number: "",
  default_currency: "AED",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState(emptySettings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.settings().then(setForm).catch((err) => setError(err.message));
  }, []);

  function setField(key, value) {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      setForm(await api.updateSettings(form));
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader title="Clinic Settings" description="Clinic identity and invoice details used in PDFs and customer emails." />
      {error && <p className="mt-4 rounded-lg border border-rose-100 bg-rose-50 p-3.5 text-sm text-rose-700">{error}</p>}
      {saved && <p className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3.5 text-sm text-emerald-700">Settings saved.</p>}

      <div className="mt-5">
        <FormSection
          title="Clinic & Invoice Profile"
          onSubmit={save}
          actions={<button disabled={busy} className={btnPrimary}>{busy ? "Saving..." : "Save Settings"}</button>}
        >
          <FormField label="Clinic Name" required>
            <input required value={form.clinic_name} onChange={(e) => setField("clinic_name", e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Clinic Email" required>
            <input required type="email" value={form.clinic_email} onChange={(e) => setField("clinic_email", e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Clinic Phone" required>
            <input required value={form.clinic_phone} onChange={(e) => setField("clinic_phone", e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Default Currency" required>
            <input required value={form.default_currency} onChange={(e) => setField("default_currency", e.target.value.toUpperCase())} className={inputClass} />
          </FormField>
          <div className="md:col-span-2 lg:col-span-3">
            <FormField label="Clinic Address" required>
              <textarea required value={form.clinic_address} onChange={(e) => setField("clinic_address", e.target.value)} className={`${inputClass} min-h-24`} />
            </FormField>
          </div>
          <FormField label="Tax Registration Number">
            <input value={form.tax_registration_number} onChange={(e) => setField("tax_registration_number", e.target.value)} className={inputClass} />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Invoice Terms" required>
              <textarea required value={form.invoice_terms} onChange={(e) => setField("invoice_terms", e.target.value)} className={`${inputClass} min-h-24`} />
            </FormField>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <FormField label="Invoice Footer" required>
              <input required value={form.invoice_footer} onChange={(e) => setField("invoice_footer", e.target.value)} className={inputClass} />
            </FormField>
          </div>
        </FormSection>
      </div>
    </AdminShell>
  );
}
