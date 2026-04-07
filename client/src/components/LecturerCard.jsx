export default function LecturerCard({ lecturer, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-5 rounded-xl w-full text-left transition-transform hover:scale-[1.01] bg-white border border-gray-200 shadow-sm"
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-gray-100 text-gray-700">
        {lecturer.name?.charAt(0).toUpperCase()}
      </div>

      <div className="flex flex-col gap-0.5 flex-1">
        <span className="text-[13px] font-medium truncate text-black">
          {lecturer.name}
        </span>
        <span className="text-[11px] truncate text-gray-500">
          {lecturer.department_name ?? "No department"}
        </span>
      </div>

      <span className="text-[11px] truncate text-gray-400">
        {lecturer.email}
      </span>

      <svg
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400"
      >
        <path d="M4 2l4 4-4 4" />
      </svg>
    </button>
  );
}