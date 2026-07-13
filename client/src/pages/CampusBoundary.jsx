import { useEffect, useMemo, useState } from "react";
import { getCampusBoundary, updateCampusBoundary } from "../api/axios";
import useLocationStore from "../store/useLocationStore";

const emptyPoint = () => ({ latitude: "", longitude: "" });

const normalizePoint = (point) => ({
  latitude: point?.latitude == null ? "" : String(point.latitude),
  longitude: point?.longitude == null ? "" : String(point.longitude),
});

export default function CampusBoundary() {
  const [name, setName] = useState("OOU Campus");
  const [bufferMeters, setBufferMeters] = useState(150);
  const [gateLocationId, setGateLocationId] = useState("");
  const [points, setPoints] = useState([emptyPoint(), emptyPoint(), emptyPoint()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const { locations, fetchAllLocations } = useLocationStore();

  const validPoints = useMemo(
    () =>
      points
        .map((point) => ({
          latitude: Number(point.latitude),
          longitude: Number(point.longitude),
        }))
        .filter(
          (point) =>
            Number.isFinite(point.latitude) &&
            Number.isFinite(point.longitude),
        ),
    [points],
  );

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const loadBoundary = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCampusBoundary();
      const data = res.data?.data || {};
      setName(data.name || "OOU Campus");
      setBufferMeters(data.buffer_meters ?? 150);
      setGateLocationId(data.gate_location_id || "");
      setPoints(
        Array.isArray(data.boundary) && data.boundary.length > 0
          ? data.boundary.map(normalizePoint)
          : [emptyPoint(), emptyPoint(), emptyPoint()],
      );
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load campus boundary",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoundary();
    if (!locations.length) fetchAllLocations();
  }, []);

  const updatePoint = (index, field, value) => {
    setPoints((current) =>
      current.map((point, i) =>
        i === index ? { ...point, [field]: value } : point,
      ),
    );
  };

  const addPoint = () => setPoints((current) => [...current, emptyPoint()]);

  const removePoint = (index) => {
    setPoints((current) => current.filter((_, i) => i !== index));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    if (validPoints.length < 3 || validPoints.length !== points.length) {
      setSaving(false);
      setError("Enter at least 3 valid latitude/longitude points.");
      return;
    }

    try {
      await updateCampusBoundary({
        name,
        buffer_meters: Number(bufferMeters),
        gate_location_id: gateLocationId || null,
        boundary: validPoints,
      });
      showToast("Campus boundary saved");
      await loadBoundary();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to save campus boundary",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6" style={{ maxWidth: 980 }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111" }}>
          Campus Boundary
        </h1>
        <p style={{ fontSize: 13, color: "#777", marginTop: 4 }}>
          Define the campus perimeter used by the mobile app before allowing in-campus navigation.
        </p>
      </div>

      {error ? (
        <div
          style={{
            border: "1px solid #111",
            padding: 12,
            marginBottom: 16,
            fontSize: 13,
            color: "#111",
            background: "#fff",
          }}
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div style={{ fontSize: 13, color: "#777" }}>Loading boundary...</div>
      ) : (
        <form onSubmit={handleSave}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              padding: 18,
              marginBottom: 16,
            }}
          >
            <div className="grid grid-cols-3 gap-4">
              <label style={{ fontSize: 12, color: "#555" }}>
                Name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ fontSize: 12, color: "#555" }}>
                Buffer meters
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={bufferMeters}
                  onChange={(event) => setBufferMeters(event.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ fontSize: 12, color: "#555" }}>
                Campus gate
                <select
                  value={gateLocationId}
                  onChange={(event) => setGateLocationId(event.target.value)}
                  style={inputStyle}
                >
                  <option value="">No gate selected</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid #e5e5e5",
                background: "#fafafa",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                Boundary points
              </span>
              <button type="button" onClick={addPoint} style={secondaryButton}>
                Add point
              </button>
            </div>

            <div style={{ padding: 14 }}>
              {points.map((point, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-end"
                  style={{ marginBottom: 10 }}
                >
                  <div className="col-span-1" style={pointNumberStyle}>
                    {index + 1}
                  </div>
                  <label className="col-span-5" style={labelStyle}>
                    Latitude
                    <input
                      value={point.latitude}
                      onChange={(event) =>
                        updatePoint(index, "latitude", event.target.value)
                      }
                      placeholder="6.929400"
                      style={inputStyle}
                    />
                  </label>
                  <label className="col-span-5" style={labelStyle}>
                    Longitude
                    <input
                      value={point.longitude}
                      onChange={(event) =>
                        updatePoint(index, "longitude", event.target.value)
                      }
                      placeholder="4.819700"
                      style={inputStyle}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removePoint(index)}
                    disabled={points.length <= 3}
                    style={{
                      ...dangerButton,
                      opacity: points.length <= 3 ? 0.35 : 1,
                      cursor: points.length <= 3 ? "not-allowed" : "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex items-center justify-between"
            style={{ marginTop: 16 }}
          >
            <span style={{ fontSize: 12, color: "#777" }}>
              {validPoints.length} valid point{validPoints.length === 1 ? "" : "s"}
            </span>
            <button type="submit" disabled={saving} style={primaryButton}>
              {saving ? "Saving..." : "Save boundary"}
            </button>
          </div>
        </form>
      )}

      {toast ? (
        <div
          className="fixed bottom-5 right-5 px-4 py-2.5"
          style={{
            zIndex: 10001,
            background: "#111",
            color: "#fff",
            fontSize: 12,
            borderRadius: 6,
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: 5,
  padding: "8px 10px",
  border: "1px solid #e5e5e5",
  borderRadius: 6,
  fontSize: 13,
  color: "#111",
  background: "#fff",
  outline: "none",
};

const labelStyle = {
  fontSize: 11,
  color: "#666",
};

const pointNumberStyle = {
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #e5e5e5",
  borderRadius: 6,
  fontSize: 12,
  color: "#777",
};

const primaryButton = {
  border: "none",
  borderRadius: 6,
  background: "#111",
  color: "#fff",
  padding: "9px 18px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButton = {
  border: "1px solid #111",
  borderRadius: 6,
  background: "#fff",
  color: "#111",
  padding: "7px 12px",
  fontSize: 12,
  cursor: "pointer",
};

const dangerButton = {
  height: 36,
  border: "1px solid #e5e5e5",
  borderRadius: 6,
  background: "#fff",
  color: "#777",
  fontSize: 11,
};
