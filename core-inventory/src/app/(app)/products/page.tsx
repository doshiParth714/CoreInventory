"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Search, Package, Pencil, Check, X, Trash2 } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { state, actions } = useStore();
  const [form, setForm] = useState({
    name: "",
    sku: "",
    categoryId: "",
    unitOfMeasure: "pcs",
    costPrice: 0,
    reorderPoint: 0,
    initialStock: 0,
    locationId: "",
  });
  const [createCatName, setCreateCatName] = useState("");

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductForm, setEditProductForm] = useState({ name: "", sku: "", categoryId: "", unitOfMeasure: "pcs", costPrice: 0, reorderPoint: 0 });

  const items = state.products.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );
  const categories = state.categories;
  const locations = state.locations.map((loc) => ({
    ...loc,
    warehouse: state.warehouses.find((w) => w.id === loc.warehouseId),
  }));

  function totalOnHand(stocks: { onHand: number }[]) {
    return stocks.reduce((s, st) => s + Number(st.onHand), 0);
  }
  function totalFree(stocks: { onHand: number; reserved: number }[]) {
    return stocks.reduce((s, st) => s + Math.max(0, Number(st.onHand) - Number(st.reserved)), 0);
  }

  function handleCreateProduct() {
    if (!form.name || !form.sku || !form.categoryId) return;
    actions.addProduct({
      ...form,
      categoryId: form.categoryId,
      initialStock: form.initialStock,
      locationId: form.locationId || undefined,
    });
    setShowCreate(false);
    setForm({ name: "", sku: "", categoryId: "", unitOfMeasure: "pcs", costPrice: 0, reorderPoint: 0, initialStock: 0, locationId: "" });
  }

  function handleCreateCategory() {
    if (!createCatName) return;
    actions.addCategory(createCatName);
    setCreateCatName("");
  }

  function handleSaveProduct(id: string) {
    if (!editProductForm.name || !editProductForm.sku || !editProductForm.categoryId) return;
    actions.updateProduct(id, editProductForm);
    setEditingProductId(null);
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Products</h1>
          <p className="text-xs text-slate-400 mt-0.5">{items.length} SKUs</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition"
        >
          <Plus className="h-4 w-4" /> New Product
        </button>
      </div>


      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU…"
          className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
        />
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 bg-white/3">
            <tr>
              {["Product Name", "SKU", "Category", "Unit", "Per Unit Cost", "On Hand", "Free to Use", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No products yet. Click <strong>New Product</strong> to add one.
                </td>
              </tr>
            ) : (
              items.map((p) => {
                const stocks = state.productStocks
                  .filter((s) => s.productId === p.id)
                  .map((s) => ({
                    ...s,
                    location: state.locations.find((l) => l.id === s.locationId),
                  }));
                const onHand = totalOnHand(stocks);
                const free = totalFree(stocks);
                const low = onHand <= p.reorderPoint;
                const category = state.categories.find((c) => c.id === p.categoryId);
                return (
                  <tr key={p.id} className="cursor-pointer hover:bg-white/5 transition group">
                    {editingProductId === p.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-indigo-500" value={editProductForm.name} onChange={(e) => setEditProductForm({...editProductForm, name: e.target.value})} />
                        </td>
                        <td className="px-4 py-3">
                          <input className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm font-mono text-white outline-none focus:border-indigo-500" value={editProductForm.sku} onChange={(e) => setEditProductForm({...editProductForm, sku: e.target.value})} />
                        </td>
                        <td className="px-4 py-3">
                          <select className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-indigo-500" value={editProductForm.categoryId} onChange={(e) => setEditProductForm({...editProductForm, categoryId: e.target.value})}>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-indigo-500" value={editProductForm.unitOfMeasure} onChange={(e) => setEditProductForm({...editProductForm, unitOfMeasure: e.target.value})} />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-indigo-500" value={editProductForm.costPrice} onChange={(e) => setEditProductForm({...editProductForm, costPrice: Number(e.target.value)})} />
                        </td>
                        <td className="px-4 py-3 text-slate-400" colSpan={2}>
                          Cannot edit stock here
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleSaveProduct(p.id)} className="text-emerald-400 hover:bg-emerald-500/10 p-1 rounded transition" title="Save"><Check className="h-4 w-4" /></button>
                            <button onClick={() => setEditingProductId(null)} className="text-yellow-400 hover:bg-yellow-500/10 p-1 rounded transition" title="Cancel"><X className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                          <Package className={cn("h-4 w-4 shrink-0", low ? "text-red-400" : "text-slate-500")} />
                          {p.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.sku}</td>
                        <td className="px-4 py-3 text-slate-400">{category?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-400">{p.unitOfMeasure}</td>
                        <td className="px-4 py-3 text-slate-300">₹{Number(p.costPrice).toLocaleString()}</td>
                        <td className={cn("px-4 py-3 font-semibold", low ? "text-red-400" : "text-white")}>
                          {onHand}
                          {stocks.length > 0 && (
                            <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                              {stocks.map((s) => (
                                <div key={s.locationId}>{s.location?.name}: {Number(s.onHand)}</div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-emerald-400 font-medium">
                          {free}
                          {stocks.length > 0 && (
                            <div className="text-[10px] text-emerald-500/60 font-normal mt-0.5">
                              {stocks.map((s) => {
                                const sf = Math.max(0, Number(s.onHand) - Number(s.reserved));
                                return <div key={s.locationId}>{s.location?.name}: {sf}</div>;
                              })}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={(e) => { e.stopPropagation(); setEditingProductId(p.id); setEditProductForm({ name: p.name, sku: p.sku, categoryId: p.categoryId, unitOfMeasure: p.unitOfMeasure, costPrice: p.costPrice, reorderPoint: p.reorderPoint }); }} className="text-slate-500 hover:text-white transition p-1" title="Edit">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); confirm("Are you sure you want to delete this product?") && actions.deleteProduct(p.id); }} className="text-slate-500 hover:text-red-400 transition p-1" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#141720] p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">New Product</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Name", key: "name", type: "text", placeholder: "e.g. Steel Rod" },
                { label: "SKU", key: "sku", type: "text", placeholder: "e.g. STL-001" },
                { label: "Unit of Measure", key: "unitOfMeasure", type: "text", placeholder: "pcs / kg / box" },
                { label: "Cost Price (₹)", key: "costPrice", type: "number", placeholder: "0" },
                { label: "Reorder Point", key: "reorderPoint", type: "number", placeholder: "0" },
                { label: "Initial Stock", key: "initialStock", type: "number", placeholder: "0" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-slate-400">{label}</label>
                  <input
                    type={type}
                    value={(form as Record<string, string | number>)[key] === 0 && type === "number" ? "" : (form as Record<string, string | number>)[key]}
                    placeholder={placeholder}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
                  />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition"
                >
                  <option value="">Select…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Initial Stock Location</label>
                <select
                  value={form.locationId}
                  onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition"
                >
                  <option value="">Select…</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.warehouse?.name} / {l.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-white/10">
              <input
                value={createCatName}
                onChange={(e) => setCreateCatName(e.target.value)}
                placeholder="+ New category name"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
              />
              <button
                onClick={handleCreateCategory}
                disabled={!createCatName}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 transition disabled:opacity-50"
              >
                Add
              </button>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:bg-white/5 transition">
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                disabled={!form.name || !form.sku || !form.categoryId}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition disabled:opacity-60"
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
