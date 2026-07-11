// Pure chord-to-tab engine for cavaquinho (D4-G4-B4-D5)
// Shapes from Dicionário básico de acordes para cavaquinho (Betto Correa)
// No React — safe for server-side use in API routes

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const TUNING_MIDI = [62, 67, 71, 74] // D4, G4, B4, D5
const MAX_FRET = 12

const TO_SHARP: Record<string, string> = {
  Bb: "A#", Eb: "D#", Ab: "G#", Db: "C#", Gb: "F#", Cb: "B", Fb: "E",
}

function toSharp(note: string): string {
  return TO_SHARP[note] ?? note
}

// Fret formulas per quality family — see BracoCavaquinho.tsx for derivation
export function getFormulaFrets(rootIdx: number, quality: string): (number | null)[] | null {
  const R = rootIdx

  if (quality === "major") {
    if (R <= 3) return [(R + 2) % 12, R % 12, (R + 1) % 12, (R + 2) % 12]
    if (R <= 8) return [(R - 2 + 12) % 12, (R - 3 + 12) % 12, (R - 4 + 12) % 12, (R - 2 + 12) % 12]
    const b = (R + 5) % 12; return [b, b, b, b]
  }

  if (quality === "minor") {
    if (R <= 3) return [(R + 1) % 12, R % 12, (R + 1) % 12, (R + 1) % 12]
    if (R <= 8) return [(R - 2 + 12) % 12, (R - 4 + 12) % 12, (R - 4 + 12) % 12, (R - 2 + 12) % 12]
    return [(R + 5) % 12, (R + 5) % 12, (R + 4) % 12, (R + 5) % 12]
  }

  if (quality === "dom7") {
    if (R <= 3) return [(R + 2) % 12, (R + 3) % 12, (R + 1) % 12, (R + 2) % 12]
    if (R === 4) return [2, 1, 0, 0]
    if (R <= 8) return [(R - 4 + 12) % 12, (R - 3 + 12) % 12, (R - 4 + 12) % 12, (R - 2 + 12) % 12]
    return [(R + 8) % 12, (R + 5) % 12, (R + 5) % 12, (R + 5) % 12]
  }

  if (quality === "maj7") {
    return [(R - 2 + 12) % 12, R % 12, R % 12, (R + 2) % 12]
  }

  if (quality === "min7") {
    if (R === 0) return [5, 3, 1, 5]   // Cm7 (Betto Correa)
    if (R === 2) return [0, 2, 1, 3]   // Dm7 (Betto Correa)
    if (R <= 3) return [(R + 5) % 12, (R + 3) % 12, (R + 1) % 12, (R + 5) % 12]
    return [(R - 2 + 12) % 12, (R - 4 + 12) % 12, (R - 4 + 12) % 12, (R - 4 + 12) % 12]
  }

  if (quality === "dim") {
    if (R >= 5 && R <= 7)
      return [(R - 2 + 12) % 12, (R - 4 + 12) % 12, (R - 5 + 12) % 12, (R - 2 + 12) % 12]
    return [(R + 4) % 12, (R + 5) % 12, (R + 4) % 12, (R + 4) % 12]
  }

  return null
}

// Greedy fallback for qualities without a formula (aug, sus, halfdim, etc.)
function greedyFrets(chordNotes: string[], startFret: number): (number | null)[] {
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
      if (inRange) candidates.push({ fret: f, noteIdx, dist: Math.abs(f - startFret) })
    }
    if (candidates.length === 0) {
      for (let f = 0; f <= MAX_FRET; f++) {
        const noteIdx = (openMidi + f) % 12
        if (noteSet.has(noteIdx)) { candidates.push({ fret: f, noteIdx, dist: f }); break }
      }
    }
    if (candidates.length > 0) {
      candidates.sort((a, b) => (covered.has(a.noteIdx) ? 1 : 0) - (covered.has(b.noteIdx) ? 1 : 0) || a.dist - b.dist)
      frets.push(candidates[0].fret)
      covered.add(candidates[0].noteIdx)
    } else {
      frets.push(null)
    }
  }
  return frets
}

const CHORD_INTERVALS: Record<string, number[]> = {
  halfdim: [0, 3, 6, 10],
  aug:     [0, 4, 8],
  sus4:    [0, 5, 7],
  sus2:    [0, 2, 7],
}

// Parse chord symbol (e.g. "Cm7", "G7", "Bbmaj7", "F#dim") to rootIdx + quality
export function parseChordSymbol(symbol: string): { rootIdx: number; quality: string } | null {
  const noSlash = symbol.split("/")[0].trim()

  const rootMatch = noSlash.match(/^([A-G][b#]?)/)
  if (!rootMatch) return null

  const rootIdx = CHROMATIC.indexOf(toSharp(rootMatch[1]))
  if (rootIdx === -1) return null

  let suffix = noSlash.slice(rootMatch[1].length).replace(/\([^)]*\)/g, "").trim()

  let quality: string
  if (/^(maj7|M7)/i.test(suffix))                               quality = "maj7"
  else if (/^(mM7|mmaj7)/i.test(suffix))                        quality = "maj7"  // minor-major7 → treat as maj7
  else if (/^(m7|min7)/i.test(suffix))                          quality = "min7"
  else if (/^(m|min)(?!aj)/i.test(suffix))                      quality = "minor"
  else if (/^7/.test(suffix))                                    quality = "dom7"
  else if (/^(dim|°)/.test(suffix))                             quality = "dim"
  else if (/^(ø|m7b5|hdim|halfdim)/i.test(suffix))             quality = "halfdim"
  else if (/^(aug|\+)/.test(suffix))                             quality = "aug"
  else if (/^sus2/.test(suffix))                                 quality = "sus2"
  else if (/^sus/.test(suffix))                                  quality = "sus4"
  else                                                           quality = "major"

  return { rootIdx, quality }
}

// Main export: chord symbol → [D4 fret, G4 fret, B4 fret, D5 fret]
export function chordToTab(symbol: string): number[] {
  const parsed = parseChordSymbol(symbol)
  if (!parsed) return [0, 0, 0, 0]

  const { rootIdx, quality } = parsed
  const formula = getFormulaFrets(rootIdx, quality)
  if (formula) return formula.map((f) => f ?? 0)

  const intervals = CHORD_INTERVALS[quality] ?? [0, 4, 7]
  const notes = intervals.map((i) => CHROMATIC[(rootIdx + i) % 12])
  return greedyFrets(notes, 2).map((f) => f ?? 0)
}
