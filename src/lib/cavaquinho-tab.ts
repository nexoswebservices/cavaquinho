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
  major:   [0, 4, 7],
  minor:   [0, 3, 7],
  dom7:    [0, 4, 7, 10],
  maj7:    [0, 4, 7, 11],
  min7:    [0, 3, 7, 10],
  dim:     [0, 3, 6],
  halfdim: [0, 3, 6, 10],
  aug:     [0, 4, 8],
  sus4:    [0, 5, 7],
  sus2:    [0, 2, 7],
}

// Convenção de "corda" pra notas MELÓDICAS individuais (1=D5 mais aguda,
// no topo do desenho da tablatura, até 4=D4 mais grave, embaixo) — mesma
// ordem usada em STRING_LABELS/PartituraCompleta.tsx e em
// nandinho-numeric-tab.ts. NÃO confundir com a convenção usada acima em
// chordToTab/getFormulaFrets, que retorna um shape de acorde inteiro (as 4
// cordas tocadas juntas) na ordem grave→aguda [D4,G4,B4,D5].
const TUNING_MIDI_MELODIA = [74, 71, 67, 62] // corda 1(D5) .. corda 4(D4)

// Acha a posição de traste mais tocável pra UMA nota melódica isolada (não
// um acorde inteiro) — usado quando já sabemos a nota+oitava exatas (ex:
// lidas via Vision de uma partitura de verdade) e precisamos de uma corda e
// traste específicos pra desenhar/tocar. Prefere ficar perto da posição
// anterior, pra gerar uma tablatura que faça sentido de mão (evita pular de
// ponta a ponta do braço a cada nota).
export function notaParaCordaTraste(
  nota: string,
  octave: number,
  posicaoAnterior?: { string: number; fret: number }
): { string: number; fret: number } | null {
  const sharp = toSharp(nota)
  const noteIdx = CHROMATIC.indexOf(sharp)
  if (noteIdx === -1) return null
  const targetMidi = (octave + 1) * 12 + noteIdx

  const candidatos: { string: number; fret: number }[] = []
  TUNING_MIDI_MELODIA.forEach((openMidi, i) => {
    const fret = targetMidi - openMidi
    if (fret >= 0 && fret <= MAX_FRET) candidatos.push({ string: i + 1, fret })
  })
  if (candidatos.length === 0) return null

  if (!posicaoAnterior) return candidatos.sort((a, b) => a.fret - b.fret)[0]

  return candidatos.sort((a, b) => {
    const distA = Math.abs(a.fret - posicaoAnterior.fret) + (a.string !== posicaoAnterior.string ? 0.5 : 0)
    const distB = Math.abs(b.fret - posicaoAnterior.fret) + (b.string !== posicaoAnterior.string ? 0.5 : 0)
    return distA - distB
  })[0]
}

// Nomes das notas que formam o acorde (ex: "Dm7" → ["D","F","A","C"]).
// Usado pra alimentar o diagrama do braço (BracoCavaquinho), que precisa
// das notas de verdade — não dá pra desenhar o shape a partir só do tab.
export function chordToNotes(symbol: string): string[] {
  const parsed = parseChordSymbol(symbol)
  if (!parsed) return []
  const { rootIdx, quality } = parsed
  const intervals = CHORD_INTERVALS[quality] ?? [0, 4, 7]
  return intervals.map((i) => CHROMATIC[(rootIdx + i) % 12])
}

// Parse chord symbol (e.g. "Cm7", "G7", "Bbmaj7", "F#dim") to rootIdx + quality
export function parseChordSymbol(symbol: string): { rootIdx: number; quality: string } | null {
  const noSlash = symbol.split("/")[0].trim()

  const rootMatch = noSlash.match(/^([A-G][b#]?)/)
  if (!rootMatch) return null

  const rootIdx = CHROMATIC.indexOf(toSharp(rootMatch[1]))
  if (rootIdx === -1) return null

  let suffix = noSlash.slice(rootMatch[1].length).replace(/\([^)]*\)/g, "").trim()

  // Notação brasileira: 7M = Maj7 (ex: C7M → Cmaj7)
  suffix = suffix.replace(/^7M/, "maj7").replace(/^9M/, "maj9")

  let quality: string
  if (/^(maj7|maj9|M7)/i.test(suffix))                          quality = "maj7"
  else if (/^(mM7|mmaj7)/i.test(suffix))                        quality = "maj7"
  else if (/^(m7|min7|m9|m11|m13)/i.test(suffix))              quality = "min7"
  else if (/^(m|min)(?!aj)/i.test(suffix))                      quality = "minor"
  else if (/^(7|9|11|13)/.test(suffix))                         quality = "dom7"  // X7, X9, X11 → dominant
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
