"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/api";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.patients().then(setPatients).catch((err) => setError(err.message));
  }, []);

  return (
    <AdminShell>
      <h2 className="text-xl font-semibold">Patient Management</h2>
      {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="admin-table min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>{["Name", "Phone", "Email", "Gender", "Age", "Created"].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td className="px-4 py-3 font-semibold">{patient.full_name}</td>
                <td className="px-4 py-3">{patient.phone}</td>
                <td className="px-4 py-3">{patient.email || "-"}</td>
                <td className="px-4 py-3">{patient.gender || "-"}</td>
                <td className="px-4 py-3">{patient.age || "-"}</td>
                <td className="px-4 py-3">{patient.created_at?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
