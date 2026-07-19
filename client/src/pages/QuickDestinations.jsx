import { useEffect, useState } from "react";
import { getQuickDestinations, createQuickDestination, updateQuickDestination, deleteQuickDestination, getLocations } from "../api/axios";

const ICON_OPTIONS = [
  { value: "library-outline", label: "📚 Library" },
  { value: "business-outline", label: "🏛️ Building" },
  { value: "school-outline", label: "🏫 School/Lecture" },
  { value: "home-outline", label: "🏠 Home/Hostel" },
  { value: "storefront-outline", label: "🏪 Shop/Market" },
  { value: "basketball-outline", label: "🏀 Sports" },
  { value: "fitness-outline", label: "💪 Gym" },
  { value: "medkit-outline", label: "🏥 Health/Clinic" },
  { value: "restaurant-outline", label: "🍽️ Food/Cafeteria" },
  { value: "cafe-outline", label: "☕ Cafe" },
  { value: "book-outline", label: "📖 Book" },
  { value: "flask-outline", label: "🧪 Lab" },
  { value: "musical-notes-outline", label: "🎵 Music/Arts" },
  { value: "people-outline", label: "👥 Hall/Assembly" },
  { value: "car-outline", label: "🚗 Parking" },
  { value: "bus-outline", label: "🚌 Transport" },
  { value: "location-outline", label: "📍 Location" },
  { value: "compass-outline", label: "🧭 Compass" },
  { value: "map-outline", label: "🗺️ Map" },
  { value: "flag-outline", label: "🚩 Flag" },
  { value: "star-outline", label: "⭐ Star" },
  { value: "heart-outline", label: "❤️ Heart" },
];

