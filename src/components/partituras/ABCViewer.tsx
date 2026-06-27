"use client"

import { useState, useCallback, useRef } from "react"
import { parseABC, ABC_EXAMPLES } from "@/lib/abc-parser"
import { PartituraView } from "@/components/partitura/PartituraView"
import { TablaturaView } from "@/components/partitura/TablaturaView"
import { initSampler, isReady, playNote } from "@/lib/sampler"
import type { NoteData } from "@/components/partitura/PartituraView"
import type { TabNote } from "@/components/partitura/TablaturaView"

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const TUNING_MIDI = [62, 67, 71, 74]

function findOctave(note: string): number {
  const noteIdx = CHROMATIC.indexOf(note)
  for (let s = 0; s <= 3; s++) {
    for (let f = 0; f <= 7; f++) {
      if ((TUNING_MIDI[s] + f) % 12 === noteIdx) {
        return Math.floor((TUNING_MIDI[s] + f) / 12) - 1
      }
    }
  }
  return 4
}

const BPM_OPTIONS = [60, 80, 100, 120, 140]

export function ABCViewer() {
  const [abc, setAbc] = useState(ABC_EXAMPLES[0].abc)
  const [parsed, setParsed] = useState<{ notes: NoteData[]; tab: TabNote[]; title: string; ts: string; ks: string } | null>(null)
  const [playing, setPlaying] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState<number | undefined>(undefined)
  const [bpm, setBpm] = useState(120)
  const timersRef = useRef<number[]>([])

  const handleParse = useCallback(() => {
    const result = parseABC(abc)
    setParsed({ notes: result.notes, tab: result.tab, title: result.title, ts: result.timeSignature, ks: result.keySignature })
  }, [abc])

  const handlePlay = useCallback(async () => {
    if (!parsed || parsed.notes.length === 0) return
    if (!isReady()) await initSampler()

    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setPlaying(true)

    const interval = (60 / bpm) * 1000

    parsed.notes.forEach((n, i) => {
      const noteSharp = n.accidental === "#" ? n.note + "#" : n.note
      const chromNote = CHROMATIC.includes(noteSharp) ? noteSharp : n.note
      const t = window.setTimeout(() => {
        playNote(chromNote, n.octave)
        setHighlightIdx(i)
      }, i * interval)
      timersRef.current.push(t)
    })

    const endTimer = window.setTimeout(() => {
      setPlaying(false)
      setHighlightIdx(undefined)
      timersRef.current = []
    }, parsed.notes.length * interval + 300)
    timersRef.current.push(endTimer)
  }, [parsed, bpm])

  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-sm">
        Cole ou escreva notação ABC para visualizar a partitura com tablatura e ouvir com som real de cavaquinho.
      </p>

      {/* Exemplos */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Exemplos</p>
        <div className="flex flex-wrap gap-1.5">
          {ABC_EXAMPLES.map((ex) => (
            <button
              key={ex.title}
              onClick={() => { setAbc(ex.abc); setParsed(null) }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {ex.title}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div>
        <textarea
          value={abc}
          onChange={(e) => setAbc(e.target.value)}
          rows={8}
          className="w-full bg-[#0a0714] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-y"
          placeholder="Cole notação ABC aqui..."
        />
        <button
          onClick={handleParse}
          className="mt-2 w-full py-3 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
        >
          Visualizar Partitura
        </button>
      </div>

      {/* Resultado */}
      {parsed && parsed.notes.length > 0 && (
        <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-6 space-y-4">
          {parsed.title && (
            <h2 className="text-xl font-bold text-white">{parsed.title}</h2>
          )}
          <p className="text-xs text-slate-500">
            {parsed.notes.length} notas • {parsed.ts} • Tom: {parsed.ks}
          </p>

          {/* BPM + Play */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlay}
              disabled={playing}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                playing
                  ? "bg-violet-600/50 text-violet-300 cursor-wait"
                  : "bg-violet-600 hover:bg-violet-500 text-white"
              }`}
            >
              {playing ? "Tocando..." : "▶ Tocar"}
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">BPM</span>
              {BPM_OPTIONS.map((b) => (
                <button
                  key={b}
                  onClick={() => setBpm(b)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    bpm === b ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Partitura */}
          <div className="bg-[#0a0714] border border-white/5 rounded-xl p-4 space-y-0">
            <PartituraView
              notes={parsed.notes}
              timeSignature={parsed.ts}
              keySignature={parsed.ks !== "C" ? parsed.ks : undefined}
              highlightIndex={highlightIdx}
            />
            <TablaturaView notes={parsed.tab} />
          </div>

          {/* Notas com highlight */}
          <div className="flex flex-wrap gap-1.5">
            {parsed.notes.map((n, i) => {
              const isActive = highlightIdx === i
              return (
                <span
                  key={i}
                  className={`font-mono text-xs px-2 py-1 rounded-lg transition-all ${
                    isActive
                      ? "bg-violet-600 text-white scale-110"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  {n.note}{n.accidental ?? ""}{n.octave}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {parsed && parsed.notes.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-4">
          Nenhuma nota encontrada. Verifique a notação ABC.
        </p>
      )}
    </div>
  )
}
