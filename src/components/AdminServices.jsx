"use client";

import { useEffect, useMemo, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import EmptyState from "@/components/EmptyState";
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
    if (!form.category_id && categoryData[0]) setForm((current) => ({ ...current, category_id: categoryData[0].id }));
  }

  useEffect(() => {
    Promise.all([api.categories(true), api.services("", true)])
      .then(([categoryData, serviceData]) => {
        setCategories(categoryData);
        setServices(serviceData);
        if (categoryData[0]) setForm((current) => ({ ...current, category_id: current.category_id || categoryData[0].id }));
      })
      .catch((err) => setError(err.message));
  }, []);

  const categoryById = useMemo(() => Object.fromEntries(categories.map((item) => [item.id, item.name])), [categories]);
  const visibleServices = categoryFilter ? services.filter((item) => String(item.category_id) === categoryFilter) : services;

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function payload() {
    return {
      ...form,
      external_id: form.external_id ? Number(form.external_id) : null,
      category_id: Number(form.category_id),
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      price: form.price === "" ? null : Number(form.price),
    };
  }

  async function save(event) {
    event.preventDefault();
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
      status: item.status,
    });
  }

  return (
    <AdminShell>
      <AdminPageHeader title="Service Management" description="Manage treatments, consultation pricing, duration, category and status." />
      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <form onSubmit={save} className="mt-5 grid gap-3 soft-card rounded-lg p-5 md:grid-cols-4">
        <input placeholder="Source ID" value={form.external_id} onChange={(e) => setField("external_id", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <select required value={form.category_id} onChange={(e) => setField("category_id", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <input required placeholder="Service Name" value={form.name} onChange={(e) => setField("name", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <input required placeholder="Slug" value={form.slug} onChange={(e) => setField("slug", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <input placeholder="Duration minutes" value={form.duration_minutes} onChange={(e) => setField("duration_minutes", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <input placeholder="Price" value={form.price} onChange={(e) => setField("price", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <select value={form.status} onChange={(e) => setField("status", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="rounded-md bg-fuchsia-800 px-4 py-2 text-sm font-semibold text-white">{editingId ? "Update" : "Add"} Service</button>
        {editingId ? (
          <button type="button" onClick={() => { setEditingId(null); setForm({ ...empty, category_id: categories[0]?.id || "" }); }} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold md:col-span-4">
            Cancel Edit
          </button>
        ) : null}
      </form>

      <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="">All categories</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </div>

      <div className="mt-5 grid gap-3">
        {visibleServices.length === 0 ? <EmptyState title="No services found" message="Add services or run the backend seed command." /> : null}
        {visibleServices.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-slate-500">
                {categoryById[item.category_id] || "Category"} - {duration(item.duration_minutes)} - {money(item.price, item.currency)} - source {item.external_id || "-"} - {item.status}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => edit(item)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Edit</button>
              <button onClick={() => api.deleteService(item.id).then(load)} className="rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-700">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
