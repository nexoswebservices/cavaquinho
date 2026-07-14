"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import { BracoCavaquinho } from "@/components/progressoes/BracoCavaquinho"
import { initSampler, playChord } from "@/lib/sampler"

const FLAT_MAP: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" }
const TO_SHARP: Record<string, string> = { ...FLAT_MAP }
const SHARP_NOTES = new Set(["C#", "D#", "F#", "G#", "A#"])
const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

// Cavaquinho strings top→bottom in the TAB display: D5(0), B4(1), G4(2), D4(3)
const OPEN_CHROMAS = [
  CHROMATIC.indexOf("D"), // D5 — string 0 (top)
  CHROMATIC.indexOf("B"), // B4 — string 1
  CHROMATIC.indexOf("G"), // G4 — string 2
  CHROMATIC.indexOf("D"), // D4 — string 3 (bottom)
]
const STRING_LABELS = ["D5", "B4", "G4", "D4"]

// Maps a note name → the lowest-fret position on the cavaquinho neck
function noteToMelodyTab(noteName: string): { stringIdx: number; fret: number } | null {
  const sharp = TO_SHARP[noteName] ?? noteName
  const noteChroma = CHROMATIC.indexOf(sharp)
  if (noteChroma === -1) return null

  let best: { stringIdx: number; fret: number } | null = null
  OPEN_CHROMAS.forEach((openChroma, si) => {
    const fret = (noteChroma - openChroma + 12) % 12
    if (fret <= 12 && (!best || fret < best.fret)) best = { stringIdx: si, fret }
  })
  return best
}

function noteToVexKey(note: string, octave: number) {
  const n = FLAT_MAP[note] ?? note
  const base = n.replace("#", "")
  const hasSharp = SHARP_NOTES.has(n)
  return { key: `${base.toLowerCase()}/${octave}`, accidental: hasSharp ? "#" as const : undefined }
}

interface AcordeMedida { batida: number; acorde: string; duration: string; notas: string[]; tab: number[] }
interface Medida { numero: number; letra: string; acordes: AcordeMedida[] }
interface PartituraCompletaProps { medidas: Medida[]; activeMeasure: number; view: "both" | "tab"; compasso: string }

