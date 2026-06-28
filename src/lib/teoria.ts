const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
type Note = (typeof NOTES)[number]

const ENARM: Record<string, string> = {
  Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#', Cb: 'B', Fb: 'E',
}

export function normNote(n: string): string {
  return ENARM[n] ?? n
}

export function noteIdx(n: string): number {
  return NOTES.indexOf(normNote(n) as Note)
}

// Scale interval patterns (semitones from root)
const MAJOR = [0, 2, 4, 5, 7, 9, 11]
const NAT_MINOR = [0, 2, 3, 5, 7, 8, 10]

export type Quality = 'M' | 'm' | 'd7' | 'dim' | 'hdim' | 'aug' | 'sus'

export interface Chord {
  root: string
  quality: Quality
  original: string
}

export function parseChord(token: string): Chord | null {
  const t = token.trim()
  if (!t) return null

  // Strip bass note from slash chord
  const main = t.replace(/\/[A-G][b#]?$/, '')

  const m = main.match(/^([A-G][b#]?)(.*)$/)
  if (!m) return null

  const root = normNote(m[1])
  if (noteIdx(root) === -1) return null

  const suf = m[2]

  // Check for b5/5- inside parentheses
  const flat5 = /\([^)]*(?:5[-b]|b5)[^)]*\)/.test(suf)

  // Strip parenthesized extensions for quality detection
  const s = suf.replace(/\([^)]*\)/g, '')

  let quality: Quality

  if (/dim|[ºø]/.test(s)) {
    quality = flat5 || /ø|m7/.test(s) ? 'hdim' : 'dim'
  } else if (/^m(?!aj)|^min/.test(s)) {
    quality = flat5 ? 'hdim' : 'm'
  } else if (/aug|\+$/.test(s)) {
    quality = 'aug'
  } else if (/sus/.test(s)) {
    quality = 'sus'
  } else if (/^7(?![M+])|^[6-9](?!\+)|^1[13]/.test(s)) {
    quality = 'd7'
  } else {
    quality = 'M'
  }

  return { root, quality, original: t }
}

export function parseProgression(text: string): Chord[] {
  return text
    .split(/[\s\n\r|,;]+/)
    .filter((t) => /^[A-G]/.test(t))
    .flatMap((t) => {
      const c = parseChord(t)
      return c ? [c] : []
    })
}

// Diatonic chord qualities per scale degree
const MAJ_Q: Quality[] = ['M', 'm', 'm', 'M', 'd7', 'm', 'dim']
const MIN_Q: Quality[] = ['m', 'hdim', 'M', 'm', 'd7', 'M', 'dim']

export type Mode = 'major' | 'minor'

export interface KeyResult {
  root: string
  mode: Mode
  label: string
  score: number
}

function scaleOf(root: string, intervals: number[]): string[] {
  const r = noteIdx(root)
  return intervals.map((i) => NOTES[(r + i) % 12] as Note)
}

function qualityScore(q: Quality, dq: Quality): number {
  if (q === dq) return 2
  if (q === 'M' && dq === 'd7') return 1
  if (q === 'd7' && dq === 'M') return 1
  if (q === 'hdim' && dq === 'dim') return 1
  if (q === 'm' && dq === 'hdim') return 1
  return 0
}

export function detectKey(chords: Chord[]): KeyResult[] {
  if (!chords.length) return []

  const results: KeyResult[] = []

  for (const root of NOTES) {
    for (const [mode, intervals, dQ] of [
      ['major', MAJOR, MAJ_Q],
      ['minor', NAT_MINOR, MIN_Q],
    ] as const) {
      const scale = scaleOf(root, intervals as number[])
      let score = 0
      for (const chord of chords) {
        const i = scale.indexOf(chord.root)
        if (i === -1) {
          score -= 1
        } else {
          score += 1 + qualityScore(chord.quality, (dQ as Quality[])[i])
        }
      }
      results.push({
        root,
        mode: mode as Mode,
        label: `${root} ${mode === 'major' ? 'maior' : 'menor'}`,
        score,
      })
    }
  }

  return results.sort((a, b) => b.score - a.score)
}

// Degree analysis
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const

export interface DegreeInfo {
  chord: Chord
  degree: string
  fn: string
  diatonic: boolean
}

const MAJ_FN = [
  'Tônica', 'Supertônica', 'Mediante', 'Subdominante',
  'Dominante', 'Superdominante', 'Sensível',
]
const MIN_FN = [
  'Tônica', 'Supertônica', 'Mediante', 'Subdominante',
  'Dominante', 'Superdominante', 'Subtônica',
]

function isMinorQuality(q: Quality): boolean {
  return q === 'm' || q === 'dim' || q === 'hdim'
}

export function analyzeDegrees(chords: Chord[], key: KeyResult): DegreeInfo[] {
  const intervals = key.mode === 'major' ? MAJOR : NAT_MINOR
  const scale = scaleOf(key.root, intervals)
  const dQ = key.mode === 'major' ? MAJ_Q : MIN_Q
  const fns = key.mode === 'major' ? MAJ_FN : MIN_FN

  return chords.map((chord) => {
    const i = scale.indexOf(chord.root)

    if (i >= 0) {
      // Root is diatonic — check if quality is roughly expected
      const expectedQ = dQ[i]
      const roughly = qualityScore(chord.quality, expectedQ) > 0 || chord.quality === expectedQ

      // If chord is dominant-ish where minor is expected → may be secondary dominant
      // Check secondary dominant first for this case
      if (
        (chord.quality === 'd7' || chord.quality === 'M') &&
        (expectedQ === 'm' || expectedQ === 'dim' || expectedQ === 'hdim')
      ) {
        // See if it resolves as V(7)/x
        for (let j = 0; j < scale.length; j++) {
          const targetNote = scale[j]
          const fifth = NOTES[(noteIdx(targetNote) + 7) % 12]
          if (chord.root === fifth) {
            const targetRoman = isMinorQuality(dQ[j])
              ? ROMAN[j].toLowerCase()
              : ROMAN[j]
            return {
              chord,
              degree: chord.quality === 'd7' ? `V7/${targetRoman}` : `V/${targetRoman}`,
              fn: 'Dominante secundária',
              diatonic: false,
            }
          }
        }
      }

      // Show as diatonic degree
      const roman = isMinorQuality(chord.quality) ? ROMAN[i].toLowerCase() : ROMAN[i]
      let degree: string
      if (chord.quality === 'dim' || chord.quality === 'hdim') {
        degree = ROMAN[i].toLowerCase() + 'º'
      } else {
        degree = roman
        if (chord.quality === 'd7') degree += '7'
      }

      return { chord, degree, fn: fns[i], diatonic: true }
    }

    // Root not in scale — check secondary dominant
    if (chord.quality === 'd7' || chord.quality === 'M') {
      for (let j = 0; j < scale.length; j++) {
        const fifth = NOTES[(noteIdx(scale[j]) + 7) % 12]
        if (chord.root === fifth) {
          const targetRoman = isMinorQuality(dQ[j])
            ? ROMAN[j].toLowerCase()
            : ROMAN[j]
          return {
            chord,
            degree: chord.quality === 'd7' ? `V7/${targetRoman}` : `V/${targetRoman}`,
            fn: 'Dominante secundária',
            diatonic: false,
          }
        }
      }
    }

    // Try to label as chromatic alteration
    const ci = noteIdx(chord.root)
    for (let j = 0; j < scale.length; j++) {
      const si = noteIdx(scale[j])
      if ((ci + 1) % 12 === si) {
        return { chord, degree: '♭' + ROMAN[j], fn: 'Empréstimo modal', diatonic: false }
      }
      if ((ci - 1 + 12) % 12 === si) {
        return { chord, degree: '♯' + ROMAN[j], fn: 'Cromatismo', diatonic: false }
      }
    }

    return { chord, degree: '?', fn: 'Não identificado', diatonic: false }
  })
}

// Cadence detection
export interface Cadence {
  start: number
  chords: string[]
  label: string
}

export function detectCadences(degrees: DegreeInfo[]): Cadence[] {
  const cadences: Cadence[] = []
  const D = degrees.map((d) => d.degree)

  const patterns: [string[], string][] = [
    [['ii', 'V7', 'I'], 'ii – V7 – I (Cadência jazz/samba)'],
    [['ii7', 'V7', 'I'], 'ii7 – V7 – I (Cadência jazz)'],
    [['ii', 'V7', 'i'], 'ii – V7 – i (Cadência ao menor)'],
    [['V7', 'I'], 'V7 – I (Cadência autêntica perfeita)'],
    [['V', 'I'], 'V – I (Cadência autêntica)'],
    [['V7', 'i'], 'V7 – i (Cadência autêntica no menor)'],
    [['IV', 'I'], 'IV – I (Cadência plagal)'],
    [['IV', 'i'], 'IV – i (Cadência plagal no menor)'],
    [['V7', 'VI'], 'V7 – VI (Cadência deceptiva)'],
    [['V7', 'vi'], 'V7 – vi (Cadência deceptiva)'],
    [['I', 'V'], 'I – V (Meia cadência)'],
    [['i', 'V7'], 'i – V7 (Dominante no menor)'],
  ]

  for (let i = 0; i < D.length; i++) {
    for (const [pattern, label] of patterns) {
      if (i + pattern.length > D.length) continue
      const slice = D.slice(i, i + pattern.length)
      const match = pattern.every((p, k) => slice[k].toLowerCase() === p.toLowerCase())
      if (match) {
        cadences.push({ start: i, chords: slice, label })
        i += pattern.length - 1
        break
      }
    }
  }

  return cadences
}

// Campo harmônico: generate the 7 diatonic chords for a key
export type HarmonicFunction = "Tônica" | "Subdominante" | "Dominante"

export interface CampoChord {
  degree: string
  root: string
  quality: Quality
  label: string
  example: string
  fn: HarmonicFunction
  tensions: string[]
}

const MAJ_HARMONIC_FN: HarmonicFunction[] = [
  "Tônica", "Subdominante", "Tônica", "Subdominante",
  "Dominante", "Tônica", "Dominante",
]
const MIN_HARMONIC_FN: HarmonicFunction[] = [
  "Tônica", "Subdominante", "Tônica", "Subdominante",
  "Dominante", "Subdominante", "Dominante",
]
const MAJ_TENSIONS: string[][] = [
  ["9", "13"],       // I maj7
  ["9", "11"],       // ii m7
  ["11"],            // iii m7
  ["9", "#11"],      // IV maj7
  ["9", "b9", "#9", "#11", "13", "b13"], // V 7
  ["9", "11"],       // vi m7
  ["11", "b13"],     // vii° ø
]
const MIN_TENSIONS: string[][] = [
  ["9", "11"],       // i m7
  ["11", "b13"],     // ii° ø
  ["9", "13"],       // III maj7
  ["9", "11"],       // iv m7
  ["b9", "b13"],     // V 7
  ["9", "#11"],      // VI maj7
  [],                // vii° dim
]

const QUALITY_LABEL: Record<Quality, string> = {
  M: 'maior',
  m: 'menor',
  d7: 'dom7',
  dim: 'diminuto',
  hdim: 'meio-dim',
  aug: 'aum',
  sus: 'sus',
}

// Preferred display names (sharps → flats for common keys)
const FLAT_KEYS = new Set(['F', 'A#', 'D#', 'G#', 'C#', 'F#'])
const FLAT_MAP: Record<string, string> = {
  'A#': 'Bb', 'D#': 'Eb', 'G#': 'Ab', 'C#': 'Db', 'F#': 'Gb',
}

function displayNote(n: string, keyRoot: string): string {
  if (FLAT_KEYS.has(keyRoot) && FLAT_MAP[n]) return FLAT_MAP[n]
  return n
}

export function campoHarmonico(root: string, mode: Mode): CampoChord[] {
  const intervals = mode === 'major' ? MAJOR : NAT_MINOR
  const scale = scaleOf(root, intervals)
  const dQ = mode === 'major' ? MAJ_Q : MIN_Q
  const romans = ROMAN

  const hFn = mode === 'major' ? MAJ_HARMONIC_FN : MIN_HARMONIC_FN
  const hTensions = mode === 'major' ? MAJ_TENSIONS : MIN_TENSIONS

  return scale.map((note, i) => {
    const quality = dQ[i]
    const isMin = quality === 'm' || quality === 'dim' || quality === 'hdim'
    const roman = isMin ? romans[i].toLowerCase() : romans[i]

    const displayRoot = displayNote(note, root)
    const suffix = quality === 'm' ? 'm'
      : quality === 'd7' ? '7'
      : quality === 'dim' ? 'º'
      : quality === 'hdim' ? 'm7(5-)'
      : ''

    return {
      degree: roman,
      root: displayRoot,
      quality,
      label: QUALITY_LABEL[quality],
      example: displayRoot + suffix,
      fn: hFn[i],
      tensions: hTensions[i],
    }
  })
}
