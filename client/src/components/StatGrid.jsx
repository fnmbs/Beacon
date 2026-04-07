import { StatCard } from "./StatCard";

export default function StatsGrid({ stats }) {
  return (
    <div className="bg-[#0c0d10] mb-8 flex justify-between gap-6 items-center px-5 py-4 rounded-xl border border-[#1a1c23] shrink">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
