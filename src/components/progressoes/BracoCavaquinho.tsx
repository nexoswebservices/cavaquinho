"use client"

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

// Cavaquinho tuning: D4-G4-B4-D5 (string 4 to 1, thickest to thinnest)
const TUNING_MIDI = [62, 67, 71, 74] // D4, G4, B4, D5
const TUNING_LABELS = ["D", "G", "B", "D"]
const MAX_FRET = 12

const TO_SHARP: Record<string, string> = {
  Bb: "A#", Eb: "D#", Ab: "G#", Db: "C#", Gb: "F#", Cb: "B", Fb: "E",
}

function toSharp(note: string): string {
  return TO_SHARP[note] ?? note
}

function midiToNote(midi: number): string {
  return CHROMATIC[midi % 12]
}

interface Voicing {
  frets: (number | null)[] // null = muted, 0 = open
  fingers: string[]
}

// Identifies root chromatic index and chord quality from note array
function inferQuality(notes: string[]): { rootIdx: number; quality: string } {
  const idxs = notes.map((n) => CHROMATIC.indexOf(toSharp(n)))
  if (idxs.some((i) => i === -1)) return { rootIdx: -1, quality: "unknown" }
  const root = idxs[0]
  const intervals = idxs.map((i) => (i - root + 12) % 12).sort((a, b) => a - b)
  const key = intervals.join(",")
  const MAP: Record<string, string> = {
    "0,4,7": "major",
    "0,3,7": "minor",
    "0,4,7,10": "dom7",
    "0,4,7,11": "maj7",
    "0,3,7,10": "min7",
    "0,3,6": "dim",
    "0,3,6,10": "halfdim",
    "0,4,8": "aug",
    "0,5,7": "sus4",
    "0,2,7": "sus2",
  }
  return { rootIdx: root, quality: MAP[key] ?? "unknown" }
}

// Returns fret numbers [D4, G4, B4, D5] derived from standard Brazilian cavaquinho shape families.
// Shapes derived from "Dicionário básico de acordes para cavaquinho" (Betto Correa).
// Tuning open notes (chromatic index): D=2, G=7, B=11, D=2
// Fret formula: fret = (targetNote - openNote + 12) % 12
//
// Major:  C-shape(R≤3)  3rd–5th–root–3rd   | [(R+2)%12, R%12, (R+1)%12, (R+2)%12]
//         E-shape(R4-8) root–3rd–5th–root   | [(R-2)%12, (R-3)%12, (R-4)%12, (R-2)%12]
//         Barre (R9-11) all same fret        | b=(R+5)%12
//
// Minor:  Cm(R≤3)  b3–5th–root–b3  | [(R+1)%12, R%12, (R+1)%12, (R+1)%12]
//         Em(R4-8) root–b3–5th–root | [(R-2)%12, (R-4)%12, (R-4)%12, (R-2)%12]
//         Am(R9-11)5th–root–b3–5th  | [(R+5)%12, (R+5)%12, (R+4)%12, (R+5)%12]
//
// Dom7:   C7(R≤3)  3rd–b7–root–3rd  | [(R+2)%12, (R+3)%12, (R+1)%12, (R+2)%12]
//         E7(R4)   open shape [2,1,0,0]
//         E7(R5-8) b7–3rd–5th–root  | [(R-4)%12, (R-3)%12, (R-4)%12, (R-2)%12]
//         A7(R9-11)b7–root–3rd–5th  | [(R+8)%12, (R+5)%12, (R+5)%12, (R+5)%12]
//
// Maj7:   D-shape(all) root–5th–maj7–3rd | [(R-2)%12, R%12, R%12, (R+2)%12]
//
// Min7:   Cm7(R=0) hard-coded [5,3,1,5]  (5th–b7–root–5th)
//         Dm7(R=2) hard-coded [0,2,1,3]  (root open–5th–b7–b3)
//         Dbm7/Ebm7(R1,3) 5th–b7–root–5th | [(R+5)%12,(R+3)%12,(R+1)%12,(R+5)%12]
//         Em7-shape(R4-11) root–b3–5th–b7 | [(R-2)%12,(R-4)%12,(R-4)%12,(R-4)%12]
//
// Dim:    C°(R0-4,8-11) b5–root–b3–b5 | [(R+4)%12, (R+5)%12, (R+4)%12, (R+4)%12]
//         E°(R5-7)      root–b3–b5–root| [(R-2)%12, (R-4)%12, (R-5)%12, (R-2)%12]
//         Ab°(R8) C°-shape → [0,1,0,0] (D4/B4/D5 open, G4 fret1)
function getFormulaFrets(rootIdx: number, quality: string): (number | null)[] | null {
  const R = rootIdx

  if (quality === "major") {
    if (R <= 3) return [(R + 2) % 12, R % 12, (R + 1) % 12, (R + 2) % 12]
    if (R <= 8) return [(R - 2 + 12) % 12, (R - 3 + 12) % 12, (R - 4 + 12) % 12, (R - 2 + 12) % 12]
    const b = (R + 5) % 12
    return [b, b, b, b]
  }

  if (quality === "minor") {
    if (R <= 3) return [(R + 1) % 12, R % 12, (R + 1) % 12, (R + 1) % 12]
    if (R <= 8) return [(R - 2 + 12) % 12, (R - 4 + 12) % 12, (R - 4 + 12) % 12, (R - 2 + 12) % 12]
    return [(R + 5) % 12, (R + 5) % 12, (R + 4) % 12, (R + 5) % 12]
  }

  if (quality === "dom7") {
    if (R <= 3) return [(R + 2) % 12, (R + 3) % 12, (R + 1) % 12, (R + 2) % 12]
    if (R === 4) return [2, 1, 0, 0]  // E7: shape aberto com D e B soltos
    if (R <= 8) return [(R - 4 + 12) % 12, (R - 3 + 12) % 12, (R - 4 + 12) % 12, (R - 2 + 12) % 12]
    return [(R + 8) % 12, (R + 5) % 12, (R + 5) % 12, (R + 5) % 12]
  }

  if (quality === "maj7") {
    // root on D4, 5th on G4, maj7 on B4, 3rd on D5
    return [(R - 2 + 12) % 12, R % 12, R % 12, (R + 2) % 12]
  }

  if (quality === "min7") {
    if (R === 0) return [5, 3, 1, 5]   // Cm7: 5th-b7-root-5th (Betto Correa)
    if (R === 2) return [0, 2, 1, 3]   // Dm7: open root-5th-b7-b3 (Betto Correa)
    // Dbm7/Ebm7: 5th-b7-root-5th (C-shape family)
    if (R <= 3) return [(R + 5) % 12, (R + 3) % 12, (R + 1) % 12, (R + 5) % 12]
    // Em7-shape: root on D4, partial barre (b3/5th/b7) on G4/B4/D5
    return [(R - 2 + 12) % 12, (R - 4 + 12) % 12, (R - 4 + 12) % 12, (R - 4 + 12) % 12]
  }

  if (quality === "dim") {
    // E°-shape (R 5-7): root on D4/D5, b3 on G4, b5 on B4
    if (R >= 5 && R <= 7) {
      return [(R - 2 + 12) % 12, (R - 4 + 12) % 12, (R - 5 + 12) % 12, (R - 2 + 12) % 12]
    }
    // C°-shape: b5 on D4/D5, root on G4, b3 on B4
    // R=8 (Ab°) gives [0,1,0,0] (open D4/B4/D5, G4 fret 1) — very practical
    return [(R + 4) % 12, (R + 5) % 12, (R + 4) % 12, (R + 4) % 12]
  }

  return null
}

