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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-8 shrink-0" style={{ height: "48px", borderBottom: "1px solid #e5e5e5" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 12, fontWeight: 500, color: "#111" }}>Locations</span>
          <span style={{ fontSize: 11, color: "#999" }}>{totalLocations}</span>
        </div>
        <button onClick={() => setModal("new")} className="flex items-center gap-1.5"
          style={{ fontSize: 11, color: "#111", background: "none", border: "1px solid #111", padding: "6px 14px", cursor: "pointer", transition: "opacity 0.15s" }}>
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path d="M6 1v10M1 6h10" /></svg>
          New location
        </button>
      </header>

      <div className="flex-1 p-8">
        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative" style={{ width: "280px" }}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "#111", opacity: 0.25 }} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="4.5" /><path d="M13 13l-2.5-2.5" />
            </svg>
            <input className="w-full outline-none" style={{ paddingLeft: "32px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", border: "1px solid #e5e5e5", borderRadius: 6, background: "#fff", fontSize: 13, color: "#111" }}
              placeholder="Search locations…" value={search} onChange={handleSearch} />
          </div>
          {search && <span style={{ fontSize: 11, color: "#999" }}>{locations.length} result{locations.length !== 1 ? "s" : ""}</span>}
        </div>

        {/* Table */}
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 6, overflow: "hidden" }}>
          <div className="grid px-5 py-2.5" style={{ gridTemplateColumns: "0.6fr 100px 280px 80px", borderBottom: "1px solid #e5e5e5", background: "#fafafa" }}>
            {["Name", "Type", "ID", ""].map((h) => (
              <div key={h} style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999" }}>{h}</div>
            ))}
          </div>

          {loading && <div className="py-16 text-center" style={{ fontSize: 11, color: "#999" }}>Loading…</div>}
          {!loading && error && (
            <div className="py-16 flex flex-col items-center gap-3">
              <span style={{ fontSize: 11, color: "#999" }}>Failed to load locations.</span>
              <button onClick={() => fetchLocations(page, limit)} style={{ fontSize: 11, color: "#111", border: "1px solid #111", padding: "4px 12px", background: "none", cursor: "pointer" }}>Try again</button>
            </div>
          )}
          {!loading && !error && locations.length === 0 && <div className="py-16 text-center" style={{ fontSize: 11, color: "#999" }}>No locations found</div>}

          {!loading && !error && locations.map((loc, i) => (
            <LocationRow key={loc.id} loc={loc} isLast={i === locations.length - 1} onEdit={setModal} onDelete={del} />
          ))}

          {!search && (
            <div className="flex items-center justify-between px-5 py-2.5" style={{ borderTop: "1px solid #e5e5e5" }}>
              <span style={{ fontSize: 11, color: "#999" }}>
                {totalLocations > 0 ? `${(page - 1) * limit + 1}–${Math.min(page * limit, totalLocations)} of ${totalLocations}` : "No locations"}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1 || loading}
                  style={{ fontSize: 11, color: "#111", border: "1px solid #e5e5e5", padding: "3px 10px", background: "none", cursor: "pointer", opacity: page === 1 ? 0.3 : 1 }}>←</button>
                <span style={{ fontSize: 11, color: "#999", padding: "0 8px" }}>{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages || loading}
                  style={{ fontSize: 11, color: "#111", border: "1px solid #e5e5e5", padding: "3px 10px", background: "none", cursor: "pointer", opacity: page >= totalPages ? 0.3 : 1 }}>→</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal !== null && <LocModal initial={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={save} />}

      {toast && <div className="fixed bottom-5 right-5 px-4 py-2.5 z-50" style={{ background: "#111", color: "#fff", fontSize: 12, borderRadius: 6 }}>{toast}</div>}
    </div>
  );
}

function LocModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({ name: initial?.name || "", type: initial?.type || "other", latitude: initial?.latitude || "", longitude: initial?.longitude || "" });
  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }} onClick={onClose}>
      <div className="w-full max-w-sm mx-4" style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-3.5" style={{ borderBottom: "1px solid #e5e5e5" }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{initial ? "Edit location" : "New location"}</span>
          <button onClick={onClose} style={{ color: "#999", background: "none", border: "none", cursor: "pointer" }}>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M1 1l10 10M11 1L1 11" /></svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Name</label>
            <input className="w-full outline-none" style={{ padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 13, color: "#111", background: "#fff" }}
              name="name" value={form.name} onChange={h} placeholder="e.g. School Gate" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Type</label>
            <select className="w-full outline-none" style={{ padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 13, color: form.type ? "#111" : "#bbb", background: "#fff" }}
              name="type" value={form.type} onChange={h}>
              <option value="">No type</option>
              {["gate", "building", "junction", "parking", "field", "other"].map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Latitude</label>
            <input className="w-full outline-none" style={{ padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 13, color: "#111", background: "#fff" }}
              name="latitude" type="number" step="any" value={form.latitude} onChange={h} placeholder="e.g. 6.9276" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Longitude</label>
            <input className="w-full outline-none" style={{ padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 13, color: "#111", background: "#fff" }}
              name="longitude" type="number" step="any" value={form.longitude} onChange={h} placeholder="e.g. 3.8713" />
          </div>
        </div>

        <div className="flex gap-2 px-6 pb-6">
          <button onClick={onClose} className="flex-1" style={{ padding: "9px", fontSize: 11, color: "#111", border: "1px solid #e5e5e5", borderRadius: 6, background: "#fff", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(form)} disabled={!form.name.trim()} className="flex-1"
            style={{ padding: "9px", fontSize: 11, color: "#fff", border: "1px solid #111", borderRadius: 6, background: "#111", cursor: "pointer", opacity: !form.name.trim() ? 0.4 : 1 }}>{initial ? "Save" : "Create"}</button>
        </div>
      </div>
    </div>
  );
}