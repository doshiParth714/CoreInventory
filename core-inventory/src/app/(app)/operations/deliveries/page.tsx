"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDate, cn } from "@/lib/utils";
import { Plus, Search, LayoutList, LayoutGrid } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";

const STATUSES = ["DRAFT", "CONFIRM", "READY", "DONE", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number];

const badgeColor: Record<Status, string> = {
  DRAFT: "bg-slate-500/20 text-slate-400 border-slate-500/20",
  CONFIRM: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  READY: "bg-amber-500/20 text-amber-400 border-amber-500/20",
  DONE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/20",
};

export default function DeliveriesListPage() {
  const router = useRouter();
  const { state, actions } = useStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status | "PENDING" | undefined>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("filter") === "pending") setStatus("PENDING");
    }
  }, []);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  const items = state.pickings
    .filter((p) => p.operationType === "DELIVERY")
    .filter((p) => !search || p.reference.toLowerCase().includes(search.toLowerCase()) || (p.contactName ?? "").toLowerCase().includes(search.toLowerCase()))
    .filter((p) => {
      if (status === "PENDING") return ["DRAFT", "CONFIRM", "READY"].includes(p.status);
      return status === undefined || p.status === status;
    })
    .map((p) => ({
      ...p,
      fromLocation: p.fromLocationId ? state.locations.find((l) => l.id === p.fromLocationId) : null,
    }));

  function handleCreate() {
    const id = actions.createPicking("DELIVERY");
    router.push(`/operations/deliveries/${id}`);
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Deliveries</h1>
          <p className="text-xs text-slate-400 mt-0.5">{items.length} records</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition disabled:opacity-60">
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by reference or contact…" className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition" />
          </div>
          {viewMode === "list" && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-0">
              <button onClick={() => setStatus(undefined)} className={cn("rounded-lg px-3 py-2 text-xs font-medium border transition", !status ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/8")}>All</button>
              <button onClick={() => setStatus(status === "PENDING" ? undefined : "PENDING")} className={cn("rounded-lg px-3 py-2 text-xs font-medium border transition", status === "PENDING" ? "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30" : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/8")}>Pending</button>
              {STATUSES.map((s) => (
                <button key={s} onClick={() => setStatus(s === status ? undefined : s)} className={cn("rounded-lg px-3 py-2 text-xs font-medium border transition", status === s ? badgeColor[s] : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/8")}>{s}</button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10 shrink-0">
          <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded transition", viewMode === "list" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:bg-white/5")}><LayoutList className="h-4 w-4" /></button>
          <button onClick={() => setViewMode("kanban")} className={cn("p-1.5 rounded transition", viewMode === "kanban" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:bg-white/5")}><LayoutGrid className="h-4 w-4" /></button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/3">
              <tr>
                {["Reference", "Delivery Address", "From Location", "Scheduled Date", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No deliveries found.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} onClick={() => router.push(`/operations/deliveries/${item.id}`)} className="cursor-pointer hover:bg-white/5 transition">
                    <td className="px-4 py-3 font-mono text-xs text-indigo-300">{item.reference}</td>
                    <td className="px-4 py-3 text-slate-300">{item.contactName ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-400">{item.fromLocation?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(item.scheduledDate)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", badgeColor[item.status as Status])}>{item.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto py-2 min-h-[500px]">
          {STATUSES.map((colStatus) => (
            <div key={colStatus} className="flex-1 min-w-[280px] flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-semibold text-white">{colStatus}</h3>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", badgeColor[colStatus])}>{items.filter((i) => i.status === colStatus).length}</span>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                {items.filter((i) => i.status === colStatus).map((item) => (
                  <div key={item.id} onClick={() => router.push(`/operations/deliveries/${item.id}`)} className="rounded-lg border border-white/10 bg-white/3 p-4 cursor-pointer hover:bg-white/5 transition space-y-3">
                    <div className="flex justify-between items-start">
                      <p className="font-mono text-sm text-indigo-400 font-medium">{item.reference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white">{item.contactName ?? "—"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.fromLocation?.name ?? "Unknown Location"}</p>
                    </div>
                    <div className="text-xs text-slate-400 pt-3 border-t border-white/10">{formatDate(item.scheduledDate)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
