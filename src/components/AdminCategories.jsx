"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import EmptyState from "@/components/EmptyState";
import { api } from "@/lib/api";

const empty = { external_id: "", name: "", slug: "", description: "", status: "active" };

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setItems(await api.categories(true));
  }

  useEffect(() => {
    api.categories(true).then(setItems).catch((err) => setError(err.message));
  }, []);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    try {
      const payload = { ...form, external_id: form.external_id ? Number(form.external_id) : null };
      if (editingId) await api.updateCategory(editingId, payload);
      else await api.createCategory(payload);
      setForm(empty);
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
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      status: item.status,
    });
  }

  return (
    <AdminShell>
      <AdminPageHeader title="Category Management" description="Create, edit, disable and organize Royal Dutch service categories." />
      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <form onSubmit={save} className="mt-5 grid gap-3 soft-card rounded-lg p-5 md:grid-cols-5">
        <input placeholder="Source ID" value={form.external_id} onChange={(e) => setField("external_id", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <input required placeholder="Name" value={form.name} onChange={(e) => setField("name", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <input required placeholder="Slug" value={form.slug} onChange={(e) => setField("slug", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
        <select value={form.status} onChange={(e) => setField("status", e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="rounded-md bg-fuchsia-800 px-4 py-2 text-sm font-semibold text-white">{editingId ? "Update" : "Add"} Category</button>
        {editingId ? (
          <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold md:col-span-5">
            Cancel Edit
          </button>
        ) : null}
      </form>
      <div className="mt-5 grid gap-3">
        {items.length === 0 ? <EmptyState title="No categories found" message="Add the first category to start building the booking catalog." /> : null}
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-slate-500">{item.slug} - source {item.external_id || "-"} - {item.status}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => edit(item)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Edit</button>
              <button onClick={() => api.deleteCategory(item.id).then(load)} className="rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-700">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
