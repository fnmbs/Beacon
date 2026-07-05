import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import useLocationStore from "../store/useLocationStore";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CAMPUS = [6.927598384979245, 3.87129667870627];

const TYPE_LABELS = { gate: "G", building: "B", junction: "J", parking: "P", field: "F", other: "·" };

const TILES = {
  map: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

function nodeIcon(type) {
  const label = TYPE_LABELS[type] || "·";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:#fff;border:1.5px solid #000;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 1px 6px rgba(0,0,0,0.18);
      cursor:pointer;
      font-family:'DM Sans',sans-serif;
      font-size:10px;font-weight:500;color:#000;
      transition: transform 0.1s;
    ">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -18],
  });
}

function endpointIcon(letter) {
  const isOrigin = letter === "A";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:36px;height:44px;cursor:pointer;">
      <svg width="36" height="44" viewBox="0 0 36 44" style="filter:drop-shadow(0 2px 5px rgba(0,0,0,0.22));">
        <path d="M18 2C10.268 2 4 8.268 4 16c0 9.6 14 28 14 28S32 25.6 32 16C32 8.268 25.732 2 18 2z"
          fill="${isOrigin ? "#000" : "#fff"}"
          stroke="${isOrigin ? "#000" : "#000"}"
          stroke-width="1.5"/>
        <text x="18" y="19"
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="'DM Sans',sans-serif"
          font-size="11"
          font-weight="500"
          fill="${isOrigin ? "#fff" : "#000"}">${letter}</text>
      </svg>
    </div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -46],
  });
}

function FitRoute({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) map.fitBounds(positions, { padding: [80, 80] });
  }, [positions]);
  return null;
}

function NodePopup({ loc }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5e5", minWidth: 160, overflow: "hidden", borderRadius: 6 }}>
      <div style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#111", marginBottom: 2 }}>{loc.name}</div>
        <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999" }}>{loc.type || "other"}</span>
      </div>
      <div style={{ padding: "4px 12px" }}>
        <span style={{ fontSize: 9, color: "#ccc" }}>click to select</span>
      </div>
    </div>
  );
}

export default function MapLayout({
  standalone = false,
  route = null,
  from = "",
  to = "",
  onMarkerClick,
  tileStyle: externalTileStyle,
}) {
  const { locations, loading, fetchLocations, totalLocations } = useLocationStore();
  const [tileStyle] = useState("map");

  const activeTile = externalTileStyle || tileStyle;

  useEffect(() => {
    fetchLocations(1, 100);
  }, []);

  const routePositions = route?.steps
    ? [
        ...route.steps.map((s) => [parseFloat(s.fromCoords[0]), parseFloat(s.fromCoords[1])]),
        ...(route.steps.length
          ? [[parseFloat(route.steps.at(-1).toCoords[0]), parseFloat(route.steps.at(-1).toCoords[1])]]
          : []),
      ]
    : [];

  const routeStart = routePositions[0] || null;
  const routeEnd = routePositions[routePositions.length - 1] || null;

  const mapEl = (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
          padding: 0 !important;
          border-radius: 8px !important;
        }
        .custom-popup .leaflet-popup-content { margin: 0 !important; }
        .custom-popup .leaflet-popup-tip-container { display: none !important; }
        .leaflet-popup-close-button {
          color: #999 !important; top: 8px !important; right: 8px !important;
          font-size: 14px !important; opacity: 0.6;
        }
        .leaflet-control-zoom {
          display: none !important;
        }
        .leaflet-control-attribution {
          font-size: 9px !important;
          opacity: 0.5;
          background: rgba(255,255,255,0.7) !important;
        }
      `}</style>

      {loading && (
        <div style={{
          position: "absolute", top: 16, left: "50%",
          transform: "translateX(-50%)", zIndex: 1000,
          background: "#fff", border: "1px solid #e5e5e5",
          padding: "6px 14px", fontSize: 11, borderRadius: 6,
        }}>
          Loading…
        </div>
      )}

      <MapContainer
        center={CAMPUS}
        zoom={17}
        minZoom={15}
        maxZoom={19}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          key={activeTile}
          url={TILES[activeTile]}
          maxNativeZoom={18}
          maxZoom={19}
        />

        {routePositions.length > 1 && <FitRoute positions={routePositions} />}

        {routePositions.length > 1 && (
          <>
            {/* Glow/shadow under route */}
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: "rgba(0,0,0,0.07)",
                weight: 20,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* White border */}
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: "#fff",
                weight: 8,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Main route line */}
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: "#000",
                weight: 4,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}

        {routeStart && (
          <Marker position={routeStart} icon={endpointIcon("A")}>
            <Popup className="custom-popup">
              <NodePopup loc={{ name: route.from, type: "origin" }} />
            </Popup>
          </Marker>
        )}
        {routeEnd && (
          <Marker position={routeEnd} icon={endpointIcon("B")}>
            <Popup className="custom-popup">
              <NodePopup loc={{ name: route.to, type: "destination" }} />
            </Popup>
          </Marker>
        )}

        {locations.map((loc) => {
          if (!loc.latitude || !loc.longitude) return null;
          const lat = parseFloat(loc.latitude);
          const lng = parseFloat(loc.longitude);
          const isFrom = String(loc.id) === String(from);
          const isTo = String(loc.id) === String(to);

          if (isFrom || isTo) {
            return (
              <Marker
                key={loc.id}
                position={[lat, lng]}
                icon={endpointIcon(isFrom ? "A" : "B")}
                eventHandlers={{ click: () => onMarkerClick?.(loc.id) }}
              >
                <Popup className="custom-popup">
                  <NodePopup loc={loc} />
                </Popup>
              </Marker>
            );
          }

          return (
            <Marker
              key={loc.id}
              position={[lat, lng]}
              icon={nodeIcon(loc.type)}
              eventHandlers={{ click: () => onMarkerClick?.(loc.id) }}
            >
              <Popup className="custom-popup">
                <NodePopup loc={loc} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );

  if (!standalone) return mapEl;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#fff" }}>
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 48, flexShrink: 0,
        borderBottom: "1px solid #e5e5e5",
      }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>Campus Map</span>
        <span style={{ fontSize: 10, color: "#bbb", letterSpacing: "0.08em" }}>
          {totalLocations} nodes
        </span>
      </header>
      <div style={{ flex: 1, minHeight: 0 }}>{mapEl}</div>
    </div>
  );
}