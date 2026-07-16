import { useState, useEffect } from "react";
import { getPaths } from "../api/axios";
import useLocationStore from "../store/useLocationStore";

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3.5 animate-pulse" style={{ borderBottom: "1px solid #F3F4F6" }}>
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#E5E7EB" }} />
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-36 rounded" style={{ background: "#E5E7EB" }} />
        <div className="h-2 w-20 rounded" style={{ background: "#F3F4F6" }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, i }) {
  const accentColors = ["#0F766E", "#111111", "#6B7280", "#0F766E"];
  return (
    <div className="flex flex-col justify-between p-5" style={{ borderRight: i < 3 ? "1px solid #E5E7EB" : "none" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>{label}</div>
      <div className="mt-2">
        <div style={{ fontSize: 28, fontWeight: 800, color: accentColors[i], lineHeight: 1, letterSpacing: "-0.03em", fontFamily: "system-ui, sans-serif" }}>{value}</div>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4, fontFamily: "system-ui, sans-serif" }}>{delta}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [page] = useState(1);
  const [limit] = useState(6);
  const [pathData, setPathData] = useState({ totalPaths: 0, totalPathsDistance: 0 });
  const { locations, loading, error, fetchLocations, totalLocations } = useLocationStore();

  useEffect(() => { fetchLocations(page, limit); }, [page]);

  useEffect(() => {
    const fetchTotalPath = async () => {
      try { const res = await getPaths(page, limit); setPathData({ totalPaths: res.data.totalPaths, totalPathsDistance: res.data.totalPathsDistance || 0 }); }
      catch (err) { console.error("Failed to fetch paths:" + err); }
    };
    fetchTotalPath();
  }, [page]);

  const avgPath = pathData.totalPaths > 0 ? (pathData.totalPathsDistance / pathData.totalPaths).toFixed(0) : 0;

  const STATS = [
    { label: "Locations", value: totalLocations.toString(), delta: "campus nodes" },
    { label: "Paths", value: pathData.totalPaths.toString(), delta: "connections" },
    { label: "Distance", value: `${pathData.totalPathsDistance}m`, delta: "total mapped" },
    { label: "Avg Path", value: `${avgPath}m`, delta: "per connection" },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F5F6F4", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 shrink-0" style={{ height: "48px", background: "#FFFFFF", borderBottom: "1px solid #E5E7EB" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#111111" }}>Overview</span>
        <div className="flex items-center gap-2">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34C759", display: "inline-block" }} />
          <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "system-ui, sans-serif" }}>All systems nominal</span>
        </div>
      </header>

      <div className="flex-1 p-8 flex flex-col gap-6">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111111", marginBottom: 4, letterSpacing: "-0.03em", fontFamily: "system-ui, sans-serif" }}>Campus Navigation</h1>
          <p style={{ fontSize: 13, color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>Manage locations, paths, and test routes across your campus.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12 }}>
          {STATS.map((s, i) => <StatCard key={s.label} {...s} i={i} />)}
        </div>

        {/* Bottom grid */}
        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 260px" }}>

          {/* Recent locations */}
          <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12 }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #E5E7EB" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111111", fontFamily: "system-ui, sans-serif" }}>Recent Locations</span>
              <a href="/locations" style={{ fontSize: 12, fontWeight: 600, color: "#0F766E", textDecoration: "none", fontFamily: "system-ui, sans-serif" }}>view all →</a>
            </div>

            <div className="px-5">
              {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

              {!loading && error && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <p style={{ fontSize: 12, color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>Failed to load locations.</p>
                  <button onClick={fetchLocations} style={{ fontSize: 12, fontWeight: 600, color: "#111111", border: "1px solid #111111", borderRadius: 8, padding: "6px 16px", background: "#FFFFFF", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>Try again</button>
                </div>
              )}

              {!loading && !error && locations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <p style={{ fontSize: 12, color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>No locations found.</p>
                  <a href="/locations" style={{ fontSize: 12, fontWeight: 600, color: "#111111", border: "1px solid #111111", borderRadius: 8, padding: "6px 16px", textDecoration: "none", display: "inline-block", fontFamily: "system-ui, sans-serif" }}>Add your first location →</a>
                </div>
              )}

              {!loading && !error && locations.map((loc, i) => (
                <div key={loc.id} className="flex items-center gap-3 py-3" style={{ borderBottom: i !== locations.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0F766E", flexShrink: 0 }} />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="truncate" style={{ fontSize: 13, fontWeight: 600, color: "#111111", fontFamily: "system-ui, sans-serif" }}>{loc.name}</span>
                    <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "system-ui, sans-serif" }}>{loc.type ?? "—"}</span>
                  </div>
                  <span className="ml-auto shrink-0" style={{ fontSize: 10, color: "#D1D5DB", fontFamily: "system-ui, sans-serif" }}>{loc.id?.slice(0, 8)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Graph health */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12 }}>
              <div className="px-5 py-3" style={{ borderBottom: "1px solid #E5E7EB" }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>Graph Health</span>
              </div>
              <div className="px-5">
                {[
                  { label: "Connectivity", val: "100%", ok: true },
                  { label: "Orphan nodes", val: "0", ok: true },
                  { label: "Dead ends", val: "2", ok: false },
                  { label: "Avg degree", val: "3.0", ok: true },
                ].map((r, i, arr) => (
                  <div key={r.label} className="flex items-center justify-between py-2.5" style={{ borderBottom: i !== arr.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                    <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: r.ok ? "#111111" : "#FF3B30", fontFamily: "system-ui, sans-serif" }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12 }}>
              <div className="px-5 py-3" style={{ borderBottom: "1px solid #E5E7EB" }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>Quick Links</span>
              </div>
              <div className="px-5">
                {[
                  { label: "Add a location", href: "/locations" },
                  { label: "Add a path", href: "/paths" },
                  { label: "Test a route", href: "/tester" },
                ].map((l, i, arr) => (
                  <a key={l.label} href={l.href} className="flex items-center justify-between py-2.5" style={{ borderBottom: i !== arr.length - 1 ? "1px solid #F3F4F6" : "none", textDecoration: "none", color: "#111111", fontSize: 13, fontWeight: 500, fontFamily: "system-ui, sans-serif" }}>
                    {l.label}
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3" style={{ opacity: 0.3 }}>
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
