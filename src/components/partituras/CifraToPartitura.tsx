"use client"

import { useState, useCallback, useRef } from "react"
import { PartituraView } from "@/components/partitura/PartituraView"
import { TablaturaView } from "@/components/partitura/TablaturaView"
import { initSampler, isReady, playNote } from "@/lib/sampler"
import type { NoteData } from "@/components/partitura/PartituraView"
import type { TabNote } from "@/components/partitura/TablaturaView"

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const TO_SHARP: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" }
const TUNING_MIDI = [62, 67, 71, 74]

const QUALITY_INTERVALS: Record<string, number[]> = {
  "": [0, 4, 7], m: [0, 3, 7], "7": [0, 4, 7, 10], m7: [0, 3, 7, 10],
  "7M": [0, 4, 7, 11], maj7: [0, 4, 7, 11], dim: [0, 3, 6], "º": [0, 3, 6],
  aug: [0, 4, 8], "+": [0, 4, 8], sus4: [0, 5, 7], sus2: [0, 2, 7],
  "6": [0, 4, 7, 9], m6: [0, 3, 7, 9], "9": [0, 4, 7, 10, 14],
  m9: [0, 3, 7, 10, 14], dim7: [0, 3, 6, 9], "º7": [0, 3, 6, 9],
}

function parseChordSimple(chord: string): { root: string; intervals: number[] } {
  const match = chord.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return { root: "C", intervals: [0, 4, 7] }
  const root = TO_SHARP[match[1]] ?? match[1]
  const q = match[2].replace(/\/[A-G][#b]?$/, "")

  for (const [key, ints] of Object.entries(QUALITY_INTERVALS)) {
    if (q === key) return { root, intervals: ints }
  }
  if (q.startsWith("m") && !q.startsWith("maj")) return { root, intervals: QUALITY_INTERVALS.m }
  if (q.includes("7")) return { root, intervals: QUALITY_INTERVALS["7"] }
  return { root, intervals: [0, 4, 7] }
}

function noteAtSemitone(root: string, semitones: number): string {
  const idx = CHROMATIC.indexOf(root)
  return CHROMATIC[(idx + semitones) % 12]
}

function findOnFretboard(note: string): { string: number; fret: number; octave: number } {
  const noteIdx = CHROMATIC.indexOf(note)
  for (let s = 0; s <= 3; s++) {
    for (let f = 0; f <= 7; f++) {
      if ((TUNING_MIDI[s] + f) % 12 === noteIdx) {
        return { string: s + 1, fret: f, octave: Math.floor((TUNING_MIDI[s] + f) / 12) - 1 }
      }
    }
  }
  return { string: 1, fret: 0, octave: 4 }
}

const CHORD_TOKEN_RE = /\b[A-G][#b]?[ºø]?(?:m|maj|min|dim|aug|sus|add)?\d*[ºø+\-]?M?(?:[b#]\d+[+-]?)*(?:\([^)]*\))?(?:\/[#b+-]?\d+[+-]?[#b]?)*(?:\/[A-G][#b]?)?[ºø+\-]*/g

export function CifraToPartitura() {
  const [input, setInput] = useState("")
  const [chords, setChords] = useState<string[]>([])
  const [playing, setPlaying] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState<number | undefined>(undefined)
  const timersRef = useRef<number[]>([])

  const handleGenerate = useCallback(() => {
    const matches = input.match(CHORD_TOKEN_RE)
    if (matches) setChords(matches)
  }, [input])

  const allNotes: { chord: string; notes: NoteData[]; tab: TabNote[] }[] = chords.map((chord) => {
    const { root, intervals } = parseChordSimple(chord)
    const noteNames = intervals.map((s) => noteAtSemitone(root, s % 12))
    const notes: NoteData[] = noteNames.map((n) => {
      const pos = findOnFretboard(n)
      return { note: n.replace("#", ""), octave: pos.octave, duration: "h", accidental: n.includes("#") ? "#" as const : undefined }
    })
    const tab: TabNote[] = noteNames.map((n) => {
      const pos = findOnFretboard(n)
      return { string: pos.string, fret: pos.fret }
    })
    return { chord, notes, tab }
  })

  const flatNotes = allNotes.flatMap((c) => c.notes)
  const flatTab = allNotes.flatMap((c) => c.tab)

  const handlePlay = useCallback(async () => {
    if (allNotes.length === 0) return
    if (!isReady()) await initSampler()

    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setPlaying(true)

    let noteOffset = 0
    allNotes.forEach((chordGroup, ci) => {
      const t = window.setTimeout(() => {
        setHighlightIdx(noteOffset)
        chordGroup.notes.forEach((n) => {
          const noteSharp = n.accidental === "#" ? n.note + "#" : n.note
          playNote(CHROMATIC.includes(noteSharp) ? noteSharp : n.note, n.octave)
        })
      }, ci * 1000)
      timersRef.current.push(t)
      noteOffset += chordGroup.notes.length
    })

    const endTimer = window.setTimeout(() => {
      setPlaying(false)
      setHighlightIdx(undefined)
    }, allNotes.length * 1000 + 300)
    timersRef.current.push(endTimer)
  }, [allNotes])

  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-sm">
        Digite ou cole uma progressão de acordes para gerar a partitura com as notas de cada acorde.
      </p>

      <div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          className="w-full bg-[#0a0714] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          placeholder="Ex: Am7  G7  C  F  Dm7  E7  Am"
        />
        <button
          onClick={handleGenerate}
          className="mt-2 w-full py-3 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
        >
          Gerar Partitura
        </button>
      </div>

      {chords.length > 0 && (
        <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">{chords.length} acordes</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {chords.map((c, i) => (
                  <span key={i} className="bg-violet-500/15 border border-violet-400/30 text-violet-200 font-mono text-sm font-bold px-3 py-1 rounded-lg">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={handlePlay}
              disabled={playing}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                playing ? "bg-violet-600/50 text-violet-300" : "bg-violet-600 hover:bg-violet-500 text-white"
              }`}
            >
              {playing ? "Tocando..." : "▶ Tocar"}
            </button>
          </div>

          <div className="bg-[#0a0714] border border-white/5 rounded-xl p-4 space-y-0">
            <PartituraView notes={flatNotes} highlightIndex={highlightIdx} />
            <TablaturaView notes={flatTab} />
          </div>
        </div>
      )}
    </div>
  )
}