function makeVoicing(frets: (number | null)[]): Voicing {
  const fingers = frets.map((f, s) =>
    f !== null ? midiToNote(TUNING_MIDI[s] + (f as number)) : "X"
  )
  return { frets, fingers }
}

// Greedy algorithm fallback for chord types without a formula
function findVoicing(chordNotes: string[], startFret: number): Voicing {
  const noteSet = new Set(chordNotes.map((n) => CHROMATIC.indexOf(toSharp(n))))
  const frets: (number | null)[] = []
  const covered = new Set<number>()

  for (let s = 0; s < 4; s++) {
    const openMidi = TUNING_MIDI[s]
    const candidates: Array<{ fret: number; noteIdx: number; dist: number }> = []

    for (let f = 0; f <= MAX_FRET; f++) {
      const noteIdx = (openMidi + f) % 12
      if (!noteSet.has(noteIdx)) continue
      const inRange = f === 0 || (f >= startFret && f <= startFret + 4)
      if (!inRange) continue
      candidates.push({ fret: f, noteIdx, dist: Math.abs(f - startFret) })
    }

    if (candidates.length === 0) {
      for (let f = 0; f <= MAX_FRET; f++) {
        const noteIdx = (openMidi + f) % 12
        if (noteSet.has(noteIdx)) {
          candidates.push({ fret: f, noteIdx, dist: Math.abs(f - startFret) })
          break
        }
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        const aCovered = covered.has(a.noteIdx) ? 1 : 0
        const bCovered = covered.has(b.noteIdx) ? 1 : 0
        if (aCovered !== bCovered) return aCovered - bCovered
        return a.dist - b.dist
      })
      const best = candidates[0]
      frets.push(best.fret)
      covered.add(best.noteIdx)
    } else {
      frets.push(null)
    }
  }

  return makeVoicing(frets)
}

