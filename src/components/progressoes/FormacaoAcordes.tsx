"use client"

import { useState } from "react"
import { PlayButton } from "@/components/ui/PlayButton"
import { BracoCavaquinho } from "@/components/progressoes/BracoCavaquinho"

const NOTAS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const TO_SHARP: Record<string, string> = { Eb: "D#", Ab: "G#", Bb: "A#", Db: "C#", Gb: "F#" }

function noteAtSemitone(root: string, semitones: number): string {
  const r = TO_SHARP[root] ?? root
  const idx = CHROMATIC.indexOf(r)
  if (idx === -1) return root
  return CHROMATIC[(idx + semitones) % 12]
}

function displayNote(note: string, preferFlat: boolean): string {
  if (!preferFlat) return note
  const flatMap: Record<string, string> = { "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb" }
  return flatMap[note] ?? note
}

interface ChordType {
  id: string
  label: string
  suffix: string
  formula: string
  intervals: number[]
  intervalNames: string[]
  category: string
}

const CHORD_TYPES: ChordType[] = [
  { id: "maj",    label: "Maior",      suffix: "",        formula: "1 – 3 – 5",          intervals: [0, 4, 7],         intervalNames: ["T", "3M", "5J"],           category: "Tríades" },
  { id: "min",    label: "Menor",      suffix: "m",       formula: "1 – b3 – 5",         intervals: [0, 3, 7],         intervalNames: ["T", "3m", "5J"],           category: "Tríades" },
  { id: "dim",    label: "Diminuto",   suffix: "º",       formula: "1 – b3 – b5",        intervals: [0, 3, 6],         intervalNames: ["T", "3m", "5dim"],         category: "Tríades" },
  { id: "aug",    label: "Aumentado",  suffix: "+",       formula: "1 – 3 – #5",         intervals: [0, 4, 8],         intervalNames: ["T", "3M", "5aum"],         category: "Tríades" },

  { id: "7",      label: "7 (dom)",    suffix: "7",       formula: "1 – 3 – 5 – b7",     intervals: [0, 4, 7, 10],     intervalNames: ["T", "3M", "5J", "7m"],     category: "Tétrades" },
  { id: "m7",     label: "Menor 7",    suffix: "m7",      formula: "1 – b3 – 5 – b7",    intervals: [0, 3, 7, 10],     intervalNames: ["T", "3m", "5J", "7m"],     category: "Tétrades" },
  { id: "maj7",   label: "Maior 7",    suffix: "7M",      formula: "1 – 3 – 5 – 7",      intervals: [0, 4, 7, 11],     intervalNames: ["T", "3M", "5J", "7M"],     category: "Tétrades" },
  { id: "dim7",   label: "Dim 7",      suffix: "º7",      formula: "1 – b3 – b5 – bb7",  intervals: [0, 3, 6, 9],      intervalNames: ["T", "3m", "5dim", "7dim"], category: "Tétrades" },
  { id: "m7b5",   label: "Meio-dim",   suffix: "m7(b5)",  formula: "1 – b3 – b5 – b7",   intervals: [0, 3, 6, 10],     intervalNames: ["T", "3m", "5dim", "7m"],   category: "Tétrades" },

  { id: "9",      label: "Nona",       suffix: "9",       formula: "1 – 3 – 5 – b7 – 9", intervals: [0, 4, 7, 10, 14], intervalNames: ["T", "3M", "5J", "7m", "9M"], category: "Extensões" },
  { id: "m9",     label: "Menor 9",    suffix: "m9",      formula: "1 – b3 – 5 – b7 – 9",intervals: [0, 3, 7, 10, 14], intervalNames: ["T", "3m", "5J", "7m", "9M"], category: "Extensões" },
  { id: "11",     label: "Onze",       suffix: "11",      formula: "1 – 3 – 5 – b7 – 11",intervals: [0, 4, 7, 10, 17], intervalNames: ["T", "3M", "5J", "7m", "11J"], category: "Extensões" },
  { id: "13",     label: "Treze",      suffix: "13",      formula: "1 – 3 – 5 – b7 – 13",intervals: [0, 4, 7, 10, 21], intervalNames: ["T", "3M", "5J", "7m", "13M"], category: "Extensões" },

  { id: "sus4",   label: "Sus4",       suffix: "sus4",    formula: "1 – 4 – 5",          intervals: [0, 5, 7],         intervalNames: ["T", "4J", "5J"],           category: "Outros" },
  { id: "sus2",   label: "Sus2",       suffix: "sus2",    formula: "1 – 2 – 5",          intervals: [0, 2, 7],         intervalNames: ["T", "2M", "5J"],           category: "Outros" },
  { id: "6",      label: "Sexta",      suffix: "6",       formula: "1 – 3 – 5 – 6",      intervals: [0, 4, 7, 9],      intervalNames: ["T", "3M", "5J", "6M"],     category: "Outros" },
  { id: "m6",     label: "Menor 6",    suffix: "m6",      formula: "1 – b3 – 5 – 6",     intervals: [0, 3, 7, 9],      intervalNames: ["T", "3m", "5J", "6M"],     category: "Outros" },
  { id: "add9",   label: "Add9",       suffix: "add9",    formula: "1 – 3 – 5 – 9",      intervals: [0, 4, 7, 14],     intervalNames: ["T", "3M", "5J", "9M"],     category: "Outros" },
  { id: "5",      label: "Power (5)",  suffix: "5",       formula: "1 – 5",               intervals: [0, 7],            intervalNames: ["T", "5J"],                 category: "Outros" },
]

