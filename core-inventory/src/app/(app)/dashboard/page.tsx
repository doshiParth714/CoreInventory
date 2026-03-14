"use client";

import { useState } from "react";
import { PackageCheck, Truck, Package, ArrowLeftRight, AlertTriangle, Filter } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useStore } from "@/contexts/StoreContext";
import { useSettings } from "@/contexts/SettingsContext";

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: number | string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href?: string;
}) {
  const inner = (
    <div className={cn("rounded-xl border bg-white/3 p-5 space-y-3 transition hover:bg-white/5", color)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", `${color.split(" ")[0]}/20`)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
  if (href) return <Link href={href} className="block">{inner}</Link>;
  return inner;
}

export default function DashboardPage() {
  const [filters, setFilters] = useState({ type: "" });
  const { state } = useStore();
  const { settings } = useSettings();

  const receipts = state.pickings.filter((p) => p.operationType === "RECEIPT");
  const transfers = state.pickings.filter((p) => p.operationType === "TRANSFER");
  const pendingReceipts = receipts.filter((p) => ["DRAFT", "CONFIRM", "READY"].includes(p.status)).length;
  const pendingDeliveries = state.pickings.filter((p) => p.operationType === "DELIVERY" && ["DRAFT", "CONFIRM", "READY"].includes(p.status)).length;
  const internalTransfers = transfers.filter((p) => ["CONFIRM", "READY"].includes(p.status)).length;
  const receiptDraft = receipts.filter((r) => r.status === "DRAFT").length;
  const receiptReady = receipts.filter((r) => r.status === "READY").length;
  const deliveryDraft = state.pickings.filter((p) => p.operationType === "DELIVERY" && p.status === "DRAFT").length;
  const deliveryReady = state.pickings.filter((p) => p.operationType === "DELIVERY" && p.status === "READY").length;
  const deliveryConfirm = state.pickings.filter((p) => p.operationType === "DELIVERY" && p.status === "CONFIRM").length;

  // Real-time low/out-of-stock: sum all stock per product and compare to reorder point
  const lowStockProducts = state.products.filter((p) => {
    const totalOnHand = state.productStocks
      .filter((s) => s.productId === p.id)
      .reduce((sum, s) => sum + Number(s.onHand), 0);
    return totalOnHand <= p.reorderPoint;
  });
  const lowStock = lowStockProducts.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Live inventory snapshot</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
          <Filter className="h-4 w-4 ml-2 text-slate-400" />
          <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))} className="bg-transparent border-none text-sm text-white focus:ring-0 [&>option]:bg-slate-800">
            <option value="">All Operations</option>
            <option value="RECEIPT">Receipts</option>
            <option value="DELIVERY">Deliveries</option>
            <option value="TRANSFER">Transfers</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard title="Total Products" value={state.products.length} icon={Package} color="border-blue-500/20 text-blue-400" href="/products" />
        {settings.stockAlerts && (
          <KpiCard title="Low / Out of Stock" value={lowStock} sub={`${lowStockProducts.filter(p => state.productStocks.filter(s => s.productId === p.id).reduce((a,b) => a + b.onHand, 0) === 0).length} out of stock · ${lowStockProducts.filter(p => state.productStocks.filter(s => s.productId === p.id).reduce((a,b) => a + b.onHand, 0) > 0).length} low`} icon={AlertTriangle} color="border-red-500/20 text-red-400" href="/products" />
        )}
        <KpiCard title="Pending Receipts" value={pendingReceipts} sub={`${receiptDraft} draft · ${receiptReady} ready`} icon={PackageCheck} color="border-emerald-500/20 text-emerald-400" href="/operations/receipts?filter=pending" />
        <KpiCard title="Pending Deliveries" value={pendingDeliveries} sub={`${deliveryDraft} draft · ${deliveryConfirm} in progress · ${deliveryReady} ready`} icon={Truck} color="border-amber-500/20 text-amber-400" href="/operations/deliveries?filter=pending" />
        <KpiCard title="Internal Transfers" value={internalTransfers} sub="In transit" icon={ArrowLeftRight} color="border-purple-500/20 text-purple-400" href="/operations/internal-transfers?filter=pending" />
      </div>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(!filters.type || filters.type === "RECEIPT") && <RecentPickings type="RECEIPT" statusFilter={["DRAFT", "CONFIRM", "READY"]} title="Pending Receipts" />}
        {(!filters.type || filters.type === "DELIVERY") && <RecentPickings type="DELIVERY" statusFilter={["DRAFT", "CONFIRM", "READY"]} title="Pending Deliveries" />}
        {(!filters.type || filters.type === "TRANSFER") && <RecentPickings type="TRANSFER" statusFilter={["DRAFT", "CONFIRM", "READY"]} title="Pending Transfers" />}
      </div>
    </div>
  );
}

function RecentPickings({ type, statusFilter, title: t_title }: { type: "RECEIPT" | "DELIVERY" | "TRANSFER", statusFilter?: string[], title?: string }) {
  const { state } = useStore();
  let filtered = state.pickings.filter((p) => p.operationType === type);
  if (statusFilter) filtered = filtered.filter(p => statusFilter.includes(p.status));
  
  const items = filtered.slice(0, 5).map((p) => {
    const toLoc = p.toLocationId ? state.locations.find((l) => l.id === p.toLocationId) : null;
    const fromLoc = p.fromLocationId ? state.locations.find((l) => l.id === p.fromLocationId) : null;
    return { id: p.id, reference: p.reference, contactName: p.contactName, status: p.status, toName: toLoc?.name, fromName: fromLoc?.name };
  });
  
  const title = t_title || (type === "RECEIPT" ? "Recent Receipts" : type === "DELIVERY" ? "Recent Deliveries" : "Recent Transfers");
  const baseHref = type === "RECEIPT" ? "/operations/receipts" : type === "DELIVERY" ? "/operations/deliveries" : "/operations/internal-transfers";
  const isPending = statusFilter?.includes("DRAFT") && statusFilter?.includes("READY");
  const href = isPending ? `${baseHref}?filter=pending` : baseHref;
  const detailBase = baseHref;
  const badgeColor: Record<string, string> = { DRAFT: "bg-slate-500/20 text-slate-400", CONFIRM: "bg-blue-500/20 text-blue-400", READY: "bg-amber-500/20 text-amber-400", DONE: "bg-emerald-500/20 text-emerald-400", CANCELLED: "bg-red-500/20 text-red-400" };

  return (
    <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <Link href={href} className="text-xs text-indigo-400 hover:text-indigo-300 transition">View all →</Link>
      </div>
      <div className="divide-y divide-white/5">
        {items.length === 0 ? <p className="px-5 py-4 text-sm text-slate-500">No records found.</p> : items.map((item) => (
          <Link key={item.id} href={`${detailBase}/${item.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition">
            <div>
              <p className="text-sm font-medium text-white">{item.reference}</p>
              <p className="text-xs text-slate-500">{item.contactName ?? "—"}</p>
            </div>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", badgeColor[item.status] ?? "bg-slate-500/20 text-slate-400")}>{item.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
