"use client";

import { useState } from "react";
import { formatDate, cn } from "@/lib/utils";
import { Search, ArrowRightLeft } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";

export default function MoveHistoryPage() {
  const { state } = useStore();
  const [search, setSearch] = useState("");
  const [operationType, setOperationType] = useState<"RECEIPT" | "DELIVERY" | "TRANSFER" | "ADJUSTMENT" | undefined>();

  const items = state.ledger
    .filter((e) => !operationType || e.operationType === operationType)
    .filter((e) => !search || e.reference.toLowerCase().includes(search.toLowerCase()) || e.productName.toLowerCase().includes(search.toLowerCase()))
    .map((e) => {
      let fromName = e.fromLocation ? state.locations.find((l) => l.id === e.fromLocation)?.name ?? e.fromLocation : null;
      let toName = e.toLocation ? state.locations.find((l) => l.id === e.toLocation)?.name ?? e.toLocation : null;

      // Fill in virtual locations for missing external ones
      if (!fromName) {
        if (e.operationType === "RECEIPT") fromName = "Vendor Location";
        else if (e.operationType === "ADJUSTMENT") fromName = "Virtual / Adjustment";
      }
      if (!toName) {
        if (e.operationType === "DELIVERY") toName = "Customer Location";
        else if (e.operationType === "ADJUSTMENT") toName = "Virtual / Adjustment";
      }

      return { ...e, fromName, toName };
    });

  const opColors: Record<string, string> = {
    RECEIPT: "bg-emerald-500/20 text-emerald-400",
    DELIVERY: "bg-amber-500/20 text-amber-400",
    TRANSFER: "bg-purple-500/20 text-purple-400",
    ADJUSTMENT: "bg-blue-500/20 text-blue-400",
  };
  const types = ["RECEIPT", "DELIVERY", "TRANSFER", "ADJUSTMENT"] as const;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Move History</h1>
          <p className="text-sm text-slate-400">Immutable stock ledger — all operations logged here</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by reference or product…" className="w-full rounded-lg border border-white/10 bg-[#0f1117] pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setOperationType(undefined)} className={cn("rounded-lg px-4 py-2 text-xs font-medium border transition", !operationType ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-[#0f1117] text-slate-400 border-white/10 hover:border-white/20")}>All</button>
          {types.map((t) => (
            <button key={t} onClick={() => setOperationType(t === operationType ? undefined : t)} className={cn("rounded-lg px-4 py-2 text-xs font-medium border transition", operationType === t ? opColors[t] + " border-current" : "bg-[#0f1117] text-slate-400 border-white/10 hover:border-white/20")}>{t}</button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0f1117] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400">
              <tr>
                {["Date", "Reference", "Operation", "Product", "From", "To", "Quantity", "User"].map((h) => (
                  <th key={h} className="px-6 py-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-500">No stock movements yet.</td></tr>
              ) : (
                items.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-slate-400">{formatDate(entry.createdAt)}</td>
                    <td className="px-6 py-4 font-medium text-indigo-400">{entry.reference}</td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-medium", opColors[entry.operationType])}>{entry.operationType}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-200">{entry.productName}</td>
                    <td className="px-6 py-4 text-slate-400">{entry.fromName ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-400">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="h-3 w-3 text-slate-600" /> {entry.toName ?? "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">{Number(entry.quantity)}</td>
                    <td className="px-6 py-4 text-slate-500">{entry.userLoginId ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
