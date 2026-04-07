import { useEffect, useState } from "react";
import MapLayout from "../components/MapLayout";
import useLocationStore from "../store/useLocationStore";
import useRouteStore from "../store/useRouteStore";

const fmt = (s) => {
  const m = Math.floor(s / 60),
    sec = Math.round(s % 60);
  return m === 0 ? `${sec}s` : sec > 0 ? `${m}m ${sec}s` : `${m}m`;
};

export default function NavigationTester() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const { locations, fetchLocations } = useLocationStore();
  const { findRoute, clearRoute, loading, error, result } = useRouteStore();

  useEffect(() => {
    fetchLocations(1, 100);
  }, []);

  const run = async () => {
    if (!from || !to) return;
    setSheetExpanded(false);
    await findRoute(from, to);
    setSheetExpanded(true);
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
    clearRoute();
  };

  const handleMarkerClick = (locId) => {
    if (!from) {
      setFrom(locId);
    } else if (!to && locId !== from) {
      setTo(locId);
    } else {
      setFrom(locId);
      setTo("");
      clearRoute();
    }
  };

  const fromName = locations.find((l) => l.id === from)?.name;
  const toName = locations.find((l) => l.id === to)?.name;

  const SHEET_COLLAPSED = 80;
  const SHEET_EXPANDED = 260;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        .nav-input {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 13px;
          color: #000;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          letter-spacing: 0.01em;
        }
        .nav-input::placeholder { color: #999; }

        .step-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          background: #f7f7f7;
          border: 1px solid #ececec;
          border-radius: 10px;
          padding: 10px 14px;
          cursor: default;
          transition: background 0.15s;
          min-width: 180px;
        }
        .step-chip:hover { background: #f0f0f0; }
        .step-chip.destination { border-color: #000; background: #000; }

        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: background 0.1s;
          flex-shrink: 0;
        }
        .icon-btn:hover { background: rgba(0,0,0,0.06); }

        .tile-btn {
          padding: 6px 11px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.06em;
          background: transparent;
          color: #666;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          text-transform: uppercase;
          transition: all 0.15s;
        }
        .tile-btn.active { background: #000; color: #fff; }

        .find-btn {
          background: #000;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0 20px;
          height: 38px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.04em;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: opacity 0.15s, transform 0.1s;
        }
        .find-btn:disabled { opacity: 0.3; cursor: default; }
        .find-btn:not(:disabled):hover { opacity: 0.85; }
        .find-btn:not(:disabled):active { transform: scale(0.97); }

        .zoom-btn {
          width: 38px;
          height: 38px;
          background: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 300;
          color: #333;
          transition: background 0.1s;
        }
        .zoom-btn:hover { background: #f5f5f5; }

        .steps-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
        .steps-scroll::-webkit-scrollbar { display: none; }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .slide-up { animation: slideUp 0.25s ease; }
      `}</style>
      {/* MAP CONTAINER */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 0,
        }}
      >
        <MapLayout
          route={result}
          from={from}
          to={to}
          onMarkerClick={handleMarkerClick}
        />
      </div>
      {/* ── TOP SEARCH BAR ── */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          right: 14,
          zIndex: 40,
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        {/* From / To card */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #e4e4e4",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          {/* From row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 14px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <svg
              viewBox="0 0 10 10"
              style={{ width: 10, height: 10, flexShrink: 0 }}
            >
              <circle cx="5" cy="5" r="5" fill="#000" />
            </svg>
            <select
              className="nav-input"
              style={{ appearance: "none", cursor: "pointer" }}
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                clearRoute();
              }}
            >
              <option value="">Choose starting point…</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {" "}
                  {l.name}{" "}
                </option>
              ))}{" "}
            </select>{" "}
            {from && (
              <button
                className="icon-btn"
                onClick={() => {
                  setFrom("");
                  clearRoute();
                }}
              >
                {" "}
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  style={{ width: 11, height: 11 }}
                >
                  {" "}
                  <path d="M1 1l10 10M11 1L1 11" />{" "}
                </svg>{" "}
              </button>
            )}{" "}
          </div>{" "}
          {/* Swap row */}{" "}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              height: 0,
            }}
          >
            {" "}
            <div
              style={{ flex: 1, height: "1px", background: "transparent" }}
            />{" "}
            <button
              onClick={swap}
              style={{
                position: "absolute",
                right: 14,
                top: -14,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#fff",
                border: "1px solid #e4e4e4",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                color: "#555",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                transition: "background 0.1s",
                zIndex: 1,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f5f5f5")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              title="Swap"
            >
              {" "}
              ⇅{" "}
            </button>{" "}
          </div>{" "}
          {/* To row */}{" "}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 14px",
            }}
          >
            {" "}
            <svg
              viewBox="0 0 10 10"
              style={{ width: 10, height: 10, flexShrink: 0 }}
            >
              {" "}
              <circle
                cx="5"
                cy="5"
                r="5"
                fill="#fff"
                stroke="#000"
                strokeWidth="2"
              />{" "}
            </svg>{" "}
            <select
              className="nav-input"
              style={{ appearance: "none", cursor: "pointer" }}
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                clearRoute();
              }}
            >
              {" "}
              <option value="">Choose destination…</option>{" "}
              {locations
                .filter((l) => l.id !== from)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {" "}
                    {l.name}{" "}
                  </option>
                ))}{" "}
            </select>{" "}
            {to && (
              <button
                className="icon-btn"
                onClick={() => {
                  setTo("");
                  clearRoute();
                }}
              >
                {" "}
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  style={{ width: 11, height: 11 }}
                >
                  {" "}
                  <path d="M1 1l10 10M11 1L1 11" />{" "}
                </svg>{" "}
              </button>
            )}{" "}
          </div>{" "}
        </div>{" "}
        {/* Find button */}{" "}
        <button
          className="find-btn"
          onClick={run}
          disabled={!from || !to || loading}
          style={{ marginTop: 6 }}
        >
          {" "}
          {loading ? "…" : "Go"}{" "}
        </button>{" "}
      </div>{" "}
      {/* ── TILE TOGGLE (top-right, below search) ── */}{" "}
      <div
        style={{
          position: "absolute",
          top: 108,
          right: 14,
          zIndex: 40,
          background: "#fff",
          border: "1px solid #e4e4e4",
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {["Map", "Satellite", "Dark"].map((s, i) => (
          <button
            key={s}
            className={`tile-btn${i === 0 ? " active" : ""}`}
            style={i > 0 ? { borderTop: "1px solid #ececec" } : {}}
          >
            {" "}
            {s}
          </button>
        ))}
      </div>
      {/* ── ZOOM CONTROLS ── */}{" "}
      <div
        style={{
          position: "absolute",
          right: 14,
          zIndex: 40,
          bottom: result ? SHEET_EXPANDED + 24 : SHEET_COLLAPSED + 24,
          transition: "bottom 0.3s ease",
          background: "#fff",
          border: "1px solid #e4e4e4",
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button className="zoom-btn">+</button>
        <div style={{ height: 1, background: "#ececec" }} />
        <button className="zoom-btn">−</button>
      </div>
      {/* ── ERROR TOAST ── */}
      {error && (
        <div
          style={{
            position: "absolute",
            top: 100,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 40,
            background: "#fff",
            border: "1px solid #000",
            borderLeft: "3px solid #000",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 12,
            color: "#000",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            whiteSpace: "nowrap",
          }}
        >
          {error}
        </div>
      )}
      {/* ── BOTTOM SHEET ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: "#fff",
          borderRadius: "18px 18px 0 0",
          border: "1px solid #e4e4e4",
          borderBottom: "none",
          boxShadow: "0 -6px 30px rgba(0,0,0,0.1)",
          transition: "height 0.3s cubic-bezier(0.4,0,0.2,1)",
          height: result ? SHEET_EXPANDED : SHEET_COLLAPSED,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "10px 0 6px",
            cursor: "pointer",
            flexShrink: 0,
          }}
          onClick={() => result && setSheetExpanded((e) => !e)}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: "#ddd",
            }}
          />
        </div>

        {/* Collapsed state */}
        {!result && (
          <div
            style={{
              padding: "4px 20px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#000" }}>
                Campus Navigator
              </div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                A* pathfinding · weighted graph
              </div>
            </div>
            <div
              style={{ fontSize: 10, color: "#bbb", letterSpacing: "0.06em" }}
            >
              1.4 m/s walking
            </div>
          </div>
        )}

        {/* Result state */}
        {result && (
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            className="slide-up"
          >
            {/* Stats row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 20px 12px",
                borderBottom: "1px solid #f0f0f0",
                flexShrink: 0,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#000",
                    marginBottom: 1,
                  }}
                >
                  {fromName} → {toName}
                </div>
                <div style={{ fontSize: 11, color: "#999" }}>
                  Best route found
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
                {[
                  { val: `${result.totalDistance.toFixed(0)}m`, label: "dist" },
                  {
                    val: fmt(result.estimatedWalkingTimeSeconds),
                    label: "walk",
                  },
                  { val: result.steps.length, label: "steps" },
                ].map(({ val, label }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: "#000",
                        lineHeight: 1,
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {val}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "#bbb",
                        marginTop: 2,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps scroll */}
            <div
              style={{
                padding: "12px 20px 16px",
                overflowX: "auto",
                display: "flex",
                gap: 8,
                flex: 1,
                alignItems: "center",
              }}
              className="steps-scroll"
            >
              {result.steps.map((s, i) => (
                <div
                  key={i}
                  className={`step-chip${i === result.steps.length - 1 ? " destination" : ""}`}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background:
                        i === result.steps.length - 1
                          ? "#fff"
                          : i === 0
                            ? "#000"
                            : "#ececec",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 500,
                        color:
                          i === result.steps.length - 1
                            ? "#000"
                            : i === 0
                              ? "#fff"
                              : "#666",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: i === result.steps.length - 1 ? "#fff" : "#000",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.from}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color:
                          i === result.steps.length - 1
                            ? "rgba(255,255,255,0.55)"
                            : "#999",
                        whiteSpace: "nowrap",
                        marginTop: 1,
                      }}
                    >
                      → {s.to} · {s.distance}m
                    </div>
                  </div>
                </div>
              ))}
              {/* Final destination chip */}
              <div className="step-chip destination">
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#fff",
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#fff",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {toName}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.5)",
                      whiteSpace: "nowrap",
                      marginTop: 1,
                    }}
                  >
                    Destination
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
