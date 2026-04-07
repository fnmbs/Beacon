export default function LocationRow({ loc, isLast, typeStyles, onEdit, onDelete }) {
  const ts = typeStyles[loc.type] || typeStyles.other;

  return (
    <div
      className="group grid px-5 py-3.5 items-center transition-colors hover:bg-[#16181d]"
      style={{
        gridTemplateColumns: "0.5fr 100px 300px 80px",
        borderBottom: isLast ? "none" : "1px solid #1f2230",
      }}
    >
      <span className="text-[13px] font-medium" style={{ color: "#e5e7eb" }}>
        {loc.name}
      </span>

      <span>
        {loc.type ? (
          <span
            className="mono text-[10px] px-2 py-0.5 rounded-md font-medium"
            style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}
          >
            {loc.type}
          </span>
        ) : (
          <span style={{ color: "#4b5563" }}>—</span>
        )}
      </span>

      <span className="mono text-[11px] truncate" style={{ color: "#6b7280" }}>
        {loc.id}
      </span>

      <div className="flex gap-1.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(loc)}
          className="px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors"
          style={{ background: "#16181d", color: "#9ca3af", border: "1px solid #1f2230" }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(loc.id)}
          className="px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors"
          style={{ background: "#3f1d1d", color: "#f87171", border: "1px solid #7f1d1d" }}
        >
          Del
        </button>
      </div>
    </div>
  );
}