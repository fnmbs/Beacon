export default function LocationRow({ loc, isLast, onEdit, onDelete }) {
  return (
    <div className="group grid px-5 py-3.5 items-center transition-colors hover:bg-[#F9FAFB]"
      style={{ gridTemplateColumns: "0.5fr 100px 300px 80px", borderBottom: isLast ? "none" : "1px solid #F3F4F6", fontFamily: "system-ui, sans-serif" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#111111" }}>{loc.name}</span>
      <span>
        {loc.type ? (
          <span style={{ fontSize: 11, padding: "3px 10px", background: "#EAF7F4", borderRadius: 999, color: "#0F766E", fontWeight: 600 }}>{loc.type}</span>
        ) : <span style={{ color: "#D1D5DB" }}>—</span>}
      </span>
      <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace" }}>{loc.id?.slice(0, 16)}</span>
      <div className="flex gap-1.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(loc)} style={{ padding: "4px 12px", fontSize: 12, fontWeight: 500, color: "#111111", border: "1px solid #D8DEDA", borderRadius: 6, background: "#FFFFFF", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>Edit</button>
        <button onClick={() => onDelete(loc.id)} style={{ padding: "4px 12px", fontSize: 12, fontWeight: 500, color: "#FF3B30", border: "1px solid #FF3B30", borderRadius: 6, background: "#FFFFFF", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>Del</button>
      </div>
    </div>
  );
}
