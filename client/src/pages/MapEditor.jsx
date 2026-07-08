import { useEffect, useState } from "react";
import MapLayout from "../components/MapLayout";
import useLocationStore from "../store/useLocationStore";
import usePathStore from "../store/usePathStore";

export default function MapEditor() {
  const [toast, setToast] = useState("");
  const [nodeModal, setNodeModal] = useState(null);
  const [pathModal, setPathModal] = useState(null);
  const [selected, setSelected] = useState([]);

  const { locations, fetchLocations } = useLocationStore();
  const { addPath } = usePathStore();

  useEffect(() => { fetchLocations(1, 100); }, []);

  const toast_ = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const handleMapClick = (latlng) => {
    setNodeModal({ lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6) });
  };

  const handleMarkerClick = (locId) => {
    setSelected((prev) => {
      if (prev.length === 0) return [locId];
      if (prev.length === 1) {
        if (prev[0] === locId) return [];
        return [prev[0], locId];
      }
      return [locId];
    });
  };

  useEffect(() => {
    if (selected.length === 2) {
      const from = locations.find((l) => l.id === selected[0]);
      const to = locations.find((l) => l.id === selected[1]);
      if (from && to) {
        setPathModal({ fromId: from.id, fromName: from.name, toId: to.id, toName: to.name });
      }
      setSelected([]);
    }
  }, [selected]);

  const handleCreateNode = async (form) => {
    try {
      const { addLocation } = useLocationStore.getState();
      await addLocation({ name: form.name, type: form.type, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) });
      toast_("Node created");
      setNodeModal(null);
    } catch {
      toast_("Failed to create node");
    }
  };

  const handleCreatePath = async (form) => {
    try {
      await addPath({ from_location_id: form.fromId, to_location_id: form.toId, distance_meters: parseFloat(form.distance) });
      toast_("Path created");
      setPathModal(null);
    } catch {
      toast_("Failed to create path");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-8 shrink-0" style={{ height: "48px", borderBottom: "1px solid #e5e5e5" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 12, fontWeight: 500, color: "#111" }}>Map Editor</span>
          <span style={{ fontSize: 11, color: "#999", marginLeft: 4 }}>
            Click map to add node · Click two markers to connect
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#999" }}>{locations.length} nodes</span>
      </header>

      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <MapLayout
          standalone={false}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      {nodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }} onClick={() => setNodeModal(null)}>
          <div className="w-full max-w-sm mx-4" style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-3.5" style={{ borderBottom: "1px solid #e5e5e5" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>New node</span>
              <button onClick={() => setNodeModal(null)} style={{ color: "#999", background: "none", border: "none", cursor: "pointer" }}>
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M1 1l10 10M11 1L1 11" /></svg>
              </button>
            </div>
            <NodeForm latlng={nodeModal} onSave={handleCreateNode} onClose={() => setNodeModal(null)} />
          </div>
        </div>
      )}

      {pathModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }} onClick={() => setPathModal(null)}>
          <div className="w-full max-w-sm mx-4" style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-3.5" style={{ borderBottom: "1px solid #e5e5e5" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>New path</span>
              <button onClick={() => setPathModal(null)} style={{ color: "#999", background: "none", border: "none", cursor: "pointer" }}>
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M1 1l10 10M11 1L1 11" /></svg>
              </button>
            </div>
            <PathForm initial={pathModal} onSave={handleCreatePath} onClose={() => setPathModal(null)} />
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-5 right-5 px-4 py-2.5 z-50" style={{ background: "#111", color: "#fff", fontSize: 12, borderRadius: 6 }}>{toast}</div>}
    </div>
  );
}

function NodeForm({ latlng, onSave, onClose }) {
  const [form, setForm] = useState({ name: "", type: "", latitude: latlng.lat, longitude: latlng.lng });
  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="p-6 flex flex-col gap-4">
      <div>
        <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Name</label>
        <input className="w-full outline-none" style={{ padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 13, color: "#111", background: "#fff" }}
          name="name" value={form.name} onChange={h} placeholder="e.g. Library" autoFocus />
      </div>
      <div>
        <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Type</label>
        <select className="w-full outline-none" style={{ padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 13, color: form.type ? "#111" : "#bbb", background: "#fff" }}
          name="type" value={form.type} onChange={h}>
          <option value="">No type</option>
          {["gate", "building", "junction", "parking", "field", "other"].map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
      </div>
      <div className="flex gap-3">
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Lat</label>
          <input className="w-full outline-none" style={{ padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 12, color: "#111", background: "#fafafa" }}
            name="latitude" value={form.latitude} onChange={h} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Lng</label>
          <input className="w-full outline-none" style={{ padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 12, color: "#111", background: "#fafafa" }}
            name="longitude" value={form.longitude} onChange={h} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onClose} className="flex-1" style={{ padding: "9px", fontSize: 11, color: "#111", border: "1px solid #e5e5e5", borderRadius: 6, background: "#fff", cursor: "pointer" }}>Cancel</button>
        <button onClick={() => onSave(form)} disabled={!form.name.trim()} className="flex-1"
          style={{ padding: "9px", fontSize: 11, color: "#fff", border: "1px solid #111", borderRadius: 6, background: "#111", cursor: "pointer", opacity: !form.name.trim() ? 0.4 : 1 }}>Create</button>
      </div>
    </div>
  );
}

function PathForm({ initial, onSave, onClose }) {
  const [distance, setDistance] = useState("");

  return (
    <div className="p-6 flex flex-col gap-4">
      <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>
        Connect <strong>{initial.fromName}</strong> → <strong>{initial.toName}</strong>
      </div>
      <div>
        <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>Distance (m)</label>
        <input className="w-full outline-none" style={{ padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 13, color: "#111", background: "#fff" }}
          type="number" min="0" step="0.01" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="e.g. 45.5" autoFocus />
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onClose} className="flex-1" style={{ padding: "9px", fontSize: 11, color: "#111", border: "1px solid #e5e5e5", borderRadius: 6, background: "#fff", cursor: "pointer" }}>Cancel</button>
        <button onClick={() => onSave({ fromId: initial.fromId, toId: initial.toId, distance })} disabled={!distance}
          className="flex-1" style={{ padding: "9px", fontSize: 11, color: "#fff", border: "1px solid #111", borderRadius: 6, background: "#111", cursor: "pointer", opacity: !distance ? 0.4 : 1 }}>Create path</button>
      </div>
    </div>
  );
}
