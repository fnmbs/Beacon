import { useEffect, useState } from "react";
import usePathStore from "../store/usePathStore";

export default function Paths() {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;

  const { fetchPaths, paths, totalPaths, totalPathsDistance, totalPages, loading, error } = usePathStore();

  useEffect(() => { fetchPaths(page, limit); }, [page]);

  const toast_ = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };
  const save = () => { toast_(modal?.id ? "Path updated" : "Path created"); setModal(null); };
  const del = () => { if (!confirm("Delete this path?")) return; toast_("Deleted"); };

  const filtered = search ? paths.filter((p) => p.from_name?.toLowerCase().includes(search.toLowerCase()) || p.to_name?.toLowerCase().includes(search.toLowerCase())) : paths;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-8 shrink-0" style={{ height: "48px", borderBottom: "1px solid #e5e5e5" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 12, fontWeight: 500, color: "#111" }}>Paths</span>
          <span style={{ fontSize: 11, color: "#999" }}>{totalPaths}</span>
          <span style={{ color: "#ddd" }}>|</span>
          <span style={{ fontSize: 11, color: "#999" }}>{totalPathsDistance}m total</span>
        </div>
        <button onClick={() => setModal("new")} className="flex items-center gap-1.5"
          style={{ fontSize: 11, color: "#111", background: "none", border: "1px solid #111", padding: "6px 14px", cursor: "pointer" }}>
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path d="M6 1v10M1 6h10" /></svg>
          New path
        </button>
      </header>

      <div className="flex-1 p-8">
        <div className="relative mb-6" style={{ width: "280px" }}>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "#111", opacity: 0.25 }} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6" cy="6" r="4.5" /><path d="M13 13l-2.5-2.5" />
          </svg>
          <input className="w-full outline-none" style={{ paddingLeft: "32px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", border: "1px solid #e5e5e5", borderRadius: 6, background: "#fff", fontSize: 13, color: "#111" }}
            placeholder="Filter by location…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div style={{ border: "1px solid #e5e5e5", borderRadius: 6, overflow: "hidden" }}>
          <div className="grid px-5 py-2.5" style={{ gridTemplateColumns: "1fr 28px 1fr 100px 80px", borderBottom: "1px solid #e5e5e5", background: "#fafafa" }}>
            {["From", "", "To", "Distance", ""].map((h, i) => (
              <div key={i} style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999" }}>{h}</div>
            ))}
          </div>

          {loading && <div className="py-16 text-center" style={{ fontSize: 11, color: "#999" }}>Loading…</div>}
          {!loading && error && (
            <div className="py-16 flex flex-col items-center gap-3">
              <span style={{ fontSize: 11, color: "#999" }}>Failed to load paths.</span>
              <button onClick={() => fetchPaths(page, limit)} style={{ fontSize: 11, color: "#111", border: "1px solid #111", padding: "4px 12px", background: "none", cursor: "pointer" }}>Try again</button>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && <div className="py-16 text-center" style={{ fontSize: 11, color: "#999" }}>No paths found</div>}

          {!loading && !error && filtered.map((path, i) => (
            <div key={path.id} className="group grid px-5 py-3 items-center hover:bg-[#fafafa] transition-colors"
              style={{ gridTemplateColumns: "1fr 28px 1fr 100px 80px", borderBottom: i < filtered.length - 1 ? "1px solid #f0f0f0" : "none" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{path.from_name}</span>
              <span><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-3 h-3" style={{ color: "#111", opacity: 0.15 }}><path d="M1 6h10M7 2l4 4-4 4" /></svg></span>
              <span style={{ fontSize: 13, color: "#888" }}>{path.to_name}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{Number(path.distance_meters).toFixed(1)}<span style={{ fontSize: 11, marginLeft: 2, opacity: 0.4 }}>m</span></span>
              <div className="flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal(path)} style={{ fontSize: 11, color: "#111", border: "1px solid #e5e5e5", padding: "3px 10px", background: "none", cursor: "pointer", borderRadius: 4 }}>Edit</button>
                <button onClick={() => del(path.id)} style={{ fontSize: 11, color: "#d32f2f", border: "1px solid #d32f2f", padding: "3px 10px", background: "none", cursor: "pointer", borderRadius: 4 }}>Del</button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between px-5 py-2.5" style={{ borderTop: "1px solid #e5e5e5" }}>
            <span style={{ fontSize: 11, color: "#999" }}>{totalPaths > 0 ? `${(page - 1) * limit + 1}–${Math.min(page * limit, totalPaths)} of ${totalPaths}` : "No paths"}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1 || loading}
                style={{ fontSize: 11, color: "#111", border: "1px solid #e5e5e5", padding: "3px 10px", background: "none", cursor: "pointer", opacity: page === 1 ? 0.3 : 1 }}>←</button>
              <span style={{ fontSize: 11, color: "#999", padding: "0 8px" }}>{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages || loading}
                style={{ fontSize: 11, color: "#111", border: "1px solid #e5e5e5", padding: "3px 10px", background: "none", cursor: "pointer", opacity: page >= totalPages ? 0.3 : 1 }}>→</button>
            </div>
          </div>
        </div>
      </div>

      {modal !== null && <PathModal initial={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={save} />}
      {toast && <div className="fixed bottom-5 right-5 px-4 py-2.5 z-50" style={{ background: "#111", color: "#fff", fontSize: 12, borderRadius: 6 }}>{toast}</div>}
    </div>
  );
}

function PathModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({ from_location_id: initial?.from_location_id || "", to_location_id: initial?.to_location_id || "", distance_meters: initial?.distance_meters || "" });
  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const valid = form.from_location_id && form.to_location_id && form.distance_meters && form.from_location_id !== form.to_location_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }} onClick={onClose}>
      <div className="w-full max-w-sm mx-4" style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-3.5" style={{ borderBottom: "1px solid #e5e5e5" }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{initial ? "Edit path" : "New path"}</span>
          <button onClick={onClose} style={{ color: "#999", background: "none", border: "none", cursor: "pointer" }}>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M1 1l10 10M11 1L1 11" /></svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {[{ label: "From", name: "from_location_id" }, { label: "To", name: "to_location_id" }].map((f) => (
            <div key={f.name}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>{f.label}</label>
              <input className="w-full outline-none" style={{ padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 13, color: "#111", background: "#fff" }}
                name={f.name} value={form[f.name]} onChange={h} placeholder="Location ID" />
            </div>
          ))}
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Distance (m)</label>
            <input className="w-full outline-none" style={{ padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 13, color: "#111", background: "#fff" }}
              name="distance_meters" type="number" min="0" step="0.01" value={form.distance_meters} onChange={h} placeholder="e.g. 45.5" />
          </div>
        </div>

        <div className="flex gap-2 px-6 pb-6">
          <button onClick={onClose} className="flex-1" style={{ padding: "9px", fontSize: 11, color: "#111", border: "1px solid #e5e5e5", borderRadius: 6, background: "#fff", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(form)} disabled={!valid} className="flex-1"
            style={{ padding: "9px", fontSize: 11, color: "#fff", border: "1px solid #111", borderRadius: 6, background: "#111", cursor: "pointer", opacity: !valid ? 0.4 : 1 }}>{initial ? "Save" : "Create"}</button>
        </div>
      </div>
    </div>
  );
}