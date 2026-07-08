"use client"

import { useRef } from "react"
import { PartituraView, type NoteData } from "@/components/partitura/PartituraView"
import { TablaturaView, type TabNote } from "@/components/partitura/TablaturaView"
import { initSampler, playChord } from "@/lib/sampler"

const TO_SHARP: Record<string, string> = {
  Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#",
}

interface AcordeMedida {
  batida: number
  acorde: string
  duration: string
  notas: string[]
  tab: number[]
}

interface MedidaCardProps {
  numero: number
  letra: string
  acordes: AcordeMedida[]
  isActive: boolean
  view: "both" | "tab"
}

export function MedidaCard({ numero, letra, acordes, isActive, view }: MedidaCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Build NoteData[] for VexFlow (root note of each chord)
  const vexNotes: NoteData[] = acordes.map((a) => {
    const rootRaw = a.notas[0] ?? "C"
    const root = TO_SHARP[rootRaw] ?? rootRaw
    const hasAccidental = root.includes("#")
    return {
      note: root,
      octave: 4,
      duration: a.duration ?? "q",
      accidental: hasAccidental ? "#" : undefined,
    }
  })

  // Build TabNote[] — show lowest string (D4, index 0) for each chord
  const tabNotes: TabNote[] = acordes.map((a) => ({
    string: 4, // D4 = thickest string = string 4
    fret: a.tab[0] ?? 0,
  }))

  async function handlePlayChord(notas: string[]) {
    await initSampler()
    const pairs: [string, number][] = notas.map((n) => [TO_SHARP[n] ?? n, 4])
    playChord(pairs)
  }

  return (
    <div
      ref={ref}
      data-medida={numero}
      className={`flex-shrink-0 w-52 rounded-xl border transition-all duration-200 overflow-hidden ${
        isActive
          ? "border-violet-500 shadow-lg shadow-violet-900/40 bg-[#1a1135]"
          : "border-white/5 bg-[#120d24]"
      }`}
    >
      {/* Header: medida number + acorde names */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <span className="text-xs text-slate-600 font-mono">M{numero}</span>
        <div className="flex gap-1 flex-wrap justify-end">
          {acordes.map((a, i) => (
            <button
              key={i}
              onClick={() => handlePlayChord(a.notas)}
              className="text-xs font-mono text-violet-300 hover:text-violet-200 hover:bg-violet-600/20 px-1.5 py-0.5 rounded transition-colors"
              title={`Tocar ${a.acorde}`}
            >
              {a.acorde}
            </button>
          ))}
        </div>
      </div>

      {/* Partitura VexFlow */}
      {view === "both" && vexNotes.length > 0 && (
        <div className="px-2">
          <PartituraView notes={vexNotes} width={192} />
        </div>
      )}

      {/* Tablatura */}
      {tabNotes.length > 0 && (
        <div className="px-2">
          <TablaturaView notes={tabNotes} width={192} />
        </div>
      )}

      {/* Letra */}
      {letra && (
        <div className="px-3 pb-3 pt-1">
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{letra}</p>
        </div>
      )}
    </div>
  )
}
