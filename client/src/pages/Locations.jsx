import { useEffect, useState, useRef } from "react";
import useLocationStore from "../store/useLocationStore";
import LocationRow from "../components/LocationRow";

const TYPE_STYLES = {
  gate:     { bg: "#f8f8f8", color: "#000", border: "#000" },
  building: { bg: "#f8f8f8", color: "#000", border: "#000" },
  junction: { bg: "#f8f8f8", color: "#000", border: "#000" },
  parking:  { bg: "#f8f8f8", color: "#000", border: "#000" },
  field:    { bg: "#f8f8f8", color: "#000", border: "#000" },
  other:    { bg: "#f8f8f8", color: "#000", border: "#000" },
};

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

  const toast_ = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    if (val.trim()) {
      debounceRef.current = setTimeout(() => searchLocations(val), 300);
    } else {
      setPage(1);
      fetchLocations(1, limit);
    }
  };

  const save = (data) => {
    toast_(modal?.id ? "Location updated" : "Location created");
    setModal(null);
  };

  const del = (id) => {
    if (!confirm("Delete this location?")) return;
    toast_("Deleted");
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#fff", fontFamily: "'Instrument Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');`}</style>

      {/* Header */}
      <header className="flex items-center justify-between px-8 shrink-0" style={{ height: "52px", borderBottom: "1px solid #000" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", color: "#000" }}>Locations</span>
          <span style={{ fontSize: "10px", color: "#000", opacity: 0.35, letterSpacing: "0.04em" }}>{totalLocations}</span>
        </div>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-1.5 hover:opacity-50 transition-opacity"
          style={{ fontSize: "11px", letterSpacing: "0.06em", color: "#000", background: "none", border: "1px solid #000", padding: "6px 14px", cursor: "pointer" }}
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
            <path d="M6 1v10M1 6h10" />
          </svg>
          New location
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 p-8">

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative" style={{ width: "280px" }}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "#000", opacity: 0.3 }} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="4.5" />
              <path d="M13 13l-2.5-2.5" />
            </svg>
            <input
              className="w-full outline-none"
              style={{ paddingLeft: "32px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", border: "1px solid #000", background: "#fff", fontSize: "12px", color: "#000", letterSpacing: "0.02em" }}
              placeholder="Search locations…"
              value={search}
              onChange={handleSearch}
            />
          </div>
          {search && (
            <span style={{ fontSize: "10px", color: "#000", opacity: 0.4, letterSpacing: "0.06em" }}>
              {locations.length} result{locations.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Table */}
        <div style={{ border: "1px solid #000" }}>

          {/* Column headers */}
          <div className="grid px-5 py-3" style={{ gridTemplateColumns: "0.6fr 100px 280px 80px", borderBottom: "1px solid #000" }}>
            {["Name", "Type", "ID", ""].map((h) => (
              <div key={h} style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", opacity: 0.35 }}>
                {h}
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="py-16 text-center" style={{ fontSize: "11px", color: "#000", opacity: 0.3, letterSpacing: "0.06em" }}>
              Loading…
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="py-16 flex flex-col items-center gap-3">
              <span style={{ fontSize: "11px", color: "#000", opacity: 0.4 }}>Failed to load locations.</span>
              <button
                onClick={() => fetchLocations(page, limit)}
                style={{ fontSize: "10px", color: "#000", border: "1px solid #000", padding: "4px 12px", background: "none", cursor: "pointer", letterSpacing: "0.06em" }}
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && locations.length === 0 && (
            <div className="py-16 text-center" style={{ fontSize: "11px", color: "#000", opacity: 0.3, letterSpacing: "0.06em" }}>
              No locations found
            </div>
          )}

          {/* Rows */}
          {!loading && !error && locations.map((loc, i) => (
            <LocationRow
              key={loc.id}
              loc={loc}
              isLast={i === locations.length - 1}
              typeStyles={TYPE_STYLES}
              onEdit={setModal}
              onDelete={del}
            />
          ))}

          {/* Pagination */}
          {!search && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid #000" }}>
              <span style={{ fontSize: "10px", color: "#000", opacity: 0.4, letterSpacing: "0.04em" }}>
                {totalLocations > 0
                  ? `${(page - 1) * limit + 1}–${Math.min(page * limit, totalLocations)} of ${totalLocations}`
                  : "No locations"}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1 || loading}
                  className="transition-opacity disabled:opacity-20 hover:opacity-50"
                  style={{ fontSize: "11px", color: "#000", border: "1px solid #000", padding: "3px 10px", background: "none", cursor: "pointer" }}
                >
                  ←
                </button>
                <span style={{ fontSize: "10px", color: "#000", opacity: 0.4, padding: "0 8px" }}>
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages || loading}
                  className="transition-opacity disabled:opacity-20 hover:opacity-50"
                  style={{ fontSize: "11px", color: "#000", border: "1px solid #000", padding: "3px 10px", background: "none", cursor: "pointer" }}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal !== null && (
        <LocModal
          initial={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 px-4 py-2.5 z-50" style={{ background: "#000", color: "#fff", fontSize: "12px", letterSpacing: "0.04em" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function LocModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({ name: initial?.name || "", type: initial?.type || "" });
  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm mx-4"
        style={{ background: "#fff", border: "1px solid #000" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #000" }}>
          <span style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.06em", color: "#000" }}>
            {initial ? "Edit location" : "New location"}
          </span>
          <button onClick={onClose} className="hover:opacity-40 transition-opacity" style={{ color: "#000", background: "none", border: "none", cursor: "pointer" }}>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div>
            <label style={{ display: "block", fontSize: "9px", fontWeight: 500, letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", opacity: 0.4, marginBottom: "8px" }}>
              Name
            </label>
            <input
              className="w-full outline-none"
              style={{ padding: "8px 12px", border: "1px solid #000", fontSize: "12px", color: "#000", background: "#fff", letterSpacing: "0.02em" }}
              name="name" value={form.name} onChange={h} placeholder="e.g. School Gate"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "9px", fontWeight: 500, letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", opacity: 0.4, marginBottom: "8px" }}>
              Type
            </label>
            <select
              className="w-full outline-none appearance-none cursor-pointer"
              style={{ padding: "8px 12px", border: "1px solid #000", fontSize: "12px", color: form.type ? "#000" : "#999", background: "#fff", letterSpacing: "0.02em" }}
              name="type" value={form.type} onChange={h}
            >
              <option value="">No type</option>
              {["gate", "building", "junction", "parking", "field", "other"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 hover:opacity-50 transition-opacity"
            style={{ padding: "9px", fontSize: "11px", letterSpacing: "0.06em", color: "#000", border: "1px solid #000", background: "#fff", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.name.trim()}
            className="flex-1 disabled:opacity-30 hover:opacity-70 transition-opacity"
            style={{ padding: "9px", fontSize: "11px", letterSpacing: "0.06em", color: "#fff", border: "1px solid #000", background: "#000", cursor: "pointer" }}
          >
            {initial ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}