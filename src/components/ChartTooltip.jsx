export default function ChartTooltip({ active, payload, label, unit = '', labelPrefix = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass !rounded-xl px-3 py-2 text-sm !shadow-card">
      <p className="mb-1 text-xs font-semibold text-muted">
        {labelPrefix}
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-ink">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span className="text-muted">{p.name}</span>
          <span className="ml-auto pl-3 font-display font-semibold tabular-nums">
            {p.value}
            {unit}
          </span>
        </p>
      ))}
    </div>
  )
}