function getThreeVoicings(chordNotes: string[]): Voicing[] {
  const { rootIdx, quality } = inferQuality(chordNotes)
  const formulaFrets = getFormulaFrets(rootIdx, quality)

  const v0 = formulaFrets ? makeVoicing(formulaFrets) : findVoicing(chordNotes, 2)

  let v1: Voicing
  if (rootIdx === 4 && quality === "dom7") {
    v1 = makeVoicing([2, 1, 3, 2])   // E7 2ª forma: E,G#,D,E
  } else if (rootIdx === 4 && quality === "min7") {
    v1 = makeVoicing([5, 7, 5, 9])   // Em7 2ª forma: G,D,E,B (Betto Correa)
  } else if (rootIdx === 9 && quality === "min7") {
    v1 = makeVoicing([7, 5, 8, 9])   // Am7 2ª forma (Betto Correa)
  } else {
    v1 = findVoicing(chordNotes, 4)
  }

  const v2 = findVoicing(chordNotes, 7)
  return [v0, v1, v2]
}

export function getVoicingNotes(
  chordNotes: string[],
  voicingIndex: number
): Array<{ note: string; octave: number } | null> {
  const voicings = getThreeVoicings(chordNotes)
  const { frets } = voicings[voicingIndex] ?? voicings[0]
  return frets.map((f, s) => {
    if (f === null) return null
    const midi = TUNING_MIDI[s] + f
    return { note: CHROMATIC[midi % 12], octave: Math.floor(midi / 12) - 1 }
  })
}

interface BracoCavaquinhoProps {
  chordNotes: string[]
  voicingIndex: number
}

export function BracoCavaquinho({ chordNotes, voicingIndex }: BracoCavaquinhoProps) {
  const voicings = getThreeVoicings(chordNotes)
  const voicing = voicings[voicingIndex] ?? voicings[0]
  const { frets } = voicing

  const usedFrets = frets.filter((f): f is number => f !== null && f > 0)
  const minFret = usedFrets.length > 0 ? Math.min(...usedFrets) : 1
  const maxFret = usedFrets.length > 0 ? Math.max(...usedFrets) : 4

  const hasOpenStrings = frets.some(f => f === 0)
  let displayStart = 1
  let showNut = true
  if (!hasOpenStrings && minFret > 1) {
    displayStart = minFret
    showNut = false
  }
  const displayEnd = Math.max(displayStart + 3, maxFret)
  const numFrets = displayEnd - displayStart + 1

  const W = 120
  const H = 30 + numFrets * 28 + 20
  const LEFT = 30
  const TOP = 28
  const STRING_GAP = 22
  const FRET_H = 28
  const RIGHT = LEFT + STRING_GAP * 3

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-28 h-auto flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Nut or fret number */}
      {showNut ? (
        <line x1={LEFT - 2} y1={TOP} x2={RIGHT + 2} y2={TOP} stroke="#a78bfa" strokeWidth={3} />
      ) : (
        <text x={LEFT - 14} y={TOP + FRET_H / 2 + 4} fontSize={10} fill="#94a3b8" textAnchor="middle">
          {displayStart}
        </text>
      )}

      {/* Fret lines */}
      {Array.from({ length: numFrets + 1 }, (_, i) => (
        <line
          key={`fret-${i}`}
          x1={LEFT - 2}
          y1={TOP + i * FRET_H}
          x2={RIGHT + 2}
          y2={TOP + i * FRET_H}
          stroke="#334155"
          strokeWidth={1}
        />
      ))}

      {/* Strings */}
      {[0, 1, 2, 3].map((s) => (
        <line
          key={`string-${s}`}
          x1={LEFT + s * STRING_GAP}
          y1={TOP}
          x2={LEFT + s * STRING_GAP}
          y2={TOP + numFrets * FRET_H}
          stroke="#64748b"
          strokeWidth={s === 0 ? 1.8 : s === 3 ? 0.8 : 1.2}
        />
      ))}

      {/* String labels */}
      {TUNING_LABELS.map((label, s) => (
        <text
          key={`label-${s}`}
          x={LEFT + s * STRING_GAP}
          y={TOP + numFrets * FRET_H + 14}
          fontSize={9}
          fill="#64748b"
          textAnchor="middle"
        >
          {label}
        </text>
      ))}

      {/* Finger dots / open / muted */}
      {frets.map((f, s) => {
        const x = LEFT + s * STRING_GAP

        if (f === null) {
          return (
            <text key={`x-${s}`} x={x} y={TOP - 6} fontSize={10} fill="#ef4444" textAnchor="middle">
              X
            </text>
          )
        }

        if (f === 0) {
          return (
            <circle
              key={`o-${s}`}
              cx={x}
              cy={TOP - 8}
              r={4}
              fill="none"
              stroke="#a78bfa"
              strokeWidth={1.5}
            />
          )
        }

        const fretPos = f - displayStart
        const y = TOP + fretPos * FRET_H + FRET_H / 2
        const noteName = midiToNote(TUNING_MIDI[s] + f)

        return (
          <g key={`dot-${s}`}>
            <circle cx={x} cy={y} r={8} fill="#7c3aed" />
            <text x={x} y={y + 3.5} fontSize={8} fill="white" textAnchor="middle" fontWeight="bold">
              {noteName}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
