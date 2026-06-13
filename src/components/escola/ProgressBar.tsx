interface ProgressBarProps {
  completed: number
  total: number
  showLabel?: boolean
  size?: "sm" | "md"
}

export function ProgressBar({ completed, total, showLabel = true, size = "md" }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
  const height = size === "sm" ? "h-1.5" : "h-2"

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400">
            {completed}/{total} lições
          </span>
          <span className="text-xs font-semibold text-violet-400">{pct}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800 rounded-full ${height} overflow-hidden`}>
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
