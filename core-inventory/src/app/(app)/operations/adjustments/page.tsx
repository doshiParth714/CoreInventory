"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Plus, Search, FileDown, AppWindow, List as ListIcon, Pencil, Check, X } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { useRouter } from "next/navigation";

const STATUSES = ["DRAFT", "DONE", "CANCELLED"] as const;

export default function AdjustmentsListPage() {
  const router = useRouter();
  const { state, actions } = useStore();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ notes: "", locationId: "", scheduledDate: "" });

  const mainLocation = state.locations[0];

  const items = state.adjustments
    .filter((a) => !searchQuery || a.reference.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((a) => !statusFilter || a.status === statusFilter)
    .map((a) => ({ ...a, location: state.locations.find((l) => l.id === a.locationId) }));

  function handleCreate() {
    if (!mainLocation) return;
    const id = actions.createAdjustment(mainLocation.id, "Routine Stock Count");
    router.push(`/operations/adjustments/${id}`);
  }

  function startEdit(adj: typeof items[0]) {
    setEditingId(adj.id);
    setEditForm({
      notes: adj.notes ?? "",
      locationId: adj.locationId,
      scheduledDate: adj.scheduledDate ? adj.scheduledDate.slice(0, 10) : "",
    });
  }

  function saveEdit(id: string) {
    actions.updateAdjustment(id, {
      notes: editForm.notes || null,
      locationId: editForm.locationId,
      scheduledDate: editForm.scheduledDate ? new Date(editForm.scheduledDate).toISOString() : null,
    });
    setEditingId(null);
  }

  function badgeColor(status: string) {
    switch (status) {
      case "DRAFT": return "bg-slate-500/20 text-slate-400";
      case "DONE": return "bg-emerald-500/20 text-emerald-400";
      case "CANCELLED": return "bg-red-500/20 text-red-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  }

  const inputCls = "bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-indigo-500 transition";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Inventory Adjustments</h1>
          <p className="text-sm text-slate-400">Manage cycle counts and stock corrections</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"><FileDown className="h-4 w-4" /> Export</button>
          <button onClick={handleCreate} disabled={!mainLocation} className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 transition disabled:opacity-50"><Plus className="h-4 w-4" /> New Count</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search adjustments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0f1117] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition">
              <option value="">All Statuses</option>
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
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Notes</th>
                  <th className="px-6 py-4 font-medium">Date Created</th>
                  <th className="px-6 py-4 font-medium">Scheduled Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No adjustments found.</td></tr>
                )}
                {items.map((adj) => (
                  <tr key={adj.id} className="hover:bg-white/5 transition group">
                    {editingId === adj.id ? (
                      <>
                        <td className="px-6 py-3">
                          <span className="font-medium text-emerald-400">{adj.reference}</span>
                        </td>
                        <td className="px-6 py-3">
                          <select
                            value={editForm.locationId}
                            onChange={(e) => setEditForm({ ...editForm, locationId: e.target.value })}
                            className={inputCls}
                          >
                            {state.locations.map((l) => (
                              <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-3">
                          <input
                            value={editForm.notes}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            className={`${inputCls} min-w-[160px]`}
                            placeholder="Notes…"
                          />
                        </td>
                        <td className="px-6 py-3 text-slate-400">
                          {adj.createdAt ? format(new Date(adj.createdAt), "dd MMM yyyy") : "—"}
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="date"
                            value={editForm.scheduledDate}
                            onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                            className={`${inputCls} [color-scheme:dark]`}
                          />
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${badgeColor(adj.status)}`}>{adj.status}</span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => saveEdit(adj.id)} className="text-emerald-400 hover:bg-emerald-500/10 p-1.5 rounded-lg transition"><Check className="h-4 w-4" /></button>
                            <button onClick={() => setEditingId(null)} className="text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition"><X className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <Link href={`/operations/adjustments/${adj.id}`} className="font-medium text-emerald-400 hover:text-emerald-300 transition">{adj.reference}</Link>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{adj.location?.name || "—"}</td>
                        <td className="px-6 py-4 text-slate-300">{adj.notes || "—"}</td>
                        <td className="px-6 py-4 text-slate-400">
                          {adj.createdAt ? format(new Date(adj.createdAt), "dd MMM yyyy") : "—"}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {adj.scheduledDate ? format(new Date(adj.scheduledDate), "dd MMM yyyy") : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${badgeColor(adj.status)}`}>{adj.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => startEdit(adj)}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </td>
                      </>
                    )}
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
                  {statusItems.map((adj) => (
                    <Link key={adj.id} href={`/operations/adjustments/${adj.id}`} className="block bg-[#0f1117] border border-white/5 rounded-lg p-4 hover:border-white/20 transition group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-emerald-400 group-hover:text-emerald-300 transition">{adj.reference}</span>
                        <button
                          onClick={(e) => { e.preventDefault(); startEdit(adj); }}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white p-1 rounded transition"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{adj.notes || "—"}</p>
                      <div className="text-xs text-slate-400 flex items-center justify-between">
                        <span>{adj.location?.name || "—"}</span>
                        <span>{adj.createdAt ? format(new Date(adj.createdAt), "dd MMM yyyy") : "—"}</span>
                      </div>
                    </Link>
                  ))}
                  {statusItems.length === 0 && <div className="text-center p-4 border border-dashed border-white/10 rounded-lg text-slate-500 text-sm">No counts</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
