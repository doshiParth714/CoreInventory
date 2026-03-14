"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [newPw, setNewPw] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await resetPassword(email, newPw);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to reset.");
      return;
    }
    setMessage("Password updated. You can now sign in.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#06080c] relative overflow-hidden">
      <div className="w-full max-w-sm space-y-8 px-4">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-white">Reset Password</h1>
            <p className="mt-1 text-sm text-slate-400">Enter your email and new password</p>
          </div>
        </div>

        {message && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-400 text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">New Password</label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              minLength={8}
              placeholder="Min 8 chars"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 transition disabled:opacity-60"
          >
            {loading ? "Updating…" : "Set Password"}
          </button>
        </form>

        <div className="flex justify-center">
          <Link href="/login" className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-400 transition">
            <ArrowLeft className="h-3 w-3" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
