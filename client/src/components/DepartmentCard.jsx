export default function DepartmentCard({ department, onClick }) {
  return (
    <div onClick={onClick} className="p-4 rounded-lg cursor-pointer transition-all hover:shadow-sm"
      style={{ background: "#fff", border: "1px solid #e5e5e5", color: "#111" }}>
      <div className="flex items-start justify-between mb-3">
        <div style={{ fontSize: 11, fontWeight: 500, color: "#999" }}>{department.code}</div>
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{department.name}</h3>
      {department.email && <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>{department.email}</p>}
      <div style={{ borderTop: "1px solid #eee", paddingTop: 10, display: "flex", gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#bbb" }}>Faculty</div>
          <div style={{ fontSize: 12, marginTop: 2, color: department.faculty_name ? "#111" : "#bbb" }}>{department.faculty_name || "—"}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#bbb" }}>Building</div>
          <div style={{ fontSize: 12, marginTop: 2, color: department.building_name ? "#111" : "#bbb" }}>{department.building_name || "—"}</div>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: "#ccc", textAlign: "right", opacity: 0 }} className="group-hover:opacity-100 transition-opacity">Click to view details →</div>
    </div>
  );
}