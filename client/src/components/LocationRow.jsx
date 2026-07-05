export default function LocationRow({ loc, isLast, onEdit, onDelete }) {
  return (
    <div className="group grid px-5 py-3 items-center transition-colors hover:bg-[#fafafa]"
      style={{ gridTemplateColumns: "0.5fr 100px 300px 80px", borderBottom: isLast ? "none" : "1px solid #f0f0f0" }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{loc.name}</span>
      <span>
        {loc.type ? (
          <span style={{ fontSize: 11, padding: "2px 8px", background: "#f5f5f5", border: "1px solid #e5e5e5", borderRadius: 4, color: "#555" }}>{loc.type}</span>
        ) : <span style={{ color: "#bbb" }}>—</span>}
      </span>
      <span className="font-mono" style={{ fontSize: 11, color: "#999" }}>{loc.id}</span>
      <div className="flex gap-1.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(loc)} style={{ padding: "3px 10px", fontSize: 11, color: "#555", border: "1px solid #e5e5e5", borderRadius: 4, background: "#fff", cursor: "pointer" }}>Edit</button>
        <button onClick={() => onDelete(loc.id)} style={{ padding: "3px 10px", fontSize: 11, color: "#d32f2f", border: "1px solid #d32f2f", borderRadius: 4, background: "#fff", cursor: "pointer" }}>Del</button>
      </div>
    </div>
  );
}