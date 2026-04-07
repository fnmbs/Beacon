import { useState, useEffect } from "react";
import { getLocations, getPaths } from "../api/axios";
import useLocationStore from "../store/useLocationStore";

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-4 animate-pulse" style={{ borderBottom: "1px solid #e5e5e5" }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#e5e5e5" }} />
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-36 rounded" style={{ background: "#e5e5e5" }} />
        <div className="h-2.5 w-24 rounded" style={{ background: "#efefef" }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, delta }) {
  return (
    <div
      className="flex flex-col justify-between p-6"
      style={{ border: "1px solid #000", borderRight: "none" }}
    >
      <div style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", opacity: 0.35 }}>
        {label}
      </div>
      <div>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "36px", fontWeight: 400, color: "#000", lineHeight: 1, marginBottom: "6px" }}>
          {value}
        </div>
        <div style={{ fontSize: "10px", color: "#000", opacity: 0.4, letterSpacing: "0.04em" }}>
          {delta}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [page] = useState(1);
  const [limit] = useState(6);
  const [totalPaths, setTotalPaths] = useState(0);
  const { locations, loading, error, fetchLocations, totalLocations } = useLocationStore();

  useEffect(() => { fetchLocations(page, limit); }, [page]);

  useEffect(() => {
    const fetchTotalPath = async () => {
      try {
        const res = await getPaths(page, limit);
        setTotalPaths(res.data.totalPaths);
      } catch (err) {
        console.error("Failed to fetch paths:" + err);
      }
    };
    fetchTotalPath();
  }, [page]);

  const STATS = [
    { label: "Locations", value: totalLocations.toString(), delta: "campus nodes" },
    { label: "Paths", value: totalPaths.toString(), delta: "connections" },
    { label: "Distance", value: "0m", delta: "total mapped" },
    { label: "Avg Path", value: "0m", delta: "per connection" },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#fff", fontFamily: "'Instrument Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');`}</style>

      {/* Top bar */}
      <header className="flex items-center justify-between px-8 shrink-0" style={{ height: "52px", borderBottom: "1px solid #000" }}>
        <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", color: "#000" }}>Overview</span>
        <div className="flex items-center gap-2">
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#000", display: "inline-block" }} />
          <span style={{ fontSize: "10px", letterSpacing: "0.08em", color: "#000", opacity: 0.4 }}>All systems nominal</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-8 flex flex-col gap-8">

        {/* Title */}
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "28px", fontWeight: 400, color: "#000", marginBottom: "6px", letterSpacing: "0.01em" }}>
            Campus Navigation
          </h1>
          <p style={{ fontSize: "11px", color: "#000", opacity: 0.4, letterSpacing: "0.04em" }}>
            Manage locations, paths, and test routes across your campus.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Bottom grid */}
        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 260px" }}>

          {/* Recent locations */}
          <div style={{ border: "1px solid #000" }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #000" }}>
              <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", color: "#000" }}>Recent Locations</span>
              <a href="/locations" className="hover:opacity-100 transition-opacity" style={{ fontSize: "10px", color: "#000", opacity: 0.4, letterSpacing: "0.06em", textDecoration: "none" }}>
                view all →
              </a>
            </div>

            <div className="px-5">
              {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

              {!loading && error && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <p style={{ fontSize: "11px", color: "#000", opacity: 0.4 }}>Failed to load locations.</p>
                  <button onClick={fetchLocations} style={{ fontSize: "10px", color: "#000", border: "1px solid #000", padding: "4px 12px", background: "none", cursor: "pointer", letterSpacing: "0.06em" }}>
                    Try again
                  </button>
                </div>
              )}

              {!loading && !error && locations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <p style={{ fontSize: "11px", color: "#000", opacity: 0.4 }}>No locations found.</p>
                  <a href="/locations" style={{ fontSize: "10px", color: "#000", border: "1px solid #000", padding: "4px 12px", textDecoration: "none", letterSpacing: "0.06em" }}>
                    Add your first location →
                  </a>
                </div>
              )}

              {!loading && !error && locations.map((loc, i) => (
                <div key={loc.id} className="flex items-center gap-3 py-3.5" style={{ borderBottom: i !== locations.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#000", flexShrink: 0, opacity: 0.2 }} />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="truncate" style={{ fontSize: "12px", color: "#000", fontWeight: 500, letterSpacing: "0.02em" }}>{loc.name}</span>
                    <span style={{ fontSize: "10px", color: "#000", opacity: 0.35, letterSpacing: "0.04em" }}>{loc.type ?? "—"}</span>
                  </div>
                  <span className="ml-auto shrink-0" style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#000", opacity: 0.2 }}>
                    {loc.id?.slice(0, 8)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Graph health */}
            <div style={{ border: "1px solid #000" }}>
              <div className="px-5 py-3" style={{ borderBottom: "1px solid #000" }}>
                <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", opacity: 0.35 }}>Graph Health</span>
              </div>
              <div className="px-5">
                {[
                  { label: "Connectivity", val: "100%", ok: true },
                  { label: "Orphan nodes", val: "0", ok: true },
                  { label: "Dead ends", val: "2", ok: false },
                  { label: "Avg degree", val: "3.0", ok: true },
                ].map((r, i, arr) => (
                  <div key={r.label} className="flex items-center justify-between py-3" style={{ borderBottom: i !== arr.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                    <span style={{ fontSize: "11px", color: "#000", opacity: 0.5 }}>{r.label}</span>
                    <span style={{ fontSize: "11px", fontWeight: 500, color: r.ok ? "#000" : "#cc0000" }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div style={{ border: "1px solid #000" }}>
              <div className="px-5 py-3" style={{ borderBottom: "1px solid #000" }}>
                <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.25em", textTransform: "uppercase", color: "#000", opacity: 0.35 }}>Quick Links</span>
              </div>
              <div className="px-5">
                {[
                  { label: "Add a location", href: "/locations" },
                  { label: "Add a path", href: "/paths" },
                  { label: "Test a route", href: "/tester" },
                ].map((l, i, arr) => (
                  <a key={l.label} href={l.href} className="flex items-center justify-between py-3 hover:opacity-50 transition-opacity"
                    style={{ borderBottom: i !== arr.length - 1 ? "1px solid #f0f0f0" : "none", textDecoration: "none", color: "#000", fontSize: "12px", letterSpacing: "0.02em" }}
                  >
                    {l.label}
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-3 h-3" style={{ opacity: 0.4 }}>
                      <path d="M2 6h8M6 2l4 4-4 4" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}