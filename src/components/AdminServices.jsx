"use client";

import { useEffect, useMemo, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import AdminTable from "@/components/AdminTable";
import FormSection, { FormField, inputClass, btnPrimary, btnSecondary } from "@/components/FormSection";
import StatusBadge from "@/components/StatusBadge";
import { api, duration, money } from "@/lib/api";

const empty = {
  external_id: "",
  category_id: "",
  name: "",
  slug: "",
  description: "",
  duration_minutes: "",
  price: "",
  currency: "AED",
  image: "",
  status: "active",
};

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const [categoryData, serviceData] = await Promise.all([api.categories(true), api.services("", true)]);
    setCategories(categoryData);
    setServices(serviceData);
    if (!form.category_id && categoryData[0]) setForm((c) => ({ ...c, category_id: categoryData[0].id }));
  }

  useEffect(() => {
    Promise.all([api.categories(true), api.services("", true)])
      .then(([categoryData, serviceData]) => {
        setCategories(categoryData);
        setServices(serviceData);
        if (categoryData[0]) setForm((c) => ({ ...c, category_id: c.category_id || categoryData[0].id }));
      })
      .catch((err) => setError(err.message));
  }, []);

  const categoryById = useMemo(() => Object.fromEntries(categories.map((item) => [item.id, item.name])), [categories]);
  const visibleServices = categoryFilter ? services.filter((item) => String(item.category_id) === categoryFilter) : services;

  function setField(field, value) {
    setForm((c) => ({ ...c, [field]: value }));
  }

  function payload() {
    return {
      ...form,
      external_id: form.external_id ? Number(form.external_id) : null,
      category_id: Number(form.category_id),
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      price: form.price === "" ? null : Number(form.price),
      image: form.image || null,
    };
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) await api.updateService(editingId, payload());
      else await api.createService(payload());
      setForm({ ...empty, category_id: categories[0]?.id || "" });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function edit(item) {
    setEditingId(item.id);
    setForm({
      external_id: item.external_id || "",
      category_id: item.category_id,
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      duration_minutes: item.duration_minutes || "",
      price: item.price ?? "",
      currency: item.currency || "AED",
      image: item.image || "",
      status: item.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const columns = [
    { key: "name", label: "Service", render: (row) => (
      <div>
        <span className="font-semibold text-slate-900">{row.name}</span>
        <br />
        <code className="text-[10px] text-slate-400">{row.slug}</code>
      </div>
    )},
    { key: "category", label: "Category", render: (row) => categoryById[row.category_id] || "–" },
    { key: "duration_minutes", label: "Duration", render: (row) => duration(row.duration_minutes) },
    { key: "price", label: "Price", render: (row) => <span className="font-semibold">{money(row.price, row.currency)}</span> },
    { key: "description", label: "Description", render: (row) => <span className="max-w-xs truncate block text-slate-500">{row.description || "–"}</span> },
    { key: "external_id", label: "Source ID", render: (row) => row.external_id || "–" },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => edit(row)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-fuchsia-50 hover:text-fuchsia-700 hover:border-fuchsia-200">
            Edit
          </button>
          <button onClick={() => api.deleteService(row.id).then(load)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader title="Service Management" description="Manage treatments, consultation pricing, duration, category and status." />

      <section className="mt-5 grid gap-3 md:grid-cols-4">
        {[
          ["1", "Add category first from Categories when needed"],
          ["2", "Add or update service name, slug, duration and price"],
          ["3", "Assign doctors from Staff so booking slots appear"],
          ["4", "Inactive services stay hidden from public booking"],
        ].map(([number, label]) => (
          <div key={number} className="rounded-xl border border-fuchsia-100 bg-white p-4 shadow-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#5b0f4d] to-[#8b1a75] text-sm font-semibold text-white shadow-sm">{number}</span>
            <p className="mt-3 text-sm font-semibold text-slate-800">{label}</p>
          </div>
        ))}
      </section>

      {error && <p className="mt-4 rounded-lg bg-rose-50 border border-rose-100 p-3.5 text-sm text-rose-700">{error}</p>}

      <FormSection
        title={editingId ? `Edit Service #${editingId}` : "Add New Service"}
        onSubmit={save}
        actions={
          <>
            <button className={btnPrimary}>{editingId ? "Update" : "Add"} Service</button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ ...empty, category_id: categories[0]?.id || "" }); }} className={btnSecondary}>
                Cancel
              </button>
            )}
          </>
        }
      >
        <FormField label="Source ID">
          <input placeholder="External ID" value={form.external_id} onChange={(e) => setField("external_id", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Category" required>
          <select required value={form.category_id} onChange={(e) => setField("category_id", e.target.value)} className={inputClass}>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </FormField>
        <FormField label="Service Name" required>
          <input required placeholder="Treatment name" value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Slug" required>
          <input required placeholder="service-slug" value={form.slug} onChange={(e) => setField("slug", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Duration (minutes)">
          <input type="number" min="0" placeholder="30" value={form.duration_minutes} onChange={(e) => setField("duration_minutes", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Price (AED)">
          <input type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={(e) => setField("price", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Image URL">
          <input placeholder="https://example.com/image.jpg" value={form.image} onChange={(e) => setField("image", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Status">
          <select value={form.status} onChange={(e) => setField("status", e.target.value)} className={inputClass}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FormField>
        <div className="md:col-span-2 lg:col-span-3">
          <FormField label="Description">
            <textarea placeholder="Brief description of the service" value={form.description} onChange={(e) => setField("description", e.target.value)} className={`${inputClass} min-h-[5rem]`} />
          </FormField>
        </div>
      </FormSection>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100">
        <FormField label="Filter by Category">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={`${inputClass} max-w-xs`}>
            <option value="">All categories</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </FormField>
      </div>

      <AdminTable columns={columns} data={visibleServices} perPage={10} emptyTitle="No services found" emptyMessage="Add services or run the backend seed command." />
    </AdminShell>
  );
}
