"use client"

import { useEffect, useRef, useMemo } from "react"
import { initSampler, playChord } from "@/lib/sampler"

const SHARP_NOTES = new Set(["C#", "D#", "F#", "G#", "A#"])
const FLAT_MAP: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" }
const TO_SHARP: Record<string, string> = { ...FLAT_MAP }

function noteToVexKey(note: string, octave: number) {
  const n = FLAT_MAP[note] ?? note
  const base = n.replace("#", "")
  const hasSharp = SHARP_NOTES.has(n)
  return { key: `${base.toLowerCase()}/${octave}`, accidental: hasSharp ? "#" as const : undefined }
}

interface AcordeMedida {
  batida: number
  acorde: string
  duration: string
  notas: string[]
  tab: number[]
}

interface Medida {
  numero: number
  letra: string
  acordes: AcordeMedida[]
}

interface PartituraCompletaProps {
  medidas: Medida[]
  activeMeasure: number
  view: "both" | "tab"
  compasso: string
}

const MEASURES_PER_ROW = 4

// Strings top-to-bottom = D5, B4, G4, D4 (matches cavaquinho)
const TUNING = ["D5", "B4", "G4", "D4"]
const STRING_GAP = 15
const TAB_TOP = 8
const TAB_H = TAB_TOP * 2 + (TUNING.length - 1) * STRING_GAP + 14

interface RowProps {
  medidas: Medida[]
  rowStart: number
  activeInRow: number
  showPartitura: boolean
  isFirstRow: boolean
  compasso: string
}

