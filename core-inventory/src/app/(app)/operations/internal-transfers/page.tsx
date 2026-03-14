"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Plus, Search, FileDown, AppWindow, List as ListIcon } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { useRouter } from "next/navigation";

const STATUSES = ["DRAFT", "CONFIRM", "READY", "DONE", "CANCELLED"] as const;

export default function TransfersListPage() {
  const router = useRouter();
  const { state, actions } = useStore();
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("filter") === "pending") setStatusFilter("PENDING");
    }
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  const items = state.pickings
    .filter((p) => p.operationType === "TRANSFER")
    .filter((p) => !searchQuery || p.reference.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((p) => {
      if (statusFilter === "PENDING") return ["DRAFT", "CONFIRM", "READY"].includes(p.status);
      return !statusFilter || p.status === statusFilter;
    })
    .map((p) => ({
      ...p,
      fromLocation: p.fromLocationId ? state.locations.find((l) => l.id === p.fromLocationId) : null,
      toLocation: p.toLocationId ? state.locations.find((l) => l.id === p.toLocationId) : null,
    }));

  function handleCreate() {
    const id = actions.createPicking("TRANSFER");
    router.push(`/operations/internal-transfers/${id}`);
  }

  function badgeColor(status: string) {
    switch (status) {
      case "DRAFT": return "bg-slate-500/20 text-slate-400";
      case "CONFIRM": return "bg-blue-500/20 text-blue-400";
      case "READY": return "bg-amber-500/20 text-amber-400";
      case "DONE": return "bg-emerald-500/20 text-emerald-400";
      case "CANCELLED": return "bg-red-500/20 text-red-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Internal Transfers</h1>
          <p className="text-sm text-slate-400">Manage stock movements between your locations</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"><FileDown className="h-4 w-4" /> Export</button>
          <button onClick={handleCreate} className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 transition"><Plus className="h-4 w-4" /> New Transfer</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search transfers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0f1117] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition">
              <option value="">All Statuses</option>
              <option value="PENDING">Pending (Active)</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex border border-white/10 rounded-lg p-1 bg-[#0f1117]">
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`} title="List View"><ListIcon className="h-4 w-4" /></button>
            <button onClick={() => setViewMode("kanban")} className={`p-1.5 rounded-md transition ${viewMode === "kanban" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`} title="Kanban Board"><AppWindow className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="rounded-xl border border-white/10 bg-[#0f1117] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Reference</th>
                  <th className="px-6 py-4 font-medium">From</th>
                  <th className="px-6 py-4 font-medium">To</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No transfers found.</td></tr>
                )}
                {items.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-white/5 transition group">
                    <td className="px-6 py-4">
                      <Link href={`/operations/internal-transfers/${transfer.id}`} className="font-medium text-emerald-400 hover:text-emerald-300 transition">{transfer.reference}</Link>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{transfer.fromLocation?.name || "—"}</td>
                    <td className="px-6 py-4 text-slate-300">{transfer.toLocation?.name || "—"}</td>
                    <td className="px-6 py-4 text-slate-400">{transfer.createdAt ? format(new Date(transfer.createdAt), "MMM d, yyyy") : "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${badgeColor(transfer.status)}`}>{transfer.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {STATUSES.map((status) => {
            const statusItems = items.filter((item) => item.status === status);
            if (statusFilter && statusFilter !== status) return null;
            return (
              <div key={status} className="flex-shrink-0 w-80 bg-white/5 rounded-xl border border-white/10 p-4 snap-start">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-white flex items-center gap-2">{status}</h3>
                  <span className="text-xs font-medium text-slate-500 bg-black/20 px-2 py-1 rounded-full">{statusItems.length}</span>
                </div>
                <div className="space-y-3">
                  {statusItems.map((transfer) => (
                    <Link key={transfer.id} href={`/operations/internal-transfers/${transfer.id}`} className="block bg-[#0f1117] border border-white/5 rounded-lg p-4 hover:border-white/20 transition group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-emerald-400 group-hover:text-emerald-300 transition">{transfer.reference}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-3 flex items-center justify-between">
                        <span>{transfer.fromLocation?.name?.split(" ")[0] || "—"}</span>
                        <span>→</span>
                        <span>{transfer.toLocation?.name?.split(" ")[0] || "—"}</span>
                      </div>
                    </Link>
                  ))}
                  {statusItems.length === 0 && <div className="text-center p-4 border border-dashed border-white/10 rounded-lg text-slate-500 text-sm">No transfers</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
