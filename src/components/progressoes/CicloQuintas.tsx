"use client"

import { useState } from "react"
import { campoHarmonico } from "@/lib/teoria"

const QUINTAS = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"]
const RELATIVAS = ["Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "Bbm", "Fm", "Cm", "Gm", "Dm"]
const TO_NORM: Record<string, string> = { Db: "C#", Ab: "G#", Eb: "D#", Bb: "A#", Gb: "F#" }

export function CicloQuintas() {
  const [selected, setSelected] = useState<number | null>(null)

  const cx = 160
  const cy = 160
  const rOuter = 130
  const rInner = 95
  const rLabel = 65

  const campo = selected !== null
    ? campoHarmonico(TO_NORM[QUINTAS[selected]] ?? QUINTAS[selected], "major")
    : null

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">
        Clique em uma nota para ver o campo harmônico. As quintas ascendentes vão no sentido horário.
      </p>

      <div className="flex justify-center">
        <svg viewBox="0 0 320 320" className="w-full max-w-[400px]" xmlns="http://www.w3.org/2000/svg">
          {/* Background circle */}
          <circle cx={cx} cy={cy} r={rOuter + 10} fill="#0a0714" stroke="#1e1b4b" strokeWidth={1} />

          {/* Outer ring — major keys */}
          {QUINTAS.map((nota, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180)
            const x = cx + rOuter * Math.cos(angle)
            const y = cy + rOuter * Math.sin(angle)
            const isSelected = selected === i

            return (
              <g key={`maj-${i}`} className="cursor-pointer" onClick={() => setSelected(i === selected ? null : i)}>
                <circle
                  cx={x} cy={y} r={18}
                  fill={isSelected ? "#7c3aed" : "#1e1b4b"}
                  stroke={isSelected ? "#a78bfa" : "#334155"}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <text x={x} y={y + 5} fontSize={12} fill={isSelected ? "white" : "#e2e8f0"} textAnchor="middle" fontWeight="bold">
                  {nota}
                </text>
              </g>
            )
          })}

          {/* Inner ring — relative minors */}
          {RELATIVAS.map((nota, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180)
            const x = cx + rInner * Math.cos(angle)
            const y = cy + rInner * Math.sin(angle)
            const isSelected = selected === i

            return (
              <g key={`min-${i}`}>
                <circle
                  cx={x} cy={y} r={14}
                  fill={isSelected ? "#4c1d95" : "#0f0a1e"}
                  stroke={isSelected ? "#7c3aed" : "#1e1b4b"}
                  strokeWidth={1}
                />
                <text x={x} y={y + 4} fontSize={9} fill={isSelected ? "#c4b5fd" : "#64748b"} textAnchor="middle">
                  {nota}
                </text>
              </g>
            )
          })}

          {/* Center label */}
          <text x={cx} y={cy - 5} fontSize={11} fill="#64748b" textAnchor="middle">Ciclo de</text>
          <text x={cx} y={cy + 10} fontSize={11} fill="#64748b" textAnchor="middle">Quintas</text>

          {/* Arrow indicators for ii-V-I if selected */}
          {selected !== null && (() => {
            const vIdx = selected
            const iiIdx = (selected + 7) % 12 // ii is a 5th below V which is 7 positions clockwise
            const iIdx = (selected + 1) % 12 // I is one position counter-clockwise from V? No...
            // Actually in cycle of fifths: I is at selected, V is one step clockwise
            // ii-V-I: ii is one step clockwise from V, V is one step clockwise from I
            // In the circle: selected=I, (selected+1)%12=V position? No...
            // Let's just show the selected key's campo
            return null
          })()}
        </svg>
      </div>

      {/* Campo do tom selecionado */}
      {campo && selected !== null && (
        <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-4">
          <p className="text-xs text-slate-500 mb-2">
            Campo harmônico de <span className="text-violet-300 font-bold">{QUINTAS[selected]} maior</span>
            {" "}(relativa: {RELATIVAS[selected]})
          </p>
          <div className="flex flex-wrap gap-2">
            {campo.map((c) => {
              const fnColor = c.fn === "Tônica" ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                : c.fn === "Dominante" ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                : "bg-sky-500/20 text-sky-300 border-sky-500/30"
              return (
                <div key={c.degree} className={`border rounded-lg px-3 py-2 text-center ${fnColor}`}>
                  <p className="text-[10px] opacity-60">{c.degree}</p>
                  <p className="text-sm font-bold font-mono">{c.example}</p>
                  <p className="text-[9px] opacity-50">{c.fn}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