function PartituraRow({ medidas, rowStart, activeInRow, showPartitura, isFirstRow, compasso }: RowProps) {
  const vfRef = useRef<HTMLDivElement>(null)
  const n = medidas.length
  const beatsPerMeasure = compasso === "3/4" ? 3 : 4

  // Render VexFlow — only re-runs when medidas or view change, NOT activeMeasure
  useEffect(() => {
    if (!showPartitura) return
    const container = vfRef.current
    if (!container) return
    let mounted = true

    async function render() {
      const VF = await import("vexflow")
      if (!mounted || !container) return
      container.innerHTML = ""

      const totalW = container.clientWidth || 800
      const staveH = 100
      const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG)
      renderer.resize(totalW, staveH)
      const ctx = renderer.getContext()

      let x = 0
      for (let i = 0; i < medidas.length; i++) {
        const mw = totalW / n
        const stave = new VF.Stave(x, 10, mw)
        if (i === 0 && isFirstRow) {
          stave.addClef("treble")
          stave.addTimeSignature(compasso)
        }
        stave.setContext(ctx).draw()

        const vexNotes = medidas[i].acordes.map((a) => {
          const root = a.notas[0] ?? "C"
          const { key, accidental } = noteToVexKey(root, 4)
          const sn = new VF.StaveNote({ keys: [key], duration: a.duration || "q" })
          if (accidental) sn.addModifier(new VF.Accidental(accidental))
          return sn
        })

        if (vexNotes.length > 0) {
          const voice = new VF.Voice({ numBeats: beatsPerMeasure, beatValue: 4 }).setMode(VF.Voice.Mode.SOFT)
          voice.addTickables(vexNotes)
          const fmtW = mw - (i === 0 && isFirstRow ? 65 : 15)
          new VF.Formatter().joinVoices([voice]).format([voice], fmtW)
          voice.draw(ctx, stave)
        }

        x += mw
      }
    }

    render()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medidas, showPartitura, isFirstRow, compasso, n, beatsPerMeasure])

  async function handlePlay(notas: string[]) {
    await initSampler()
    const pairs: [string, number][] = notas.map((n) => [TO_SHARP[n] ?? n, 4])
    playChord(pairs)
  }

  return (
    <div className="relative">
      {/* Active column highlight — pure CSS, no VexFlow re-render */}
      {activeInRow >= 0 && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            left: `${(activeInRow / n) * 100}%`,
            width: `${(1 / n) * 100}%`,
            background: "rgba(109,40,217,0.08)",
            borderLeft: "1px solid rgba(139,92,246,0.35)",
            borderRight: "1px solid rgba(139,92,246,0.35)",
          }}
        />
      )}

      {/* Chord names + measure numbers */}
      <div className="flex border-t border-white/5">
        {medidas.map((m, i) => (
          <div
            key={i}
            className="flex-1 min-w-0 px-2 pt-1.5 pb-0.5"
            style={{ borderRight: i < n - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}
          >
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[9px] text-slate-600 font-mono mr-0.5">M{rowStart + i + 1}</span>
              {m.acordes.map((a, j) => (
                <button
                  key={j}
                  onClick={() => handlePlay(a.notas)}
                  className="text-[11px] font-mono text-violet-400 hover:text-violet-200 hover:bg-violet-600/20 px-1 rounded transition-colors leading-none py-0.5"
                >
                  {a.acorde}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Partitura VexFlow */}
      {showPartitura && (
        <div ref={vfRef} className="w-full" style={{ minHeight: 100 }} />
      )}

      {/* 4-string TAB */}
      <svg
        viewBox={`0 0 800 ${TAB_H}`}
        preserveAspectRatio="none"
        className="w-full block"
        style={{ height: TAB_H * 1.1 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* TAB label */}
        <text x={3} y={TAB_TOP + ((TUNING.length - 1) * STRING_GAP) / 2 + 4} fontSize={7} fill="#475569" fontWeight="bold">TAB</text>

        {/* 4 string lines spanning full width */}
        {TUNING.map((_, si) => {
          const y = TAB_TOP + si * STRING_GAP
          return <line key={`s${si}`} x1={18} y1={y} x2={800} y2={y} stroke="#1e293b" strokeWidth={0.7} />
        })}

        {/* Vertical bar lines */}
        {Array.from({ length: n + 1 }, (_, bi) => {
          const bx = bi === 0 ? 18 : bi * (800 / n)
          return (
            <line
              key={`b${bi}`}
              x1={bx} y1={TAB_TOP - 3}
              x2={bx} y2={TAB_TOP + (TUNING.length - 1) * STRING_GAP + 3}
              stroke="#334155"
              strokeWidth={bi === 0 ? 1.5 : 0.8}
            />
          )
        })}

        {/* Fret numbers — all 4 strings per chord */}
        {medidas.map((m, mi) => {
          const mxStart = mi === 0 ? 18 : mi * (800 / n)
          const mxEnd = (mi + 1) * (800 / n)
          const mw = mxEnd - mxStart
          const nc = m.acordes.length || 1
          return m.acordes.map((a, ci) => {
            const cx = mxStart + ((ci + 0.5) / nc) * mw
            return a.tab.map((fret, si) => {
              const y = TAB_TOP + si * STRING_GAP
              const isActive = mi === activeInRow
              return (
                <g key={`${mi}-${ci}-${si}`}>
                  <rect x={cx - 7} y={y - 6} width={14} height={13} fill="#0a0714" rx={2} />
                  <text
                    x={cx} y={y + 4}
                    fontSize={9}
                    fill={isActive ? "#a78bfa" : "#64748b"}
                    textAnchor="middle"
                    fontFamily="monospace"
                    fontWeight={isActive ? "bold" : "normal"}
                  >
                    {fret}
                  </text>
                </g>
              )
            })
          })
        })}
      </svg>

      {/* Lyrics */}
      <div className="flex border-b border-white/5 mb-1">
        {medidas.map((m, i) => (
          <div
            key={i}
            className="flex-1 min-w-0 px-2 pb-1.5"
            style={{ borderRight: i < n - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}
          >
            {m.letra && (
              <p className="text-[11px] text-slate-400 truncate italic leading-tight">{m.letra}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PartituraCompleta({ medidas, activeMeasure, view, compasso }: PartituraCompletaProps) {
  const rows = useMemo(() => {
    const result: Medida[][] = []
    for (let i = 0; i < medidas.length; i += MEASURES_PER_ROW) {
      result.push(medidas.slice(i, i + MEASURES_PER_ROW))
    }
    return result
  }, [medidas])

  const activeRowIdx = activeMeasure >= 0 ? Math.floor(activeMeasure / MEASURES_PER_ROW) : -1
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (activeRowIdx >= 0 && rowRefs.current[activeRowIdx]) {
      rowRefs.current[activeRowIdx]?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [activeRowIdx])

  return (
    <div className="rounded-xl border border-white/5 bg-[#080512] overflow-hidden">
      {rows.map((rowMedidas, ri) => {
        const rowStart = ri * MEASURES_PER_ROW
        const activeInRow =
          activeMeasure >= rowStart && activeMeasure < rowStart + rowMedidas.length
            ? activeMeasure - rowStart
            : -1

        return (
          <div key={ri} ref={(el) => { rowRefs.current[ri] = el }}>
            <PartituraRow
              medidas={rowMedidas}
              rowStart={rowStart}
              activeInRow={activeInRow}
              showPartitura={view === "both"}
              isFirstRow={ri === 0}
              compasso={compasso}
            />
          </div>
        )
      })}
    </div>
  )
}
