"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
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
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleService(id) {
    setForm((current) => ({
      ...current,
      service_ids: current.service_ids.includes(id)
        ? current.service_ids.filter((item) => item !== id)
        : [...current.service_ids, id],
    }));
  }

  async function save(event) {
    event.preventDefault();
    const payload = { ...form, service_ids: form.service_ids.map(Number) };
    if (editingId) await api.updateStaff(editingId, payload);
    else await api.createStaff(payload);
    setForm({ ...empty, availability: defaultAvailability });
    setEditingId(null);
    load();
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
  }

  return (
    <AdminShell>
      <h2 className="text-xl font-semibold">Staff / Doctor Management</h2>
      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <form onSubmit={save} className="mt-5 soft-card rounded-lg p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <input required placeholder="Name" value={form.name} onChange={(e) => setField("name", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
          <input placeholder="Email" value={form.email} onChange={(e) => setField("email", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setField("phone", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
          <input required placeholder="Role" value={form.role} onChange={(e) => setField("role", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
          <input placeholder="Specialization" value={form.specialization} onChange={(e) => setField("specialization", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
          <select value={form.status} onChange={(e) => setField("status", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="mt-4">
          <p className="text-sm font-semibold">Assigned Services</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <label key={service.id} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
                <input type="checkbox" checked={form.service_ids.includes(service.id)} onChange={() => toggleService(service.id)} />
                {service.name}
              </label>
            ))}
          </div>
        </div>
        <button className="mt-4 rounded-md bg-fuchsia-800 px-4 py-2 text-sm font-semibold text-white">
          {editingId ? "Update" : "Add"} Staff
        </button>
      </form>
      <div className="mt-5 grid gap-3">
        {staff.map((member) => (
          <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="font-semibold">{member.name} - {member.role}</p>
              <p className="text-sm text-slate-500">{member.specialization} - {member.service_ids?.length || 0} services</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => edit(member)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Edit</button>
              <button onClick={() => api.deleteStaff(member.id).then(load)} className="rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-700">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
