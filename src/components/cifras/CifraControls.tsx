"use client"

import { getTransposedKey } from "@/lib/transpose"

interface CifraControlsProps {
  originalKey: string
  transposeSemitones: number
  onTranspose: (semitones: number) => void
  fontSize: number
  onFontSize: (size: number) => void
  autoScroll: boolean
  onAutoScroll: (on: boolean) => void
  scrollSpeed: number
  onScrollSpeed: (speed: number) => void
}

export function CifraControls({
  originalKey,
  transposeSemitones,
  onTranspose,
  fontSize,
  onFontSize,
  autoScroll,
  onAutoScroll,
  scrollSpeed,
  onScrollSpeed,
}: CifraControlsProps) {
  const currentKey = getTransposedKey(originalKey, transposeSemitones)

  return (
    <div className="sticky top-14 z-30 bg-[#0a0714]/95 backdrop-blur-md border-b border-white/5 py-3 -mx-4 px-4 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Transposição */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Tom</span>
          <button
            onClick={() => onTranspose(transposeSemitones - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white text-sm font-bold transition-colors"
          >
            −
          </button>
          <span className="text-sm font-bold font-mono text-violet-300 w-8 text-center">{currentKey}</span>
          <button
            onClick={() => onTranspose(transposeSemitones + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white text-sm font-bold transition-colors"
          >
            +
          </button>
          {transposeSemitones !== 0 && (
            <button
              onClick={() => onTranspose(0)}
              className="text-[10px] text-slate-500 hover:text-violet-300 transition-colors ml-1"
            >
              Original ({originalKey})
            </button>
          )}
        </div>

        <div className="w-px h-5 bg-white/10" />

        {/* Font size */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Fonte</span>
          <button
            onClick={() => onFontSize(Math.max(10, fontSize - 1))}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white text-sm font-bold transition-colors"
          >
            −
          </button>
          <span className="text-xs text-slate-400 w-5 text-center">{fontSize}</span>
          <button
            onClick={() => onFontSize(Math.min(22, fontSize + 1))}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white text-sm font-bold transition-colors"
          >
            +
          </button>
        </div>

        <div className="w-px h-5 bg-white/10" />

        {/* Auto-scroll */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAutoScroll(!autoScroll)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              autoScroll
                ? "bg-violet-600 text-white"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {autoScroll ? "⏸ Scroll" : "▶ Scroll"}
          </button>
          {autoScroll && (
            <input
              type="range"
              min={1}
              max={10}
              value={scrollSpeed}
              onChange={(e) => onScrollSpeed(Number(e.target.value))}
              className="w-16 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-violet-500"
            />
          )}
        </div>
      </div>
    </div>
  )
}
