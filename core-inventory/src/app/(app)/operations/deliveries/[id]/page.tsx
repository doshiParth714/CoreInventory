"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, cn } from "@/lib/utils";
import { Printer, X, CheckCircle, ChevronLeft, Plus } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";

const STATUS_STEPS = ["DRAFT", "CONFIRM", "READY", "DONE"];
const badgeColor: Record<string, string> = {
  DRAFT: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  CONFIRM: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  READY: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  DONE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { state, actions } = useStore();
  const { user } = useAuth();
  const [newProductId, setNewProductId] = useState("");
  const [newQty, setNewQty] = useState("");

  const data = actions.getPicking(id);
  const productsData = state.products;

  if (!data) return <div className="p-6 text-slate-400">Delivery not found.</div>;

  const step = STATUS_STEPS.indexOf(data.status);
  const isDone = data.status === "DONE";
  const isCancelled = data.status === "CANCELLED";

  function handleAction() {
    if (!data) return;
    if (data.status === "DRAFT") actions.updatePickingStatus(id, "CONFIRM");
    else if (data.status === "CONFIRM") actions.updatePickingStatus(id, "READY");
    else if (data.status === "READY" && user) actions.applyDelivery(id, user.loginId);
  }

  const actionLabel = data.status === "DRAFT" ? "Confirm" : data.status === "CONFIRM" ? "Set Ready" : data.status === "READY" ? "Validate" : null;

  const linesWithProduct = data.lines.map((line) => ({
    ...line,
    product: state.products.find((p) => p.id === line.productId),
  }));

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-white transition"><ChevronLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white font-mono">{data.reference}</h1>
            <span className={cn("text-xs px-2.5 py-0.5 rounded-full border font-medium", badgeColor[data.status])}>{data.status}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Delivery · Outgoing Goods</p>
        </div>
        <div className="flex items-center gap-2">
          {!isDone && !isCancelled && (
            <button onClick={() => actions.cancelPicking(id)} className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition">
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          )}
          <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 transition">
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          {actionLabel && (
            <button onClick={handleAction} className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400 transition">
              <CheckCircle className="h-3.5 w-3.5" /> {actionLabel}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {STATUS_STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border", i <= step ? "bg-indigo-500 border-indigo-400 text-white" : "bg-white/5 border-white/10 text-slate-500")}>{i + 1}</div>
            <span className={cn("text-xs font-medium", i <= step ? "text-white" : "text-slate-500")}>{s}</span>
            {i < STATUS_STEPS.length - 1 && <div className={cn("h-px w-8", i < step ? "bg-indigo-400" : "bg-white/10")} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Delivery Address", value: data.contactName ?? "—" },
          { label: "Responsible", value: "—" },
          { label: "Scheduled Date", value: formatDate(data.scheduledDate) },
          { label: "Operation", value: "Delivery" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/3 px-4 py-3">
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Products</h2>
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/3">
              <tr>
                {["Product", "SKU", "Demand Qty", "Done Qty"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {linesWithProduct.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No product lines. Add one below.</td></tr>
              ) : (
                linesWithProduct.map((line) => (
                  <tr key={line.id}>
                    <td className="px-4 py-2.5 text-slate-200">{line.product?.name ?? "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{line.product?.sku ?? "—"}</td>
                    <td className="px-4 py-2.5 text-slate-300">{Number(line.demandQty)}</td>
                    <td className="px-4 py-2.5">
                      {data.status === "READY" || data.status === "DRAFT" ? (
                        <input
                          type="number"
                          min={0}
                          step={1}
                          className="w-16 rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-emerald-400 outline-none focus:border-indigo-500 transition"
                          value={line.doneQty !== undefined ? Number(line.doneQty) : Number(line.demandQty)}
                          onChange={(e) => actions.updateMoveLineDoneQty(line.id, Number(e.target.value))}
                        />
                      ) : (
                        <span className="text-emerald-400 font-medium">{line.doneQty ?? line.demandQty}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isDone && !isCancelled && (
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-slate-400">Product</label>
              <select value={newProductId} onChange={(e) => setNewProductId(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition">
                <option value="">Select product…</option>
                {productsData.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div className="w-28 space-y-1">
              <label className="text-xs text-slate-400">Quantity</label>
              <input type="number" min={1} value={newQty} onChange={(e) => setNewQty(e.target.value)} placeholder="Qty" className="w-full rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition" />
            </div>
            <button
              onClick={() => {
                if (newProductId && newQty) {
                  actions.addMoveLine(id, newProductId, Number(newQty), data.fromLocationId ?? undefined);
                  setNewProductId("");
                  setNewQty("");
                }
              }}
              disabled={!newProductId || !newQty}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
