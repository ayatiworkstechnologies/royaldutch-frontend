"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAdminToken } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@clinicflow.local");
  const [password, setPassword] = useState("Admin@12345");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      setAdminToken(data.access_token);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#5b0f4d] px-4">
      <form onSubmit={login} className="w-full max-w-md rounded-lg border border-white/15 bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="text-center">
          <p className="royal-logo-text text-3xl font-bold leading-none">Royal Dutch</p>
          <p className="royal-logo-text mt-1 text-xs font-semibold uppercase tracking-[0.18em]">Medical Centre</p>
        </div>
        <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-fuchsia-800">Admin Portal</p>
        <h1 className="mt-2 text-2xl font-semibold">Sign in to manage clinic operations</h1>
        {error ? <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
        <div className="mt-6 space-y-4">
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-md border border-slate-300 px-3" placeholder="Email" />
          <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-md border border-slate-300 px-3" placeholder="Password" />
          <button className="h-11 w-full rounded-md bg-[#5b0f4d] text-sm font-semibold text-white hover:bg-[#4a0b3d]">
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>
      </form>
    </main>
  );
}
