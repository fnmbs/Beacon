export default function FacultyCard({ faculty, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-lg cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group"
      style={{
        background: "#16181d",
        border: "1px solid #1f2230",
        color: "#f3f4f6",
      }}
    >
      {/* Header with Code and Icon */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-semibold w-fit"
          style={{ background: "rgba(96, 165, 250, 0.1)", color: "#60a5fa" }}
        >
          <span className="text-xs">🏢</span>
          {faculty.code}
        </div>
      </div>

      {/* Faculty Name */}
      <h3 className="font-semibold text-[14px] mb-2 line-clamp-2">
        {faculty.name}
      </h3>

      {/* Email with Icon */}
      <div
        className="flex items-center gap-2 text-[11px] mb-4"
        style={{ color: "#9ca3af" }}
      >
        <span className="text-xs opacity-60">✉️</span>
        <span className="truncate">{faculty.email}</span>
      </div>

      {/* Stats Row */}
      <div
        className="flex gap-3 pt-4"
        style={{ borderTop: "1px solid #1f2230" }}
      >
        {/* Building Info */}
        <div className="flex-1 min-w-0">
          <div
            className="text-[9px] uppercase tracking-wider"
            style={{ color: "#4b5563" }}
          >
            Building
          </div>
          <div className="text-[12px] mt-1.5 truncate font-medium">
            {faculty.building_name ? (
              <span style={{ color: "#10b981" }}>
                🏛️ {faculty.building_name}
              </span>
            ) : (
              <span style={{ color: "#6b7280" }}>—</span>
            )}
          </div>
        </div>
        {/* Established Year */}
        <div className="flex-1 min-w-0">
          <div
            className="text-[9px] uppercase tracking-wider"
            style={{ color: "#4b5563" }}
          >
            Established
          </div>
          <div className="text-[12px] mt-1.5 truncate font-medium">
            {faculty.established_year ? (
              <span style={{ color: "#f59e0b" }}>
                📅 {faculty.established_year}
              </span>
            ) : (
              <span style={{ color: "#6b7280" }}>—</span>
            )}
          </div>
        </div>
      </div>

      {/* Click indicator */}
      <div
        className="mt-3 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-right"
        style={{ color: "#4b5563" }}
      >
        Click to view details →
      </div>
    </div>
  );
}
