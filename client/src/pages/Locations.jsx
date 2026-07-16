import { useEffect, useState, useRef } from "react";
import useLocationStore from "../store/useLocationStore";
import LocationRow from "../components/LocationRow";

export default function Locations() {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);
  const limit = 10;

  const { locations, loading, error, fetchLocations, searchLocations, totalLocations } = useLocationStore();
  const totalPages = totalLocations > 0 ? Math.ceil(totalLocations / limit) : 1;

  useEffect(() => { fetchLocations(page, limit); }, [page]);

  const toast_ = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    if (val.trim()) { debounceRef.current = setTimeout(() => searchLocations(val), 300); }
    else { setPage(1); fetchLocations(1, limit); }
  };

  const { addLocation, deleteLocation } = useLocationStore();

  const save = async (form) => {
    try {
      await addLocation({ name: form.name, type: form.type, latitude: parseFloat(form.latitude) || undefined, longitude: parseFloat(form.longitude) || undefined });
      toast_("Location created");
      setModal(null);
      fetchLocations(page, limit);
    } catch { toast_("Failed to create location"); }
  };
  const del = async (id) => {
    if (!confirm("Delete this location?")) return;
    try {
      await deleteLocation(id);
      toast_("Deleted");
    } catch { toast_("Failed to delete"); }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ fontFamily: "system-ui, sans-serif", background: "#F5F6F4" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 shrink-0" style={{ height: "48px", background: "#FFFFFF", borderBottom: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111111" }}>Locations</span>
          <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>{totalLocations}</span>
        </div>
        <button onClick={() => setModal("new")} className="flex items-center gap-1.5"
          style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF", background: "#111111", border: "none", borderRadius: 10, padding: "8px 16px", cursor: "pointer" }}>
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path d="M6 1v10M1 6h10" /></svg>
          New location
        </button>
      </header>

      <div className="flex-1 p-8">
        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative" style={{ width: "280px" }}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "#6B7280" }} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="4.5" /><path d="M13 13l-2.5-2.5" />
            </svg>
            <input className="w-full outline-none" style={{ paddingLeft: "32px", paddingRight: "12px", paddingTop: "10px", paddingBottom: "10px", border: "1px solid #D8DEDA", borderRadius: 10, background: "#FFFFFF", fontSize: 13, color: "#111111", fontFamily: "system-ui, sans-serif", boxSizing: "border-box" }}
              placeholder="Search locations…" value={search} onChange={handleSearch} />
          </div>
          {search && <span style={{ fontSize: 11, color: "#6B7280" }}>{locations.length} result{locations.length !== 1 ? "s" : ""}</span>}
        </div>

        {/* Table */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
          <div className="grid px-5 py-3" style={{ gridTemplateColumns: "0.6fr 100px 280px 80px", borderBottom: "1px solid #E5E7EB", background: "#F9FAFB" }}>
            {["Name", "Type", "ID", ""].map((h) => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>{h}</div>
            ))}
          </div>

          {loading && <div className="py-16 text-center" style={{ fontSize: 12, color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>Loading…</div>}
          {!loading && error && (
            <div className="py-16 flex flex-col items-center gap-3">
              <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>Failed to load locations.</span>
              <button onClick={() => fetchLocations(page, limit)} style={{ fontSize: 12, fontWeight: 600, color: "#111111", border: "1px solid #111111", borderRadius: 8, padding: "6px 16px", background: "transparent", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>Try again</button>
            </div>
          )}
          {!loading && !error && locations.length === 0 && <div className="py-16 text-center" style={{ fontSize: 12, color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>No locations found</div>}

          {!loading && !error && locations.map((loc, i) => (
            <LocationRow key={loc.id} loc={loc} isLast={i === locations.length - 1} onEdit={setModal} onDelete={del} />
          ))}

          {!search && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid #E5E7EB" }}>
              <span style={{ fontSize: 11, color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>
                {totalLocations > 0 ? `${(page - 1) * limit + 1}–${Math.min(page * limit, totalLocations)} of ${totalLocations}` : "No locations"}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1 || loading}
                  style={{ fontSize: 12, fontWeight: 600, color: "#111111", border: "1px solid #E5E7EB", borderRadius: 8, padding: "4px 12px", background: "#FFFFFF", cursor: "pointer", opacity: page === 1 ? 0.3 : 1, fontFamily: "system-ui, sans-serif" }}>←</button>
                <span style={{ fontSize: 11, color: "#6B7280", padding: "0 8px", fontFamily: "system-ui, sans-serif" }}>{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages || loading}
                  style={{ fontSize: 12, fontWeight: 600, color: "#111111", border: "1px solid #E5E7EB", borderRadius: 8, padding: "4px 12px", background: "#FFFFFF", cursor: "pointer", opacity: page >= totalPages ? 0.3 : 1, fontFamily: "system-ui, sans-serif" }}>→</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal !== null && <LocModal initial={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={save} />}

      {toast && <div className="fixed bottom-5 right-5 px-4 py-2.5 z-50" style={{ background: "#111111", color: "#FFFFFF", fontSize: 12, fontWeight: 600, borderRadius: 10, fontFamily: "system-ui, sans-serif" }}>{toast}</div>}
    </div>
  );
}

function LocModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({ name: initial?.name || "", type: initial?.type || "other", latitude: initial?.latitude || "", longitude: initial?.longitude || "" });
  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-sm mx-4" style={{ background: "#FFFFFF", borderRadius: 18, border: "1px solid #E1E5E1" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #E5E7EB" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111111", fontFamily: "system-ui, sans-serif" }}>{initial ? "Edit location" : "New location"}</span>
          <button onClick={onClose} style={{ color: "#6B7280", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#111111", marginBottom: 8, fontFamily: "system-ui, sans-serif" }}>Name</label>
            <input className="w-full outline-none" style={{ padding: "10px 14px", border: "1px solid #D8DEDA", borderRadius: 10, fontSize: 14, color: "#111111", background: "#FFFFFF", fontFamily: "system-ui, sans-serif", boxSizing: "border-box" }}
              name="name" value={form.name} onChange={h} placeholder="e.g. School Gate" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#111111", marginBottom: 8, fontFamily: "system-ui, sans-serif" }}>Type</label>
            <select className="w-full outline-none" style={{ padding: "10px 14px", border: "1px solid #D8DEDA", borderRadius: 10, fontSize: 14, color: form.type ? "#111111" : "#9CA3AF", background: "#FFFFFF", fontFamily: "system-ui, sans-serif", boxSizing: "border-box" }}
              name="type" value={form.type} onChange={h}>
              <option value="">No type</option>
              {["gate", "building", "junction", "parking", "field", "other"].map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#111111", marginBottom: 8, fontFamily: "system-ui, sans-serif" }}>Latitude</label>
            <input className="w-full outline-none" style={{ padding: "10px 14px", border: "1px solid #D8DEDA", borderRadius: 10, fontSize: 14, color: "#111111", background: "#FFFFFF", fontFamily: "system-ui, sans-serif", boxSizing: "border-box" }}
              name="latitude" type="number" step="any" value={form.latitude} onChange={h} placeholder="e.g. 6.9276" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#111111", marginBottom: 8, fontFamily: "system-ui, sans-serif" }}>Longitude</label>
            <input className="w-full outline-none" style={{ padding: "10px 14px", border: "1px solid #D8DEDA", borderRadius: 10, fontSize: 14, color: "#111111", background: "#FFFFFF", fontFamily: "system-ui, sans-serif", boxSizing: "border-box" }}
              name="longitude" type="number" step="any" value={form.longitude} onChange={h} placeholder="e.g. 3.8713" />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1" style={{ padding: "10px", fontSize: 14, fontWeight: 600, color: "#111111", border: "1px solid #D8DEDA", borderRadius: 10, background: "#FFFFFF", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>Cancel</button>
          <button onClick={() => onSave(form)} disabled={!form.name.trim()} className="flex-1"
            style={{ padding: "10px", fontSize: 14, fontWeight: 700, color: "#FFFFFF", border: "none", borderRadius: 10, background: "#111111", cursor: "pointer", opacity: !form.name.trim() ? 0.5 : 1, fontFamily: "system-ui, sans-serif" }}>{initial ? "Save" : "Create"}</button>
        </div>
      </div>
    </div>
  );
}