const MEASURES_PER_ROW = 4
const STRING_GAP = 18
const TAB_TOP = 10
const NUM_STRINGS = 4
const TAB_H = TAB_TOP * 2 + (NUM_STRINGS - 1) * STRING_GAP + 16

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
  // selectedChord: "mi-uniqueIdx" key, or null
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Close popup when clicking outside
  useEffect(() => {
    if (!selectedKey) return
    function handleClick() { setSelectedKey(null) }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [selectedKey])

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
      const staveH = 110
      const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG)
      renderer.resize(totalW, staveH)
      const ctx = renderer.getContext()

      let x = 0
      for (let i = 0; i < medidas.length; i++) {
        const mw = totalW / n
        const stave = new VF.Stave(x, 10, mw)
        if (i === 0 && isFirstRow) { stave.addClef("treble"); stave.addTimeSignature(compasso) }
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

      // Override VexFlow's default black with a light color for dark background
      const svgEl = container.querySelector("svg")
      if (svgEl) {
        svgEl.querySelectorAll<SVGElement>("path, rect, polygon, line").forEach((el) => {
          if (!el.getAttribute("fill") || el.getAttribute("fill") === "black" || el.getAttribute("fill") === "#000000") {
            el.setAttribute("fill", "#cbd5e1")
          }
          if (!el.getAttribute("stroke") || el.getAttribute("stroke") === "black" || el.getAttribute("stroke") === "#000000") {
            el.setAttribute("stroke", "#cbd5e1")
          }
        })
        svgEl.querySelectorAll<SVGTextElement>("text").forEach((el) => {
          const fill = el.getAttribute("fill")
          if (!fill || fill === "black" || fill === "#000000") el.setAttribute("fill", "#e2e8f0")
        })
      }
    }

    render()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medidas, showPartitura, isFirstRow, compasso, n, beatsPerMeasure])

  async function handlePlayChord(notas: string[]) {
    await initSampler()
    const pairs: [string, number][] = notas.map((n) => [TO_SHARP[n] ?? n, 4])
    playChord(pairs)
  }

  return (
    <div className="relative">
      {/* Active column highlight */}
      {activeInRow >= 0 && (
        <div className="absolute inset-0 pointer-events-none z-10" style={{
          left: `${(activeInRow / n) * 100}%`,
          width: `${(1 / n) * 100}%`,
          background: "rgba(109,40,217,0.10)",
          borderLeft: "2px solid rgba(139,92,246,0.45)",
          borderRight: "2px solid rgba(139,92,246,0.45)",
        }} />
      )}

      {/* Chord names — deduplicated consecutive repeats */}
      <div className="flex border-t border-white/5">
        {medidas.map((m, mi) => {
          const uniqueAcordes = m.acordes.filter(
            (a, ci) => ci === 0 || a.acorde !== m.acordes[ci - 1].acorde
          )
          return (
            <div key={mi} className="flex-1 min-w-0 px-2 pt-1.5 pb-0.5"
              style={{ borderRight: mi < n - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined }}>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[9px] text-slate-600 font-mono mr-0.5">M{rowStart + mi + 1}</span>
                {uniqueAcordes.map((a, ui) => {
                  const key = `${mi}-${ui}`
                  const isOpen = selectedKey === key
                  return (
                    <div key={ui} className="relative">
                      {/* BracoCavaquinho popup on click */}
                      {isOpen && (
                        <div
                          className="absolute bottom-full left-0 mb-2 z-50 bg-[#0d0920] border border-violet-500/40 rounded-xl p-3 shadow-2xl shadow-black/70"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-xs text-violet-300 font-mono text-center mb-2">{a.acorde}</p>
                          <BracoCavaquinho chordNotes={a.notas} voicingIndex={0} />
                          <button
                            onClick={() => handlePlayChord(a.notas)}
                            className="mt-2 w-full text-[10px] text-violet-400 hover:text-violet-200 py-1 rounded bg-violet-600/20 hover:bg-violet-600/30 transition-colors"
                          >
                            ▶ tocar
                          </button>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedKey(isOpen ? null : key)
                        }}
                        className={`text-[12px] font-mono px-1.5 py-0.5 rounded transition-colors leading-none ${
                          isOpen
                            ? "text-violet-100 bg-violet-600/30 ring-1 ring-violet-400/50"
                            : "text-violet-400 hover:text-violet-200 hover:bg-violet-600/20"
                        }`}
                      >
                        {a.acorde}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* VexFlow partitura */}
      {showPartitura && (
        <div ref={vfRef} className="w-full" style={{ minHeight: 110 }} />
      )}

      {/* Melody TAB — single note per beat, correct string */}
      <svg
        viewBox={`0 0 800 ${TAB_H}`}
        preserveAspectRatio="none"
        className="w-full block"
        style={{ height: TAB_H * 1.1 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* TAB label */}
        <text x={4} y={TAB_TOP + ((NUM_STRINGS - 1) * STRING_GAP) / 2 + 4}
          fontSize={7} fill="#4b5563" fontWeight="bold" fontFamily="monospace">TAB</text>

        {/* 4 string lines */}
        {STRING_LABELS.map((label, si) => {
          const y = TAB_TOP + si * STRING_GAP
          return (
            <g key={`s${si}`}>
              <text x={20} y={y + 3.5} fontSize={6} fill="#374151" textAnchor="end" fontFamily="monospace">
                {label}
              </text>
              <line x1={22} y1={y} x2={800} y2={y} stroke="#1e3a4a" strokeWidth={si === 0 ? 1.2 : 0.8} />
            </g>
          )
        })}

        {/* Vertical bar lines */}
        {Array.from({ length: n + 1 }, (_, bi) => {
          const bx = bi === 0 ? 22 : bi * (800 / n)
          return (
            <line key={`b${bi}`} x1={bx} y1={TAB_TOP - 4} x2={bx}
              y2={TAB_TOP + (NUM_STRINGS - 1) * STRING_GAP + 4}
              stroke="#374151" strokeWidth={bi === 0 ? 2 : 0.8} />
          )
        })}

        {/* Melody fret number per chord beat — one note on the right string */}
        {medidas.map((m, mi) => {
          const mxStart = mi === 0 ? 22 : mi * (800 / n)
          const mxEnd = (mi + 1) * (800 / n)
          const mw = mxEnd - mxStart
          const nc = m.acordes.length || 1
          const isActive = mi === activeInRow

          return m.acordes.map((a, ci) => {
            const cx = mxStart + ((ci + 0.5) / nc) * mw
            const root = a.notas[0] ?? "C"
            const pos = noteToMelodyTab(root)
            if (!pos) return null

            const y = TAB_TOP + pos.stringIdx * STRING_GAP
            const fretStr = String(pos.fret)
            const boxW = fretStr.length > 1 ? 17 : 13

            return (
              <g key={`${mi}-${ci}`}>
                <rect x={cx - boxW / 2} y={y - 6.5} width={boxW} height={14} fill="#060a12" rx={2} />
                <text
                  x={cx} y={y + 4}
                  fontSize={10}
                  fill={isActive ? "#a78bfa" : "#94a3b8"}
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontWeight={isActive ? "bold" : "normal"}
                >
                  {fretStr}
                </text>
              </g>
            )
          })
        })}
      </svg>

      {/* Lyrics */}
      <div className="flex border-b border-white/5 mb-1">
        {medidas.map((m, i) => (
          <div key={i} className="flex-1 min-w-0 px-2 pb-1.5"
            style={{ borderRight: i < n - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
            {m.letra && <p className="text-[11px] text-slate-400 truncate italic leading-tight">{m.letra}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PartituraCompleta({ medidas, activeMeasure, view, compasso }: PartituraCompletaProps) {
  const rows = useMemo(() => {
    const result: Medida[][] = []
    for (let i = 0; i < medidas.length; i += MEASURES_PER_ROW) result.push(medidas.slice(i, i + MEASURES_PER_ROW))
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
    <div className="rounded-xl border border-white/5 bg-[#070b11] divide-y divide-white/5">
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
