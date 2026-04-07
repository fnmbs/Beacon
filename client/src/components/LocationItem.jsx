export default function LocationItem({ loc }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#1a1c23] last:border-0">
      <span className={`w-2 h-2 rounded-full shrink ${loc.active ? "bg-emerald-500" : "bg-emerald-500"}`} />
      <div>
        <div className="text-sm font-medium text-gray-100">{loc.name}</div>
        <div className="text-xs text-gray-500 font-mono">#{loc.id}</div>
      </div>
    </div>
  );
}