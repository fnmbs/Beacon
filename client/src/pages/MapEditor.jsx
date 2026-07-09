import { useEffect, useState } from "react";
import MapLayout from "../components/MapLayout";
import useLocationStore from "../store/useLocationStore";
import usePathStore from "../store/usePathStore";
import api from "../api/axios";

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function MapEditor() {
  const [toast, setToast] = useState("");
  const [nodeModal, setNodeModal] = useState(null);
  const [pathModal, setPathModal] = useState(null);
  const [selected, setSelected] = useState([]);
  const [tileStyle, setTileStyle] = useState("map");

  const { locations, fetchAllLocations } = useLocationStore();
  const { addPath } = usePathStore();
  const [allPaths, setAllPaths] = useState([]);

  useEffect(() => { fetchAllLocations(); }, []);

  useEffect(() => {
    const fetchAllPaths = async () => {
      try {
        const res = await api.get("/paths?page=1&limit=1000");
        if (res.data?.success) setAllPaths(res.data.paths);
      } catch (_) {}
    };
    fetchAllPaths();
  }, []);

  const toast_ = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const handleMapClick = (latlng) => {
    const maxNum = locations.reduce((max, loc) => {
      const m = (loc.name || "").match(/^junction (\d+)$/i);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);
    setNodeModal({ lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6), defaultName: `junction ${maxNum + 1}`, defaultType: "junction" });
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
        const dist = haversine(
          parseFloat(from.latitude), parseFloat(from.longitude),
          parseFloat(to.latitude), parseFloat(to.longitude),
        );
        setPathModal({ fromId: from.id, fromName: from.name, toId: to.id, toName: to.name, distance: dist.toFixed(1) });
      }
      setSelected([]);
    }
  }, [selected]);

  const handleCreateNode = async (form) => {
    try {
      const { addLocation } = useLocationStore.getState();
      await addLocation({ name: form.name, type: form.type, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) });
      await fetchAllLocations();
      toast_("Node created");
      setNodeModal(null);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to create node";
      toast_(msg);
    }
  };

  const handleDeleteLocation = async (id) => {
    const loc = locations.find((l) => l.id === id);
    if (!loc) return;
    if (!confirm(`Delete "${loc.name}"?`)) return;
    try {
      const { deleteLocation } = useLocationStore.getState();
      await deleteLocation(id);
      toast_(`"${loc.name}" deleted`);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to delete";
      toast_(msg);
    }
  };

  const handleCreatePath = async (form) => {
    try {
      await addPath({ from_location_id: form.fromId, to_location_id: form.toId, distance_meters: parseFloat(form.distance) });
      const res = await api.get("/paths?page=1&limit=1000");
      if (res.data?.success) setAllPaths(res.data.paths);
      toast_("Path created");
      setPathModal(null);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to create path";
      toast_(msg);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-8 shrink-0" style={{ height: "48px", borderBottom: "1px solid #e5e5e5" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 12, fontWeight: 500, color: "#111" }}>Map Editor</span>
          <span style={{ fontSize: 11, color: "#999", marginLeft: 4 }}>
            Click empty map to add node · Click two markers to connect
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div style={{ display: "flex", border: "1px solid #e0e0e0", borderRadius: 6, overflow: "hidden" }}>
            {[
              { key: "map", label: "Map" },
              { key: "satellite", label: "Satellite" },
              { key: "dark", label: "Dark" },
            ].map((t) => (
              <button key={t.key} onClick={() => setTileStyle(t.key)}
                style={{
                  fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase",
                  padding: "4px 12px", border: "none", cursor: "pointer",
                  background: tileStyle === t.key ? "#111" : "transparent",
                  color: tileStyle === t.key ? "#fff" : "#888",
                  transition: "all 0.12s",
                }}>
                {t.label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 11, color: "#999" }}>{locations.length} nodes</span>
        </div>
      </header>

      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <MapLayout
          tileStyle={tileStyle}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          onDeleteLocation={handleDeleteLocation}
          connectionLines={allPaths}
        />
      </div>

      {nodeModal && (
        <div className="fixed inset-0" style={{ zIndex: 10000, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setNodeModal(null)}>
          <div className="w-full max-w-sm mx-4" style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-3.5" style={{ borderBottom: "1px solid #e5e5e5" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>New node</span>
              <button onClick={() => setNodeModal(null)} style={{ color: "#999", background: "none", border: "none", cursor: "pointer" }}>
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M1 1l10 10M11 1L1 11" /></svg>
              </button>
            </div>
            <NodeForm latlng={nodeModal} onSave={handleCreateNode} onClose={() => setNodeModal(null)} />
          </div>
        </div>
      )}

      {pathModal && (
        <div className="fixed inset-0" style={{ zIndex: 10000, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setPathModal(null)}>
          <div className="w-full max-w-sm mx-4" style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-3.5" style={{ borderBottom: "1px solid #e5e5e5" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>New path</span>
              <button onClick={() => setPathModal(null)} style={{ color: "#999", background: "none", border: "none", cursor: "pointer" }}>
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M1 1l10 10M11 1L1 11" /></svg>
              </button>
            </div>
            <PathForm initial={pathModal} onSave={handleCreatePath} onClose={() => setPathModal(null)} />
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-5 right-5 px-4 py-2.5" style={{ zIndex: 10001, background: "#111", color: "#fff", fontSize: 12, borderRadius: 6 }}>{toast}</div>}
    </div>
  );
}

function NodeForm({ latlng, onSave, onClose }) {
  const [form, setForm] = useState({ name: latlng.defaultName || "", type: latlng.defaultType || "other", latitude: latlng.lat, longitude: latlng.lng });
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
          <option value="other">other</option>
          {["gate", "building", "junction", "parking", "field"].map((t) => (<option key={t} value={t}>{t}</option>))}
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
  return (
    <div className="p-6 flex flex-col gap-4">
      <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>
        Connect <strong>{initial.fromName}</strong> → <strong>{initial.toName}</strong>
      </div>
      <div style={{ padding: "10px 14px", background: "#f5f5f5", borderRadius: 6, border: "1px solid #e5e5e5" }}>
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 4 }}>Distance (auto-calculated)</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#111", fontFamily: "'JetBrains Mono', monospace" }}>{initial.distance}<span style={{ fontSize: 13, fontWeight: 400, color: "#999", marginLeft: 4 }}>m</span></div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onClose} className="flex-1" style={{ padding: "9px", fontSize: 11, color: "#111", border: "1px solid #e5e5e5", borderRadius: 6, background: "#fff", cursor: "pointer" }}>Cancel</button>
        <button onClick={() => onSave({ fromId: initial.fromId, toId: initial.toId, distance: initial.distance })}
          className="flex-1" style={{ padding: "9px", fontSize: 11, color: "#fff", border: "1px solid #111", borderRadius: 6, background: "#111", cursor: "pointer" }}>Create path</button>
      </div>
    </div>
  );
}
