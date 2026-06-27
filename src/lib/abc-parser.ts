import type { NoteData } from "@/components/partitura/PartituraView"
import type { TabNote } from "@/components/partitura/TablaturaView"

const TUNING_MIDI = [62, 67, 71, 74] // D4, G4, B4, D5
const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

const KEY_SHARPS: Record<string, string[]> = {
  C: [], G: ["F"], D: ["F", "C"], A: ["F", "C", "G"],
  E: ["F", "C", "G", "D"], B: ["F", "C", "G", "D", "A"],
  "F#": ["F", "C", "G", "D", "A", "E"],
}
const KEY_FLATS: Record<string, string[]> = {
  F: ["B"], Bb: ["B", "E"], Eb: ["B", "E", "A"],
  Ab: ["B", "E", "A", "D"], Db: ["B", "E", "A", "D", "G"],
}

export interface ABCResult {
  title: string
  timeSignature: string
  keySignature: string
  notes: NoteData[]
  tab: TabNote[]
}

function noteToMidi(note: string, octave: number): number {
  const idx = CHROMATIC.indexOf(note)
  if (idx === -1) return 60
  return (octave + 1) * 12 + idx
}

function findOnFretboard(noteChrom: string): TabNote & { octave: number } {
  const noteIdx = CHROMATIC.indexOf(noteChrom)
  for (let s = 0; s <= 3; s++) {
    for (let f = 0; f <= 7; f++) {
      const midi = TUNING_MIDI[s] + f
      if (midi % 12 === noteIdx) {
        return { string: s + 1, fret: f, octave: Math.floor(midi / 12) - 1 }
      }
    }
  }
  for (let s = 0; s <= 3; s++) {
    for (let f = 8; f <= 12; f++) {
      const midi = TUNING_MIDI[s] + f
      if (midi % 12 === noteIdx) {
        return { string: s + 1, fret: f, octave: Math.floor(midi / 12) - 1 }
      }
    }
  }
  return { string: 1, fret: 0, octave: 4 }
}

const DURATION_MAP: Record<string, string> = {
  "0.25": "16",
  "0.5": "8",
  "1": "q",
  "2": "h",
  "3": "h.",
  "4": "w",
}

function durationToVex(beats: number): string {
  if (beats <= 0.25) return "16"
  if (beats <= 0.5) return "8"
  if (beats <= 1) return "q"
  if (beats <= 2) return "h"
  return "w"
}

export function parseABC(abc: string): ABCResult {
  const lines = abc.split("\n")
  let title = ""
  let timeSignature = "4/4"
  let keySignature = "C"
  let keySharps: Set<string> = new Set()
  let keyFlats: Set<string> = new Set()

  const notes: NoteData[] = []
  const tab: TabNote[] = []

  // Parse headers
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("T:")) title = trimmed.slice(2).trim()
    else if (trimmed.startsWith("M:")) timeSignature = trimmed.slice(2).trim()
    else if (trimmed.startsWith("K:")) {
      const key = trimmed.slice(2).trim()
      keySignature = key
      if (KEY_SHARPS[key]) keySharps = new Set(KEY_SHARPS[key])
      else if (KEY_FLATS[key]) keyFlats = new Set(KEY_FLATS[key])
    }
  }

  // Parse notes
  const musicLines = lines.filter((l) => {
    const t = l.trim()
    return t && !t.match(/^[A-Z]:/) && !t.startsWith("%")
  })

  const music = musicLines.join(" ")

  // ABC note regex: optional accidental + note letter + optional octave modifier + optional duration
  const noteRe = /([_^=]?)([A-Ga-g])([',]*)(\d*\/?\.?\d*)/g
  let m: RegExpExecArray | null

  while ((m = noteRe.exec(music)) !== null) {
    const accidental = m[1]
    const letter = m[2]
    const octaveMod = m[3]
    const durStr = m[4]

    // Determine base note
    const isLower = letter === letter.toLowerCase()
    let noteName = letter.toUpperCase()
    let octave = isLower ? 5 : 4

    // Octave modifiers
    for (const c of octaveMod) {
      if (c === "'") octave++
      if (c === ",") octave--
    }

    // Apply accidentals
    let acc: "#" | "b" | undefined
    if (accidental === "^") {
      noteName = noteName + "#"
      acc = "#"
    } else if (accidental === "_") {
      // Flat: convert to sharp internally
      const idx = CHROMATIC.indexOf(noteName)
      if (idx > 0) {
        noteName = CHROMATIC[idx - 1]
        acc = "b"
      }
    } else {
      // Apply key signature
      if (keySharps.has(noteName)) {
        noteName = noteName + "#"
        acc = "#"
      } else if (keyFlats.has(noteName)) {
        const idx = CHROMATIC.indexOf(noteName)
        if (idx > 0) {
          noteName = CHROMATIC[idx - 1]
          acc = "b"
        }
      }
    }

    // Ensure note is in CHROMATIC
    if (!CHROMATIC.includes(noteName)) {
      const base = noteName.replace("#", "")
      const baseIdx = CHROMATIC.indexOf(base)
      if (baseIdx >= 0 && noteName.includes("#")) {
        noteName = CHROMATIC[(baseIdx + 1) % 12]
      }
    }

    // Duration
    let beats = 1
    if (durStr) {
      if (durStr === "/") beats = 0.5
      else if (durStr === "//") beats = 0.25
      else if (durStr.includes("/")) {
        const parts = durStr.split("/")
        const num = parseInt(parts[0]) || 1
        const den = parseInt(parts[1]) || 2
        beats = num / den
      } else {
        beats = parseFloat(durStr) || 1
      }
    }

    const duration = durationToVex(beats)
    const displayNote = acc === "b"
      ? CHROMATIC[(CHROMATIC.indexOf(noteName) + 1) % 12] + "b"
      : noteName.replace("#", "")

    notes.push({
      note: acc === "b" ? displayNote.replace("b", "") : noteName.replace("#", ""),
      octave,
      duration,
      accidental: noteName.includes("#") ? "#" : acc,
    })

    // Generate tab
    const chromNote = noteName.includes("#") ? noteName : noteName
    const pos = findOnFretboard(chromNote)
    tab.push({ string: pos.string, fret: pos.fret })
  }

  return { title, timeSignature, keySignature, notes, tab }
}

export const ABC_EXAMPLES: { title: string; abc: string }[] = [
  {
    title: "Asa Branca (Luiz Gonzaga)",
    abc: `X:1
T:Asa Branca
M:4/4
K:D
|:D E F# G|A2 A2|B A G F#|E2 E2|
D E F# G|A2 A B|c B A G|F#2 F# E|
D E F# G|A2 A2|B A G F#|E2 E2|
D E F# A|G2 F# E|D4|D4:|`,
  },
  {
    title: "Escala de C Maior",
    abc: `X:1
T:Escala C Maior
M:4/4
K:C
C D E F|G A B c|c B A G|F E D C|`,
  },
  {
    title: "Parabéns pra Você",
    abc: `X:1
T:Parabens pra Voce
M:3/4
K:C
G/2G/2 A G|c B2|G/2G/2 A G|d c2|
G/2G/2 g e|c B A|f/2f/2 e c|d c2|`,
  },
  {
    title: "Carinhoso (Pixinguinha)",
    abc: `X:1
T:Carinhoso
M:2/4
K:F
A G F E|D2 C2|D E F G|A2 A2|
B A G F|E2 D2|C D E F|G2 G2|`,
  },
]
