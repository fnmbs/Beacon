export default function LecturerCard({ lecturer, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 px-4 py-3.5 rounded-lg w-full text-left transition-all hover:shadow-sm"
      style={{ background: "#fff", border: "1px solid #e5e5e5" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0, background: "#f0f0f0", color: "#666" }}>
        {lecturer.name?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 13, fontWeight: 500, color: "#111" }} className="truncate">{lecturer.name}</div>
        <div style={{ fontSize: 11, color: "#888" }} className="truncate">{lecturer.department_name ?? "No department"}</div>
      </div>
      <span style={{ fontSize: 11, color: "#bbb" }} className="truncate">{lecturer.email}</span>
    </button>
  );
}