"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FloatingBoxes from "@/components/animations/FloatingBoxes";
import Logo from "@/components/Logo";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [emailOrLoginId, setEmailOrLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(emailOrLoginId, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Invalid Login Id or Password");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#06080c] relative overflow-hidden">
      <FloatingBoxes />
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-[#0f111a]/80 backdrop-blur-xl p-10 border border-white/10 relative z-10">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-white">Sign in</h1>
            <p className="mt-1 text-sm text-slate-400">Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email / Login ID</label>
            <input
              type="text"
              value={emailOrLoginId}
              onChange={(e) => setEmailOrLoginId(e.target.value)}
              required
              placeholder="you@example.com or user123"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pr-10 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 active:bg-indigo-600 transition disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link href="/forgot-password" className="hover:text-indigo-400 transition">Forgot Password?</Link>
          <span>·</span>
          <Link href="/signup" className="hover:text-indigo-400 transition">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
