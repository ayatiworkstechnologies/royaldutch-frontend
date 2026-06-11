"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminShell from "@/components/AdminShell";
import AdminTable from "@/components/AdminTable";
import FormSection, { FormField, inputClass, btnPrimary, btnSecondary } from "@/components/FormSection";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import { api } from "@/lib/api";

const empty = { external_id: "", name: "", slug: "", description: "", status: "active" };

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setItems(await api.categories(true));
  }

  useEffect(() => {
    api.categories(true).then(setItems).catch((err) => setError(err.message));
  }, []);

  function setField(field, value) {
    setForm((c) => ({ ...c, [field]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, external_id: form.external_id ? Number(form.external_id) : null };
      if (editingId) await api.updateCategory(editingId, payload);
      else await api.createCategory(payload);
      setForm(empty);
      setEditingId(null);
      setIsModalOpen(false);
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
    setIsModalOpen(true);
  }

  const columns = [
    { key: "name", label: "Name", render: (row) => <span className="font-semibold text-slate-900">{row.name}</span> },
    { key: "slug", label: "Slug", render: (row) => <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{row.slug}</code> },
    { key: "external_id", label: "Source ID", render: (row) => row.external_id || "–" },
    { key: "description", label: "Description", render: (row) => <span className="max-w-xs truncate block">{row.description || "–"}</span> },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => edit(row)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-fuchsia-50 hover:text-fuchsia-700 hover:border-fuchsia-200">
            Edit
          </button>
          <button onClick={() => api.deleteCategory(row.id).then(load)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Category Management"
        description="Create, edit, disable and organize Royal Dutch service categories."
        action={
          <button
            onClick={() => {
              setEditingId(null);
              setForm(empty);
              setIsModalOpen(true);
            }}
            className={btnPrimary}
          >
            Add Category
          </button>
        }
      />
      {error && <p className="mt-4 rounded-lg bg-rose-50 border border-rose-100 p-3.5 text-sm text-rose-700">{error}</p>}

      {/* Modal containing the Category form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setForm(empty);
        }}
        title={editingId ? `Edit Category #${editingId}` : "Add New Category"}
      >
        <form onSubmit={save} className="space-y-4">
          <FormField label="Source ID">
            <input
              placeholder="External ID"
              value={form.external_id}
              onChange={(e) => setField("external_id", e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Name" required>
            <input
              required
              placeholder="Category name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Slug" required>
            <input
              required
              placeholder="category-slug"
              value={form.slug}
              onChange={(e) => setField("slug", e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Description">
            <input
              placeholder="Brief description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Status">
            <select
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
              className={inputClass}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <button className={btnPrimary}>
              {editingId ? "Update" : "Add"} Category
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingId(null);
                setForm(empty);
              }}
              className={btnSecondary}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <AdminTable
        columns={columns}
        data={items}
        perPage={10}
        emptyTitle="No categories found"
        emptyMessage="Add the first category to start building the booking catalog."
      />
    </AdminShell>
  );
}
