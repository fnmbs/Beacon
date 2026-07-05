export default function FacultyCard({ faculty, onClick }) {
  return (
    <div onClick={onClick} className="p-4 rounded-lg cursor-pointer transition-all hover:shadow-sm"
      style={{ background: "#fff", border: "1px solid #e5e5e5", color: "#111" }}>
      <div className="flex items-start justify-between mb-3">
        <div style={{ fontSize: 11, fontWeight: 500, color: "#999" }}>{faculty.code}</div>
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{faculty.name}</h3>
      {faculty.email && <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>{faculty.email}</p>}
      <div style={{ borderTop: "1px solid #eee", paddingTop: 10, display: "flex", gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#bbb" }}>Building</div>
          <div style={{ fontSize: 12, marginTop: 2, color: faculty.building_name ? "#111" : "#bbb" }}>{faculty.building_name || "—"}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#bbb" }}>Est.</div>
          <div style={{ fontSize: 12, marginTop: 2, color: faculty.established_year ? "#111" : "#bbb" }}>{faculty.established_year || "—"}</div>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: "#ccc", textAlign: "right", opacity: 0 }} className="group-hover:opacity-100 transition-opacity">Click to view details →</div>
    </div>
  );
}