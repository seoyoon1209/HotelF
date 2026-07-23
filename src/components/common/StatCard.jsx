// Stat card with a large number and a colored circular icon
function StatCard({ label, count, icon: Icon, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="mt-1 text-3xl font-semibold text-slate-900">{count}</div>
      </div>
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

export default StatCard;
