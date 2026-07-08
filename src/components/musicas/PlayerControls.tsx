"use client"

const SPEEDS = [0.5, 0.75, 1, 1.25] as const

interface PlayerControlsProps {
  speed: number
  onSpeedChange: (s: number) => void
  introSecs: number
  onIntroSecsChange: (v: number) => void
  view: "both" | "tab"
  onViewChange: (v: "both" | "tab") => void
  bpm: number
  tom: string
}

export function PlayerControls({
  speed,
  onSpeedChange,
  introSecs,
  onIntroSecsChange,
  view,
  onViewChange,
  bpm,
  tom,
}: PlayerControlsProps) {
  return (
    <div className="bg-[#120d24] border border-white/5 rounded-xl p-4 space-y-4">
      {/* Info */}
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="bg-violet-600/20 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-full">
          {tom}
        </span>
        <span>{bpm} BPM</span>
      </div>

      {/* Speed */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Velocidade</p>
        <div className="flex gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                speed === s
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {s === 1 ? "1x" : `${s}x`}
            </button>
          ))}
        </div>
      </div>

      {/* Intro offset */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-500">Início da música</p>
          <span className="text-xs text-violet-300 font-mono">{introSecs.toFixed(1)}s</span>
        </div>
        <input
          type="range"
          min={0}
          max={120}
          step={0.5}
          value={introSecs}
          onChange={(e) => onIntroSecsChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-violet-500"
        />
        <p className="text-xs text-slate-600 mt-1">
          Ajuste até o cursor sincronizar com a 1ª medida
        </p>
      </div>

      {/* View toggle */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Vista</p>
        <div className="flex gap-1">
          {(["both", "tab"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                view === v
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {v === "both" ? "Partitura + Tab" : "Só Tab"}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
