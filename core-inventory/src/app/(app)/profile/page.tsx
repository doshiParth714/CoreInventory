"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Hash, ShieldCheck, KeyRound, Pencil, Check, X } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ email: user?.email || "", loginId: user?.loginId || "" });
  const [error, setError] = useState("");

  if (!user) return <div className="p-6 text-slate-400">Loading profile...</div>;

  async function handleSave() {
    setError("");
    if (!form.email || !form.loginId) {
      setError("Fields cannot be empty");
      return;
    }
    const res = await updateUser(form);
    if (!res?.ok) {
      setError(res?.error || "Failed to update profile");
      return;
    }
    setIsEditing(false);
  }

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">My Profile</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage your personal account details</p>
        </div>
        {!isEditing && (
          <button onClick={() => { setIsEditing(true); setForm({ email: user.email, loginId: user.loginId }); }} className="flex items-center gap-2 rounded-lg bg-indigo-500/10 text-indigo-400 px-4 py-2 text-sm font-semibold hover:bg-indigo-500/20 transition">
            <Pencil className="h-4 w-4" /> Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User identification */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-2">Account Details</h2>
          <div className="rounded-xl border border-white/10 bg-white/3 p-5 shadow-sm space-y-6 flex flex-col items-center sm:items-start sm:flex-row gap-6">
            <div className="h-20 w-20 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <User className="h-10 w-10 text-indigo-400" />
            </div>
            
            <div className="flex-1 space-y-3 w-full">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5"><Mail className="h-3 w-3" /> Email Address</p>
                {isEditing ? (
                  <input className="w-full text-sm font-medium text-white bg-[#0f1117] px-3 py-2 rounded-lg border border-indigo-500/50 outline-none" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                ) : (
                  <p className="text-sm font-medium text-white bg-[#0f1117] px-3 py-2 rounded-lg border border-white/5">{user.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5"><Hash className="h-3 w-3" /> Login ID / Username</p>
                {isEditing ? (
                  <input className="w-full text-sm font-medium text-slate-300 font-mono bg-[#0f1117] px-3 py-2 rounded-lg border border-indigo-500/50 outline-none" value={form.loginId} onChange={(e) => setForm({ ...form, loginId: e.target.value })} />
                ) : (
                  <p className="text-sm font-medium text-slate-300 font-mono bg-[#0f1117] px-3 py-2 rounded-lg border border-white/5">{user.loginId}</p>
                )}
              </div>
              
              {isEditing && (
                <div className="pt-2 flex items-center gap-2">
                  <button onClick={handleSave} className="flex-1 flex justify-center items-center gap-2 bg-indigo-500 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-indigo-600 transition">
                    <Check className="h-4 w-4" /> Save
                  </button>
                  <button onClick={() => { setIsEditing(false); setError(""); }} className="flex-1 flex justify-center items-center gap-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/10 transition">
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              )}
              {error && isEditing && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>
          </div>
        </section>

        {/* Security & Roles */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white border-b border-white/10 pb-2">Security & Roles</h2>
          
          <div className="rounded-xl border border-white/10 bg-white/3 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">System Administrator</p>
                <p className="text-xs text-slate-400">Full read/write permissions</p>
              </div>
            </div>
            
            <div className="h-px bg-white/10 w-full" />

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-slate-500/10 border border-white/10 flex items-center justify-center">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Password</p>
                  <p className="text-xs text-slate-400 tracking-widest">••••••••</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
