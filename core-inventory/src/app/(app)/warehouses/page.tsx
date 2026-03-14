"use client";

import { useState } from "react";
import { Plus, MapPin, Pencil, Check, X, Warehouse, Building2, Trash2 } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";

export default function WarehousesPage() {
  const { state, actions } = useStore();

  const [whForm, setWhForm] = useState({ name: "", shortCode: "", address: "" });
  const [locForm, setLocForm] = useState({ name: "", shortCode: "", warehouseId: "" });
  const [whError, setWhError] = useState("");
  const [locError, setLocError] = useState("");
  const [showNewWh, setShowNewWh] = useState(false);
  const [showNewLoc, setShowNewLoc] = useState(false);

  const [editingWh, setEditingWh] = useState<string | null>(null);
  const [editWhForm, setEditWhForm] = useState({ name: "", shortCode: "", address: "" });
  const [editingLoc, setEditingLoc] = useState<string | null>(null);
  const [editLocForm, setEditLocForm] = useState({ name: "", shortCode: "", warehouseId: "" });

  const [activeTab, setActiveTab] = useState<"warehouses" | "locations">("warehouses");

  const warehouses = state.warehouses.map((wh) => ({
    ...wh,
    locations: state.locations.filter((l) => l.warehouseId === wh.id),
  }));
  const locations = state.locations.map((loc) => ({
    ...loc,
    warehouse: state.warehouses.find((w) => w.id === loc.warehouseId),
  }));

  function handleCreateWh() {
    if (!whForm.name || !whForm.shortCode || !whForm.address) return;
    if (state.warehouses.some((w) => w.shortCode === whForm.shortCode)) {
      setWhError("Short code already exists.");
      return;
    }
    actions.addWarehouse(whForm);
    setWhForm({ name: "", shortCode: "", address: "" });
    setWhError("");
    setShowNewWh(false);
  }

  function handleCreateLoc() {
    if (!locForm.name || !locForm.shortCode || !locForm.warehouseId) return;
    if (state.locations.some((l) => l.warehouseId === locForm.warehouseId && l.shortCode === locForm.shortCode)) {
      setLocError("Short code already exists for this warehouse.");
      return;
    }
    actions.addLocation({ ...locForm, warehouseId: locForm.warehouseId });
    setLocForm({ name: "", shortCode: "", warehouseId: "" });
    setLocError("");
    setShowNewLoc(false);
  }

  function handleSaveWh(id: string) {
    if (!editWhForm.name || !editWhForm.shortCode || !editWhForm.address) return;
    actions.updateWarehouse(id, editWhForm);
    setEditingWh(null);
  }

  function handleSaveLoc(id: string) {
    if (!editLocForm.name || !editLocForm.shortCode || !editLocForm.warehouseId) return;
    actions.updateLocation(id, editLocForm);
    setEditingLoc(null);
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Warehouses & Locations</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage your inventory infrastructure</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowNewLoc(true); setShowNewWh(false); setActiveTab("locations"); }}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <MapPin className="h-4 w-4" /> New Location
          </button>
          <button
            onClick={() => { setShowNewWh(true); setShowNewLoc(false); setActiveTab("warehouses"); }}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition"
          >
            <Plus className="h-4 w-4" /> New Warehouse
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{state.warehouses.length}</p>
            <p className="text-xs text-slate-400">Warehouses</p>
          </div>
        </div>
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{state.locations.length}</p>
            <p className="text-xs text-slate-400">Locations</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/5 w-fit">
        <button onClick={() => setActiveTab("warehouses")} className={`px-5 py-2 rounded-lg text-sm font-medium transition ${activeTab === "warehouses" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}>
          Warehouses
        </button>
        <button onClick={() => setActiveTab("locations")} className={`px-5 py-2 rounded-lg text-sm font-medium transition ${activeTab === "locations" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}>
          Locations
        </button>
      </div>

      {/* Warehouses Tab */}
      {activeTab === "warehouses" && (
        <div className="space-y-3">
          {showNewWh && (
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">New Warehouse</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Name", key: "name", placeholder: "Main Warehouse" },
                  { label: "Short Code", key: "shortCode", placeholder: "WH1" },
                  { label: "Address", key: "address", placeholder: "123 Factory Rd" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-slate-500">{label}</label>
                    <input
                      value={(whForm as Record<string, string>)[key]}
                      onChange={(e) => setWhForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                ))}
              </div>
              {whError && <p className="text-xs text-red-400">{whError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleCreateWh}
                  disabled={!whForm.name || !whForm.shortCode || !whForm.address}
                  className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition disabled:opacity-60"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Warehouse
                </button>
                <button onClick={() => setShowNewWh(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {warehouses.map((wh) => (
            <div key={wh.id} className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
              {editingWh === wh.id ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500" value={editWhForm.name} onChange={(e) => setEditWhForm({ ...editWhForm, name: e.target.value })} placeholder="Name" />
                    <input className="w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500" value={editWhForm.shortCode} onChange={(e) => setEditWhForm({ ...editWhForm, shortCode: e.target.value })} placeholder="Code" />
                    <input className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500" value={editWhForm.address} onChange={(e) => setEditWhForm({ ...editWhForm, address: e.target.value })} placeholder="Address" />
                    <button onClick={() => handleSaveWh(wh.id)} className="text-emerald-400 hover:bg-emerald-500/10 p-2 rounded-lg transition"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditingWh(null)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                      <Warehouse className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{wh.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{wh.shortCode} · {wh.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-slate-400">
                      {wh.locations.length} location{wh.locations.length !== 1 ? "s" : ""}
                    </span>
                    <button onClick={() => { setEditingWh(wh.id); setEditWhForm({ name: wh.name, shortCode: wh.shortCode, address: wh.address }); }} className="text-slate-500 hover:text-white transition p-1.5 rounded-lg hover:bg-white/5" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => confirm("Are you sure you want to delete this warehouse and its locations?") && actions.deleteWarehouse(wh.id)} className="text-slate-500 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-500/10" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Locations under this warehouse */}
              {wh.locations.length > 0 && (
                <div className="border-t border-white/5">
                  {wh.locations.map((loc) => (
                    <div key={loc.id} className="flex items-center justify-between px-5 py-2.5 hover:bg-white/3 transition border-b border-white/5 last:border-0 group">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                        <p className="text-sm text-slate-300">{loc.name}</p>
                        <span className="text-xs font-mono text-slate-500">{loc.shortCode}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => { setEditingLoc(loc.id); setEditLocForm({ name: loc.name, shortCode: loc.shortCode, warehouseId: loc.warehouseId }); setShowNewLoc(false); setActiveTab("locations"); }} className="text-slate-500 hover:text-white p-1 rounded-md transition" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => confirm("Are you sure you want to delete this location?") && actions.deleteLocation(loc.id)} className="text-slate-500 hover:text-red-400 p-1 rounded-md transition" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === "locations" && (
        <div className="space-y-3">
          {showNewLoc && (
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">New Location</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Warehouse</label>
                  <select
                    value={locForm.warehouseId}
                    onChange={(e) => setLocForm((f) => ({ ...f, warehouseId: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition"
                  >
                    <option value="">Select…</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                {[
                  { label: "Name", key: "name", placeholder: "Rack A" },
                  { label: "Short Code", key: "shortCode", placeholder: "RA" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-slate-500">{label}</label>
                    <input
                      value={(locForm as Record<string, string>)[key]}
                      onChange={(e) => setLocForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full rounded-lg border border-white/10 bg-[#0f1117] px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                ))}
              </div>
              {locError && <p className="text-xs text-red-400">{locError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleCreateLoc}
                  disabled={!locForm.name || !locForm.shortCode || !locForm.warehouseId}
                  className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition disabled:opacity-60"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Location
                </button>
                <button onClick={() => setShowNewLoc(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {locations.map((loc) => (
            <div key={loc.id} className="rounded-xl border border-white/10 bg-white/3 px-5 py-3.5 flex items-center justify-between">
              {editingLoc === loc.id ? (
                <div className="w-full flex items-center gap-2">
                  <select className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500" value={editLocForm.warehouseId} onChange={(e) => setEditLocForm({ ...editLocForm, warehouseId: e.target.value })}>
                    {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  <input className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500" value={editLocForm.name} onChange={(e) => setEditLocForm({ ...editLocForm, name: e.target.value })} placeholder="Name" />
                  <input className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500" value={editLocForm.shortCode} onChange={(e) => setEditLocForm({ ...editLocForm, shortCode: e.target.value })} placeholder="Code" />
                  <button onClick={() => handleSaveLoc(loc.id)} className="text-emerald-400 hover:bg-emerald-500/10 p-2 rounded-lg transition"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditingLoc(null)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{loc.warehouse?.name} <span className="text-slate-500 font-normal">›</span> {loc.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{loc.shortCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingLoc(loc.id); setEditLocForm({ name: loc.name, shortCode: loc.shortCode, warehouseId: loc.warehouseId }); }} className="text-slate-500 hover:text-white transition p-1.5 rounded-lg hover:bg-white/5" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => confirm("Are you sure you want to delete this location?") && actions.deleteLocation(loc.id)} className="text-slate-500 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-500/10" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
