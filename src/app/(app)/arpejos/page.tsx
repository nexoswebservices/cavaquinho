"use client"

import { useState, useCallback } from "react"
import { ARPEJO_PATTERNS, CHORD_TYPES_ARPEJO } from "@/lib/arpejos-data"
import { BracoArpejo } from "@/components/arpejos/BracoArpejo"
import { PlayButton } from "@/components/ui/PlayButton"
import { initSampler, isReady, playArpejo } from "@/lib/sampler"
import { PartituraComTab } from "@/components/partitura/PartituraComTab"
import type { NoteData } from "@/components/partitura/PartituraView"
import type { TabNote } from "@/components/partitura/TablaturaView"

const NOTAS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const TO_SHARP: Record<string, string> = { Eb: "D#", Ab: "G#", Bb: "A#", Db: "C#", Gb: "F#" }
const TUNING_MIDI = [62, 67, 71, 74]

function noteAtSemitone(root: string, semitones: number): string {
  const r = TO_SHARP[root] ?? root
  const idx = CHROMATIC.indexOf(r)
  if (idx === -1) return root
  return CHROMATIC[(idx + semitones) % 12]
}

function displayNote(note: string, preferFlat: boolean): string {
  if (!preferFlat) return note
  const map: Record<string, string> = { "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb" }
  return map[note] ?? note
}

const BPM_OPTIONS = [60, 80, 100, 120, 140, 160]

export default function ArpejosPage() {
  const [root, setRoot] = useState("C")
  const [chordTypeId, setChordTypeId] = useState("maj")
  const [patternId, setPatternId] = useState("asc")
  const [bpm, setBpm] = useState(100)
  const [playingArpejo, setPlayingArpejo] = useState(false)

  const chordType = CHORD_TYPES_ARPEJO.find((t) => t.id === chordTypeId)!
  const pattern = ARPEJO_PATTERNS.find((p) => p.id === patternId)!
  const rootSharp = TO_SHARP[root] ?? root
  const preferFlat = ["F", "Bb", "Eb", "Ab", "Db", "Gb"].includes(root)

  const chordNotes = chordType.intervals.map((s) => noteAtSemitone(rootSharp, s))
  const chordName = root + chordType.suffix

  // Build notes for playback: chord notes expanded by pattern
  const playNotes: [string, number][] = pattern.sequence.map((idx) => {
    const note = chordNotes[idx % chordNotes.length]
    return [note, 4]
  })

  // Build partitura notes
  const partNotes: NoteData[] = pattern.sequence.map((idx, i) => {
    const note = chordNotes[idx % chordNotes.length]
    const dn = displayNote(note, preferFlat)
    return {
      note: dn,
      octave: 4,
      duration: pattern.durations[i] ?? "8",
      accidental: dn.includes("#") ? "#" as const : dn.includes("b") ? "b" as const : undefined,
    }
  })

  // Build tab notes (find fret positions)
  const tabNotes: TabNote[] = pattern.sequence.map((idx) => {
    const note = chordNotes[idx % chordNotes.length]
    const noteIdx = CHROMATIC.indexOf(note)
    for (let s = 3; s >= 0; s--) {
      for (let f = 0; f <= 12; f++) {
        if ((TUNING_MIDI[s] + f) % 12 === noteIdx) {
          return { string: s + 1, fret: f }
        }
      }
    }
    return { string: 1, fret: 0 }
  })

  const handlePlayArpejo = useCallback(async () => {
    if (!isReady()) await initSampler()
    setPlayingArpejo(true)
    playArpejo(playNotes, bpm, pattern.sequence.map((_, i) => i))
    setTimeout(() => setPlayingArpejo(false), (60 / bpm) * pattern.sequence.length * 1000 + 200)
  }, [playNotes, bpm, pattern])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Arpejos</h1>
        <p className="text-slate-400">
          Pratique padrões de dedilhado sobre shapes de acordes no cavaquinho.
        </p>
      </div>

      {/* Seleção */}
      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-500 mb-2">Nota Raiz</p>
          <div className="flex flex-wrap gap-1.5">
            {NOTAS.map((n) => (
              <button
                key={n}
                onClick={() => setRoot(n)}
                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                  root === n ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-2">Tipo de Acorde</p>
          <div className="flex flex-wrap gap-1.5">
            {CHORD_TYPES_ARPEJO.map((t) => (
              <button
                key={t.id}
                onClick={() => setChordTypeId(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  chordTypeId === t.id ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-2">Padrão</p>
          <div className="flex flex-wrap gap-1.5">
            {ARPEJO_PATTERNS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPatternId(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  patternId === p.id ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {p.nome}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-2">Tempo (BPM)</p>
          <div className="flex flex-wrap gap-1.5">
            {BPM_OPTIONS.map((b) => (
              <button
                key={b}
                onClick={() => setBpm(b)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  bpm === b ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultado */}
      <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold font-mono text-white">Arpejo de {chordName}</h2>
            <p className="text-xs text-slate-500 mt-1">{pattern.nome} • {bpm} BPM</p>
          </div>
        </div>

        {/* Braço + Partitura */}
        <div className="flex gap-6 items-start mb-6">
          <BracoArpejo chordNotes={chordNotes} sequence={pattern.sequence} />
          <div className="flex-1 min-w-0">
            <PartituraComTab
              notes={partNotes}
              tab={tabNotes}
              title={`${chordName} — ${pattern.nome}`}
            />
          </div>
        </div>

        {/* Notas do acorde */}
        <div className="flex flex-wrap gap-2 mb-4">
          {chordNotes.map((n, i) => (
            <span
              key={i}
              className="bg-violet-500/15 border border-violet-400/30 text-violet-200 font-mono text-sm font-bold px-3 py-1 rounded-lg"
            >
              {displayNote(n, preferFlat)}
            </span>
          ))}
        </div>

        {/* Sequência */}
        <div className="mb-5">
          <p className="text-xs text-slate-500 mb-1">Sequência</p>
          <div className="flex gap-2">
            {pattern.sequence.map((idx, i) => {
              const note = displayNote(chordNotes[idx % chordNotes.length], preferFlat)
              return (
                <span key={i} className="bg-white/5 text-slate-300 font-mono text-xs px-2 py-1 rounded-lg">
                  {i + 1}. {note}
                </span>
              )
            })}
          </div>
        </div>

        {/* Play */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={handlePlayArpejo}
            disabled={playingArpejo}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              playingArpejo
                ? "bg-violet-600/50 text-violet-300 cursor-wait"
                : "bg-violet-600 hover:bg-violet-500 text-white"
            }`}
          >
            {playingArpejo ? "Tocando..." : "▶ Tocar Arpejo"}
          </button>
          <PlayButton
            notes={chordNotes.map((n): [string, number] => [n, 4])}
            size="md"
            label="Tocar acorde"
          />
        </div>

        {/* Descrição + dica */}
        <div className="space-y-2 border-t border-white/5 pt-4">
          <p className="text-slate-300 text-sm">{pattern.descricao}</p>
          <p className="text-amber-400 text-sm">
            <span className="font-semibold">Dica: </span>{pattern.dica}
          </p>
        </div>
      </div>
    </div>
  )
}
