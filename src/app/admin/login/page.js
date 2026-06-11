"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAdminToken } from "@/lib/api";
import { Mail, Lock, ShieldAlert, Sparkles, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@royaldutch.ae");
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
    <main className="flex min-h-screen items-center justify-center luxury-mesh-bg px-4 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />
      <div className="absolute left-10 bottom-10 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <form
        onSubmit={login}
        className="w-full max-w-md bg-[#24061f]/85 backdrop-blur-xl rounded-2xl p-8 shadow-[0_24px_70px_rgba(0,0,0,0.55)] relative border border-white/10"
      >
        <div className="text-center pb-6 border-b border-white/10">
          <p className="royal-logo-text block text-3xl font-bold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 to-white">
            Royal Dutch
          </p>
          <p className="mt-1.5 block text-[9px] font-bold uppercase tracking-[0.25em] text-fuchsia-300">
            Medical Centre
          </p>
        </div>

        <div className="mt-8 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-fuchsia-200 border border-white/5">
            <Sparkles size={11} className="text-amber-300" />
            Operations Portal
          </span>
          <h1 className="mt-3 text-xl font-bold font-serif text-white">Sign in to workspace</h1>
          <p className="mt-1 text-xs text-fuchsia-200/50">Manage booking flows, invoices, and SMTP queues</p>
        </div>

        {error ? (
          <div className="mt-5 rounded-xl bg-rose-950/40 border border-rose-900/50 p-4 text-xs text-rose-200 flex items-center gap-2">
            <ShieldAlert size={15} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          <div className="relative flex items-center">
            <Mail size={14} className="absolute left-4 text-fuchsia-300/40" />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="pl-10 pr-4 py-3.5 w-full text-xs font-semibold bg-white/5 text-black border border-white/10 rounded-xl focus:border-fuchsia-400 focus:bg-white/10 placeholder-fuchsia-300/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-200 [&:-webkit-autofill]:bg-[#24061f] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]"
              placeholder="Email address"
            />
          </div>

          <div className="relative flex items-center">
            <Lock size={14} className="absolute left-4 text-fuchsia-300/40" />
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pl-10 pr-4 py-3.5 w-full text-xs font-semibold bg-white/5 text-black border border-white/10 rounded-xl focus:border-fuchsia-400 focus:bg-white/10 placeholder-fuchsia-300/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 transition-all duration-200 [&:-webkit-autofill]:bg-[#24061f] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]"
              placeholder="Password"
            />
          </div>

          <button className="w-full btn-premium-primary py-3.5 mt-2 bg-gradient-to-r from-fuchsia-400 to-[#a2258d] text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-black/20">
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
        </div>
      </form>
    </main>
  );
}
