"use client"

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

// Cavaquinho tuning: D4-G4-B4-D5 (string 4 to 1, thickest to thinnest)
const TUNING_MIDI = [62, 67, 71, 74] // D4, G4, B4, D5
const TUNING_LABELS = ["D", "G", "B", "D"]
const MAX_FRET = 12

function noteToMidi(note: string, octave: number): number {
  const idx = CHROMATIC.indexOf(note)
  if (idx === -1) return 0
  return (octave + 1) * 12 + idx
}

function midiToNote(midi: number): string {
  return CHROMATIC[midi % 12]
}

interface Voicing {
  frets: (number | null)[] // null = muted, 0 = open
  fingers: string[]
}

function findVoicing(chordNotes: string[], startFret: number): Voicing {
  const noteSet = new Set(chordNotes.map((n) => CHROMATIC.indexOf(n)))
  const frets: (number | null)[] = []
  const fingers: string[] = []

  for (let s = 0; s < 4; s++) {
    const openMidi = TUNING_MIDI[s]
    let bestFret: number | null = null
    let bestDist = Infinity

    for (let f = 0; f <= MAX_FRET; f++) {
      const noteMidi = openMidi + f
      const noteIdx = noteMidi % 12
      if (noteSet.has(noteIdx)) {
        const dist = Math.abs(f - startFret)
        if (f === 0 || (f >= startFret && f <= startFret + 4)) {
          if (dist < bestDist || bestFret === null) {
            bestFret = f
            bestDist = dist
          }
        }
      }
    }

    if (bestFret === null) {
      for (let f = 0; f <= MAX_FRET; f++) {
        const noteMidi = openMidi + f
        const noteIdx = noteMidi % 12
        if (noteSet.has(noteIdx)) {
          bestFret = f
          break
        }
      }
    }

    frets.push(bestFret)
    fingers.push(bestFret !== null ? midiToNote(openMidi + bestFret) : "X")
  }

  return { frets, fingers }
}

function getThreeVoicings(chordNotes: string[]): Voicing[] {
  const v1 = findVoicing(chordNotes, 0)
  const v2 = findVoicing(chordNotes, 4)
  const v3 = findVoicing(chordNotes, 7)
  return [v1, v2, v3]
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

  let displayStart = 1
  let showNut = true
  if (minFret > 4) {
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
