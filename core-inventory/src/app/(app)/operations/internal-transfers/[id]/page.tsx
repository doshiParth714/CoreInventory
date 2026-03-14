"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, XCircle, CheckCircle, Plus } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";

export default function TransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { state, actions } = useStore();
  const { user } = useAuth();
  const [newProductId, setNewProductId] = useState("");
  const [newQty, setNewQty] = useState("");

  const data = actions.getPicking(id);
  const productsData = state.products;

  if (!data) return <div className="p-6 text-slate-400">Transfer not found.</div>;

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

  const linesWithProduct = data.lines.map((line) => ({
    ...line,
    product: state.products.find((p) => p.id === line.productId),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/operations/internal-transfers" className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">{data.reference}</h1>
            <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${badgeColor(data.status)}`}>{data.status}</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Internal Transfer</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {data.status === "DRAFT" && (
            <>
              <button onClick={() => { actions.cancelPicking(id); router.push("/operations/internal-transfers"); }} className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition">
                <XCircle className="h-4 w-4 inline-block mr-2" /> Cancel
              </button>
              <button onClick={() => actions.updatePickingStatus(id, "CONFIRM")} className="px-4 py-2 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                Confirm
              </button>
            </>
          )}
          {data.status === "CONFIRM" && (
            <button onClick={() => actions.updatePickingStatus(id, "READY")} className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">
              Set Ready
            </button>
          )}
          {data.status === "READY" && user && (
            <button onClick={() => { actions.applyTransfer(id, user.loginId); router.push("/operations/internal-transfers"); }} className="px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition">
              <CheckCircle className="h-4 w-4 inline-block mr-2" /> Validate
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f1117] border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-2">From</h3>
          <p className="text-white">{data.fromLocation?.name ?? "—"}</p>
        </div>
        <div className="bg-[#0f1117] border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-2">To</h3>
          <p className="text-white">{data.toLocation?.name ?? "—"}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 bg-white/3">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase">Product</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase">Demand</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase">Done</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {linesWithProduct.map((line) => (
              <tr key={line.id}>
                <td className="px-4 py-2.5 text-white">{line.product?.name ?? "—"}</td>
                <td className="px-4 py-2.5 text-slate-400">{Number(line.demandQty)}</td>
                <td className="px-4 py-2.5">
                  {data.status === "DRAFT" || data.status === "CONFIRM" || data.status === "READY" ? (
                    <input
                      type="number"
                      min={0}
                      className="w-20 rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
                      value={line.doneQty}
                      onChange={(e) => actions.updateMoveLineDoneQty(line.id, Number(e.target.value))}
                    />
                  ) : (
                    <span className="text-emerald-400">{line.doneQty}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.status === "DRAFT" && (
          <div className="flex gap-3 p-4 border-t border-white/10">
            <select value={newProductId} onChange={(e) => setNewProductId(e.target.value)} className="flex-1 rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white">
              <option value="">Select product…</option>
              {productsData.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" min={1} value={newQty} onChange={(e) => setNewQty(e.target.value)} placeholder="Qty" className="w-24 rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white" />
            <button
              onClick={() => {
                if (newProductId && newQty) {
                  actions.addMoveLine(id, newProductId, Number(newQty), data.fromLocationId ?? undefined);
                  setNewProductId("");
                  setNewQty("");
                }
              }}
              disabled={!newProductId || !newQty}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 inline mr-1" /> Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
