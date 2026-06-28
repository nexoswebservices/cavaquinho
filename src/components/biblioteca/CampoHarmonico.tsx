"use client"

import { campoHarmonico } from "@/lib/teoria"
import type { Mode } from "@/lib/teoria"

const NOTAS_DISPLAY = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

const TO_NORM: Record<string, string> = {
  Eb: 'D#', Ab: 'G#', Bb: 'A#',
}

const DEGREE_COLOR: Record<string, string> = {
  I: 'border-violet-500/50 bg-violet-600/10 text-violet-200',
  ii: 'border-slate-500/30 bg-white/5 text-slate-300',
  iii: 'border-slate-500/30 bg-white/5 text-slate-300',
  IV: 'border-sky-500/40 bg-sky-600/10 text-sky-200',
  V: 'border-amber-500/40 bg-amber-600/10 text-amber-200',
  V7: 'border-amber-500/40 bg-amber-600/10 text-amber-200',
  vi: 'border-slate-500/30 bg-white/5 text-slate-300',
  vii: 'border-slate-500/30 bg-white/5 text-slate-300',
  i: 'border-violet-500/50 bg-violet-600/10 text-violet-200',
  iiiº: 'border-rose-500/30 bg-rose-600/5 text-rose-300',
  ivº: 'border-rose-500/30 bg-rose-600/5 text-rose-300',
  viiº: 'border-rose-500/30 bg-rose-600/5 text-rose-300',
  II: 'border-slate-500/30 bg-white/5 text-slate-300',
  III: 'border-slate-500/30 bg-white/5 text-slate-300',
  VI: 'border-slate-500/30 bg-white/5 text-slate-300',
  VII: 'border-slate-500/30 bg-white/5 text-slate-300',
}

function degreeColor(deg: string): string {
  return DEGREE_COLOR[deg] ?? 'border-slate-500/20 bg-white/5 text-slate-400'
}

interface CampoHarmonicoProps {
  nota: string
  mode: Mode
  onNotaChange: (nota: string) => void
  onModeChange: (mode: Mode) => void
}

export function CampoHarmonico({ nota, mode, onNotaChange, onModeChange }: CampoHarmonicoProps) {
  const normRoot = TO_NORM[nota] ?? nota
  const campo = campoHarmonico(normRoot, mode)

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-1.5">
          {NOTAS_DISPLAY.map((n) => (
            <button
              key={n}
              onClick={() => onNotaChange(n)}
              className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                nota === n
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["major", "minor"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {m === "major" ? "Maior" : "Menor"}
            </button>
          ))}
        </div>
      </div>

      {/* Campo */}
      <div>
        <p className="text-xs text-slate-500 mb-3">
          Campo harmônico de <span className="text-violet-300 font-medium">{nota} {mode === "major" ? "maior" : "menor"}</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {campo.map((c) => {
            const fnColor = c.fn === "Tônica" ? "bg-violet-500/20 text-violet-300"
              : c.fn === "Dominante" ? "bg-amber-500/20 text-amber-300"
              : "bg-sky-500/20 text-sky-300"
            return (
              <div
                key={c.degree}
                className={`border rounded-xl p-3 text-center ${degreeColor(c.degree)}`}
              >
                <p className="text-xs opacity-60 mb-0.5">{c.degree}</p>
                <p className="text-lg font-bold font-mono leading-none mb-1">{c.example}</p>
                <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mb-1 ${fnColor}`}>
                  {c.fn}
                </span>
                {c.tensions.length > 0 && (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {c.tensions.join(", ")}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
