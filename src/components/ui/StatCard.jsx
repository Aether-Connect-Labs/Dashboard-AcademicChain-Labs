export default function StatCard({ label, value, hint, accent }) {
  return (
    <div className="glass-panel flex flex-col justify-between p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-slate-50">{value}</div>
        {accent && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
            {accent}
          </span>
        )}
      </div>
      {hint && <div className="mt-3 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

