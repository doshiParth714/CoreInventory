"use client";

import { use, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, XCircle, Package, Plus } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AdjustmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { state, actions } = useStore();
  const { user } = useAuth();
  const [newProductId, setNewProductId] = useState("");
  const [newQty, setNewQty] = useState("");

  const data = actions.getAdjustment(id);
  const productsData = state.products;

  if (!data) return <div className="p-6 text-slate-400">Adjustment not found.</div>;

  const linesWithProduct = data.lines.map((line) => ({
    ...line,
    product: state.products.find((p) => p.id === line.productId),
  }));

  function getExpectedQty(productId: string) {
    if (!data) return 0;
    const stock = state.productStocks.find((s) => s.productId === productId && s.locationId === data.locationId);
    return stock?.onHand ?? 0;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/operations/adjustments" className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">{data.reference}</h1>
            <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${
              data.status === "DRAFT" ? "bg-slate-500/20 text-slate-400" :
              data.status === "DONE" ? "bg-emerald-500/20 text-emerald-400" :
              "bg-red-500/20 text-red-400"
            }`}>{data.status}</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Inventory Adjustment</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {data.status === "DRAFT" && (
            <>
              <button onClick={() => { actions.cancelAdjustment(id); router.push("/operations/adjustments"); }} className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition">
                <XCircle className="h-4 w-4 inline-block mr-2" /> Cancel
              </button>
              <button onClick={() => user && actions.applyAdjustment(id, user.loginId)} className="px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition">
                Apply Count
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f1117] border border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-4">
            <Package className="h-4 w-4" /> Adjustment Details
          </h3>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div className="text-slate-500">Location</div>
            <div className="text-slate-200">{data.location?.name || "—"}</div>
            <div className="text-slate-500">Notes</div>
            <div className="text-slate-200">{data.notes || "—"}</div>
            <div className="text-slate-500">Responsible</div>
            <div className="text-slate-200">—</div>
          </div>
        </div>

        <div className="bg-[#0f1117] border border-white/10 rounded-xl p-6">
          <div className="flex justify-between mb-8 relative">
            {(["DRAFT", "DONE"] as const).map((step, idx) => {
              const currentIdx = data.status === "DONE" ? 1 : 0;
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div key={step} className="flex flex-col items-center gap-2 bg-[#0f1117] px-2 w-[50%]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                    isPast ? "bg-emerald-500 border-emerald-500 text-white" :
                    isCurrent ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" :
                    "bg-white/5 border-white/10 text-slate-500"
                  }`}>{idx + 1}</div>
                  <span className={`text-xs font-medium ${isCurrent ? "text-indigo-400" : isPast ? "text-slate-300" : "text-slate-500"}`}>
                    {step === "DRAFT" ? "IN PROGRESS" : step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-[#0f1117] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-medium text-white flex items-center gap-2">
            <Package className="h-4 w-4 text-slate-400" /> Count Lines
          </h3>
        </div>
        <div className="p-6">
          <div className="rounded-lg border border-white/10 overflow-hidden bg-[#0f1117]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Expected Qty</th>
                  <th className="px-4 py-3 font-medium">Counted Qty</th>
                  <th className="px-4 py-3 font-medium text-right">Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {linesWithProduct.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No counted lines.</td></tr>
                ) : (
                  linesWithProduct.map((line) => {
                    const diff = Number(line.diffQty);
                    return (
                      <tr key={line.id} className="hover:bg-white/5 transition">
                        <td className="px-4 py-2.5 text-slate-200">
                          {line.product?.name}
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{line.product?.sku}</div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-300">{Number(line.expectedQty)}</td>
                        <td className="px-4 py-2.5">
                          {data.status === "DRAFT" ? (
                            <input
                              type="number"
                              min={0}
                              step={1}
                              className="w-16 rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-emerald-400 outline-none focus:border-indigo-500 transition"
                              value={line.countedQty}
                              onChange={(e) => actions.updateAdjustmentLineCounted(line.id, Number(e.target.value))}
                            />
                          ) : (
                            <span className="text-white font-medium">{Number(line.countedQty)}</span>
                          )}
                        </td>
                        <td className={`px-4 py-2.5 text-right font-medium ${diff === 0 ? "text-slate-400" : diff > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {data.status === "DRAFT" && (
            <div className="mt-4 flex items-end gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-1">
                <label className="text-xs text-slate-400">Product</label>
                <select value={newProductId} onChange={(e) => setNewProductId(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition">
                  <option value="">Select product…</option>
                  {productsData.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              <div className="w-28 space-y-1">
                <label className="text-xs text-slate-400">Count</label>
                <input type="number" min={0} value={newQty} onChange={(e) => setNewQty(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition" placeholder="Qty" />
              </div>
              <button
                onClick={() => {
                  if (newProductId && newQty !== "") {
                    const expected = getExpectedQty(newProductId);
                    actions.addAdjustmentLine(id, newProductId, expected, Number(newQty));
                    setNewProductId("");
                    setNewQty("");
                  }
                }}
                disabled={!newProductId || newQty === "" || isNaN(Number(newQty))}
                className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
