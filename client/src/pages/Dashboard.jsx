import { useState, useEffect } from "react";
import { getPaths } from "../api/axios";
import useLocationStore from "../store/useLocationStore";

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3.5 animate-pulse" style={{ borderBottom: "1px solid #f0f0f0" }}>
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#e5e5e5" }} />
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-36 rounded" style={{ background: "#e5e5e5" }} />
        <div className="h-2 w-20 rounded" style={{ background: "#efefef" }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, delta }) {
  return (
    <div className="flex flex-col justify-between p-5" style={{ borderRight: "1px solid #e5e5e5" }}>
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999" }}>{label}</div>
      <div className="mt-2">
        <div style={{ fontSize: 28, fontWeight: 500, color: "#111", lineHeight: 1, letterSpacing: "-0.03em" }}>{value}</div>
        <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{delta}</div>
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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-8 shrink-0" style={{ height: "48px", borderBottom: "1px solid #e5e5e5" }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#111" }}>Overview</span>
        <div className="flex items-center gap-2">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#111", display: "inline-block" }} />
          <span style={{ fontSize: 10, color: "#999" }}>All systems nominal</span>
        </div>
      </header>

      <div className="flex-1 p-8 flex flex-col gap-8">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#111", marginBottom: 4, letterSpacing: "-0.03em" }}>Campus Navigation</h1>
          <p style={{ fontSize: 12, color: "#999" }}>Manage locations, paths, and test routes across your campus.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4" style={{ border: "1px solid #e5e5e5", borderRight: "none" }}>
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Bottom grid */}
        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 260px" }}>

          {/* Recent locations */}
          <div style={{ border: "1px solid #e5e5e5" }}>
            <div className="flex items-center justify-between px-5 py-2.5" style={{ borderBottom: "1px solid #e5e5e5" }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#111" }}>Recent Locations</span>
              <a href="/locations" style={{ fontSize: 11, color: "#999", textDecoration: "none" }}>view all →</a>
            </div>

            <div className="px-5">
              {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

              {!loading && error && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <p style={{ fontSize: 11, color: "#999" }}>Failed to load locations.</p>
                  <button onClick={fetchLocations} style={{ fontSize: 11, color: "#111", border: "1px solid #111", padding: "4px 12px", background: "none", cursor: "pointer" }}>Try again</button>
                </div>
              )}

              {!loading && !error && locations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <p style={{ fontSize: 11, color: "#999" }}>No locations found.</p>
                  <a href="/locations" style={{ fontSize: 11, color: "#111", border: "1px solid #111", padding: "4px 12px", textDecoration: "none" }}>Add your first location →</a>
                </div>
              )}

              {!loading && !error && locations.map((loc, i) => (
                <div key={loc.id} className="flex items-center gap-3 py-3" style={{ borderBottom: i !== locations.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#111", flexShrink: 0, opacity: 0.15 }} />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="truncate" style={{ fontSize: 13, color: "#111", fontWeight: 500 }}>{loc.name}</span>
                    <span style={{ fontSize: 11, color: "#999" }}>{loc.type ?? "—"}</span>
                  </div>
                  <span className="ml-auto shrink-0" style={{ fontSize: 10, color: "#bbb" }}>{loc.id?.slice(0, 8)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Graph health */}
            <div style={{ border: "1px solid #e5e5e5" }}>
              <div className="px-5 py-2.5" style={{ borderBottom: "1px solid #e5e5e5" }}>
                <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999" }}>Graph Health</span>
              </div>
              <div className="px-5">
                {[
                  { label: "Connectivity", val: "100%", ok: true },
                  { label: "Orphan nodes", val: "0", ok: true },
                  { label: "Dead ends", val: "2", ok: false },
                  { label: "Avg degree", val: "3.0", ok: true },
                ].map((r, i, arr) => (
                  <div key={r.label} className="flex items-center justify-between py-2.5" style={{ borderBottom: i !== arr.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                    <span style={{ fontSize: 12, color: "#888" }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: r.ok ? "#111" : "#d32f2f" }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div style={{ border: "1px solid #e5e5e5" }}>
              <div className="px-5 py-2.5" style={{ borderBottom: "1px solid #e5e5e5" }}>
                <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999" }}>Quick Links</span>
              </div>
              <div className="px-5">
                {[
                  { label: "Add a location", href: "/locations" },
                  { label: "Add a path", href: "/paths" },
                  { label: "Test a route", href: "/tester" },
                ].map((l, i, arr) => (
                  <a key={l.label} href={l.href} className="flex items-center justify-between py-2.5" style={{ borderBottom: i !== arr.length - 1 ? "1px solid #f0f0f0" : "none", textDecoration: "none", color: "#111", fontSize: 12 }}>
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