const CATEGORIES = ["Tríades", "Tétrades", "Extensões", "Outros"]

const OCTAVES = [3, 4, 5]
const OCTAVE_LABELS = ["Forma 1", "Forma 2", "Forma 3"]

export function FormacaoAcordes() {
  const [root, setRoot] = useState("C")
  const [chordTypeId, setChordTypeId] = useState("maj")

  const chordType = CHORD_TYPES.find((t) => t.id === chordTypeId)!
  const rootSharp = TO_SHARP[root] ?? root
  const preferFlat = ["F", "Bb", "Eb", "Ab", "Db", "Gb"].includes(root)

  const chordNotes = chordType.intervals.map((semitones) => {
    const note = noteAtSemitone(rootSharp, semitones % 12)
    return displayNote(note, preferFlat)
  })

  const chordName = root + chordType.suffix

  return (
    <div className="space-y-8">
      <p className="text-slate-400 text-sm">
        Selecione a nota raiz e o tipo de acorde para ver sua formação e ouvir o som real do cavaquinho.
      </p>

      {/* Nota raiz */}
      <section>
        <p className="text-xs text-slate-500 mb-2">Nota Raiz</p>
        <div className="flex flex-wrap gap-1.5">
          {NOTAS.map((n) => (
            <button
              key={n}
              onClick={() => setRoot(n)}
              className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                root === n
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* Tipo de acorde */}
      <section>
        <p className="text-xs text-slate-500 mb-3">Tipo de Acorde</p>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <p className="text-xs text-slate-600 mb-1.5">{cat}</p>
              <div className="flex flex-wrap gap-1.5">
                {CHORD_TYPES.filter((t) => t.category === cat).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setChordTypeId(t.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      chordTypeId === t.id
                        ? "bg-violet-600 text-white"
                        : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resultado */}
      <section className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold font-mono text-white">{chordName}</h2>
            <p className="text-xs text-slate-500 mt-1">{chordType.label}</p>
          </div>
        </div>

        {/* Fórmula */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-xs text-slate-500 mb-1">Fórmula</p>
            <p className="text-violet-300 font-mono text-sm font-bold">{chordType.formula}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Notas</p>
            <p className="text-white font-mono text-sm font-bold">{chordNotes.join(" – ")}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Intervalos</p>
            <p className="text-amber-300 font-mono text-sm">{chordType.intervalNames.join(" – ")}</p>
          </div>
        </div>

        {/* 3 formas */}
        <div className="space-y-3">
          {OCTAVES.map((oct, oi) => {
            const notesForPlay: [string, number][] = chordType.intervals.map((semitones) => {
              const note = noteAtSemitone(rootSharp, semitones % 12)
              const noteOctave = oct + Math.floor(semitones / 12)
              return [note, noteOctave]
            })

            const displayNotes = notesForPlay.map(([n, o]) => {
              const dn = displayNote(n, preferFlat)
              return `${dn}${o}`
            })

            // Chord notes in sharp notation for the fretboard
            const chordNotesSharp = chordType.intervals.map((s) => noteAtSemitone(rootSharp, s % 12))

            return (
              <div
                key={oct}
                className="bg-[#0a0714] border border-white/5 rounded-xl p-4 flex items-center gap-4"
              >
                <BracoCavaquinho chordNotes={chordNotesSharp} voicingIndex={oi} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-2">{OCTAVE_LABELS[oi]}</p>
                  <div className="flex flex-wrap gap-2">
                    {displayNotes.map((dn, i) => (
                      <span
                        key={i}
                        className="bg-violet-500/15 border border-violet-400/30 text-violet-200 font-mono text-sm font-bold px-3 py-1 rounded-lg"
                      >
                        {dn}
                      </span>
                    ))}
                  </div>
                </div>
                <PlayButton notes={notesForPlay} size="md" label={`Tocar ${chordName} ${OCTAVE_LABELS[oi]}`} />
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
