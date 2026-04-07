export function StatCard({ label, value, delta }) {
  return (
    <div className="overflow-hidden rounded-xl p-5 border border-[#1a1c23] bg-[#111217] transition-all duration-200 hover:bg-[#13151c] hover:border-[#2a2d38] hover:-translate-y-0.5 group cursor-default w-full">
      {/* accent line */}
      
      <div className="font-mono text-[10px] mb-3 tracking-widest uppercase text-gray-500">
        {label}
      </div>

      <div className="font-mono text-2xl font-semibold tracking-tight mb-1 text-gray-50">
        {value}
      </div>

      <div className="font-mono text-[11px] text-gray-400">{delta}</div>
    </div>
  );
}