export default function QuickDestinations() {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");

  const toast_ = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const fetch = async () => {
    setLoading(true);
    try {
      const [res, locRes] = await Promise.all([getQuickDestinations(), getLocations(1, 200)]);
      setItems(res.data.data);
      setLocations(locRes.data.locations);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const save = async (form) => {
    try {
      if (form.id) {
        await updateQuickDestination(form.id, form);
      } else {
        await createQuickDestination(form);
      }
      toast_("Saved");
      setModal(null);
      fetch();
    } catch { toast_("Failed to save"); }
  };

  const del = async (id) => {
    if (!confirm("Delete this quick destination?")) return;
    try {
      await deleteQuickDestination(id);
      toast_("Deleted");
      fetch();
    } catch { toast_("Failed to delete"); }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ fontFamily: "system-ui, sans-serif", background: "#F5F6F4" }}>
      <header className="flex items-center justify-between px-8 shrink-0" style={{ height: "48px", background: "#FFFFFF", borderBottom: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111111" }}>Quick Destinations</span>
          <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>{items.length} / 6 slots</span>
        </div>
        <button onClick={() => setModal("new")} disabled={items.length >= 6} className="flex items-center gap-1.5"
          style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF", background: items.length >= 6 ? "#9CA3AF" : "#111111", border: "none", borderRadius: 10, padding: "8px 16px", cursor: items.length >= 6 ? "not-allowed" : "pointer" }}>
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path d="M6 1v10M1 6h10" /></svg>
          New shortcut
        </button>
      </header>

      <div className="flex-1 p-8">
        <div className="mb-4 flex items-center gap-2" style={{ fontSize: 12, color: "#6B7280" }}>
          <div style={{ flex: 1, height: 6, background: "#E5E7EB", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${(items.length / 6) * 100}%`, height: "100%", background: "#0F766E", borderRadius: 3, transition: "width 0.3s" }} />
          </div>
          <span style={{ fontWeight: 600 }}>{items.length}/6</span>
          <span>slots used on mobile</span>
        </div>
        <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
          <div className="grid px-5 py-3" style={{ gridTemplateColumns: "0.4fr 0.6fr 1fr 0.8fr 60px", borderBottom: "1px solid #E5E7EB", background: "#F9FAFB" }}>
            {["Label", "Icon", "Linked Location", "Keywords", ""].map((h) => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>{h}</div>
            ))}
          </div>

          {loading && <div className="py-16 text-center" style={{ fontSize: 12, color: "#6B7280" }}>Loading…</div>}
          {!loading && items.length === 0 && <div className="py-16 text-center" style={{ fontSize: 12, color: "#6B7280" }}>No quick destinations yet</div>}

          {!loading && items.map((item, i) => (
            <div key={item.id} className="grid px-5 py-3 items-center" style={{ gridTemplateColumns: "0.4fr 0.6fr 1fr 0.8fr 60px", borderBottom: i < items.length - 1 ? "1px solid #E5E7EB" : "none" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111111" }}>{item.label}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>{item.icon || "—"}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>{item.location_id ? (locations.find(l => l.id === item.location_id)?.name || item.location_id) : "—"}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{(item.match_keywords || []).join(", ") || "—"}</div>
              <div className="flex gap-1">
                <button onClick={() => setModal(item)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 13, padding: 2 }}>✎</button>
                <button onClick={() => del(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", fontSize: 13, padding: 2 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && <QuickDestModal initial={modal === "new" ? null : modal} locations={locations.filter(l => l.type !== "junction")} onClose={() => setModal(null)} onSave={save} />}

      {toast && <div className="fixed bottom-5 right-5 px-4 py-2.5 z-50" style={{ background: "#111111", color: "#FFFFFF", fontSize: 12, fontWeight: 600, borderRadius: 10 }}>{toast}</div>}
    </div>
  );
}

function QuickDestModal({ initial, locations, onClose, onSave }) {
  const [form, setForm] = useState({
    id: initial?.id || null,
    label: initial?.label || "",
    icon: initial?.icon || "",
    location_id: initial?.location_id || "",
    match_keywords: (initial?.match_keywords || []).join(", "),
    sort_order: initial?.sort_order ?? 0,
  });

  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = () => {
    onSave({
      ...form,
      match_keywords: form.match_keywords.split(",").map(s => s.trim()).filter(Boolean),
      location_id: form.location_id || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-sm mx-4" style={{ background: "#FFFFFF", borderRadius: 18, border: "1px solid #E1E5E1" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #E5E7EB" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111111" }}>{initial ? "Edit shortcut" : "New shortcut"}</span>
          <button onClick={onClose} style={{ color: "#6B7280", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#111111", marginBottom: 8 }}>Label</label>
            <input className="w-full outline-none" style={{ padding: "10px 14px", border: "1px solid #D8DEDA", borderRadius: 10, fontSize: 14, color: "#111111", background: "#FFFFFF", boxSizing: "border-box" }}
              name="label" value={form.label} onChange={h} placeholder="e.g. Library" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#111111", marginBottom: 8 }}>Icon</label>
            <select className="w-full outline-none" style={{ padding: "10px 14px", border: "1px solid #D8DEDA", borderRadius: 10, fontSize: 14, color: "#111111", background: "#FFFFFF", boxSizing: "border-box" }}
              name="icon" value={form.icon} onChange={h}>
              <option value="">— Select icon —</option>
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {form.icon && (
              <div className="mt-2 flex items-center gap-2" style={{ fontSize: 12, color: "#6B7280" }}>
                <span>Preview:</span>
                <span style={{ fontFamily: "monospace", fontSize: 13, color: "#111111", background: "#F3F4F6", padding: "2px 8px", borderRadius: 4 }}>{form.icon}</span>
              </div>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#111111", marginBottom: 8 }}>Linked Location</label>
            <select className="w-full outline-none" style={{ padding: "10px 14px", border: "1px solid #D8DEDA", borderRadius: 10, fontSize: 14, color: "#111111", background: "#FFFFFF", boxSizing: "border-box" }}
              name="location_id" value={form.location_id} onChange={h}>
              <option value="">— None —</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#111111", marginBottom: 8 }}>Match Keywords (comma-separated)</label>
            <input className="w-full outline-none" style={{ padding: "10px 14px", border: "1px solid #D8DEDA", borderRadius: 10, fontSize: 14, color: "#111111", background: "#FFFFFF", boxSizing: "border-box" }}
              name="match_keywords" value={form.match_keywords} onChange={h} placeholder="main library, library" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#111111", marginBottom: 8 }}>Sort Order</label>
            <input className="w-full outline-none" style={{ padding: "10px 14px", border: "1px solid #D8DEDA", borderRadius: 10, fontSize: 14, color: "#111111", background: "#FFFFFF", boxSizing: "border-box" }}
              name="sort_order" type="number" value={form.sort_order} onChange={h} />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1" style={{ padding: "10px", fontSize: 14, fontWeight: 600, color: "#111111", border: "1px solid #D8DEDA", borderRadius: 10, background: "#FFFFFF", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} disabled={!form.label.trim()} className="flex-1"
            style={{ padding: "10px", fontSize: 14, fontWeight: 700, color: "#FFFFFF", border: "none", borderRadius: 10, background: "#111111", cursor: "pointer", opacity: !form.label.trim() ? 0.5 : 1 }}>{initial ? "Save" : "Create"}</button>
        </div>
      </div>
    </div>
  );
}