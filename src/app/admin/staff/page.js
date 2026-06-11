"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import AdminTable from "@/components/AdminTable";
import FormSection, { FormField, inputClass, btnPrimary, btnSecondary, btnDanger } from "@/components/FormSection";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";

const defaultAvailability = [0, 1, 2, 3, 4, 5].map((day) => ({
  day_of_week: day,
  start_time: "10:00",
  end_time: "18:00",
  break_start_time: "13:00",
  break_end_time: "14:00",
  status: "active",
}));

const empty = {
  name: "",
  email: "",
  phone: "",
  role: "",
  specialization: "",
  status: "active",
  service_ids: [],
  availability: defaultAvailability,
};

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const [staffData, serviceData] = await Promise.all([api.staff(), api.services()]);
    setStaff(staffData);
    setServices(serviceData);
  }

  useEffect(() => {
    Promise.all([api.staff(), api.services()])
      .then(([staffData, serviceData]) => {
        setStaff(staffData);
        setServices(serviceData);
      })
      .catch((err) => setError(err.message));
  }, []);

  function setField(field, value) {
    setForm((c) => ({ ...c, [field]: value }));
  }

  function toggleService(id) {
    setForm((c) => ({
      ...c,
      service_ids: c.service_ids.includes(id)
        ? c.service_ids.filter((item) => item !== id)
        : [...c.service_ids, id],
    }));
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, service_ids: form.service_ids.map(Number) };
      if (editingId) await api.updateStaff(editingId, payload);
      else await api.createStaff(payload);
      setForm({ ...empty, availability: defaultAvailability });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function edit(member) {
    setEditingId(member.id);
    setForm({
      name: member.name,
      email: member.email || "",
      phone: member.phone || "",
      role: member.role,
      specialization: member.specialization || "",
      status: member.status,
      service_ids: member.service_ids || [],
      availability: member.availability?.length ? member.availability : defaultAvailability,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const serviceMap = Object.fromEntries(services.map((s) => [s.id, s.name]));

  const columns = [
    { key: "name", label: "Name", render: (row) => <span className="font-semibold text-slate-900">{row.name}</span> },
    { key: "email", label: "Email", render: (row) => row.email || <span className="text-slate-400">–</span> },
    { key: "role", label: "Role", render: (row) => <span className="capitalize">{row.role}</span> },
    { key: "specialization", label: "Specialization", render: (row) => row.specialization || "–" },
    {
      key: "services",
      label: "Services",
      render: (row) => {
        const count = row.service_ids?.length || 0;
        return (
          <span className="inline-flex items-center rounded-full bg-fuchsia-50 px-2.5 py-1 text-xs font-semibold text-fuchsia-800">
            {count} assigned
          </span>
        );
      },
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
        <div className="flex gap-2">
          <button onClick={() => edit(row)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-fuchsia-50 hover:text-fuchsia-700 hover:border-fuchsia-200">
            Edit
          </button>
          <button onClick={() => api.deleteStaff(row.id).then(load)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader title="Staff / Doctor Management" description="Add doctors, assign services, set availability schedules." />
      {error && <p className="mt-4 rounded-lg bg-rose-50 border border-rose-100 p-3.5 text-sm text-rose-700">{error}</p>}

      <FormSection
        title={editingId ? `Edit Staff #${editingId}` : "Add New Staff Member"}
        onSubmit={save}
        actions={
          <>
            <button className={btnPrimary}>{editingId ? "Update" : "Add"} Staff</button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ ...empty, availability: defaultAvailability }); }} className={btnSecondary}>
                Cancel
              </button>
            )}
          </>
        }
      >
        <FormField label="Name" required>
          <input required placeholder="Dr. John Smith" value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Email">
          <input type="email" placeholder="doctor@royaldutch.ae" value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Phone">
          <input placeholder="+971 5xx xxx xxxx" value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Role" required>
          <input required placeholder="Dermatologist, Dentist, etc." value={form.role} onChange={(e) => setField("role", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Specialization">
          <input placeholder="Area of expertise" value={form.specialization} onChange={(e) => setField("specialization", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Status">
          <select value={form.status} onChange={(e) => setField("status", e.target.value)} className={inputClass}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FormField>

        {/* Services assignment — full width */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned Services</label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <label key={service.id} className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition ${form.service_ids.includes(service.id) ? "border-fuchsia-300 bg-fuchsia-50/60 text-fuchsia-900" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                <input type="checkbox" checked={form.service_ids.includes(service.id)} onChange={() => toggleService(service.id)} className="rounded border-slate-300 text-fuchsia-700 focus:ring-fuchsia-200" />
                {service.name}
              </label>
            ))}
          </div>
        </div>
      </FormSection>

      <AdminTable columns={columns} data={staff} perPage={10} emptyTitle="No staff members found" emptyMessage="Add doctors and staff members to get started." />
    </AdminShell>
  );
}
