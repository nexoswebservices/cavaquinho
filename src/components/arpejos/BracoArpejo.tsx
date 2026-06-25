"use client"

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const TUNING_MIDI = [62, 67, 71, 74] // D4, G4, B4, D5
const TUNING_LABELS = ["D", "G", "B", "D"]
const MAX_FRET = 12

function midiToNote(midi: number): string {
  return CHROMATIC[midi % 12]
}

interface Position {
  string: number
  fret: number
  note: string
  order: number
}

function findArpejoPositions(
  chordNotes: string[],
  sequence: number[],
  startFret: number,
): Position[] {
  const noteSet = chordNotes.map((n) => CHROMATIC.indexOf(n))
  const positions: Position[] = []

  for (let si = 0; si < sequence.length; si++) {
    const noteIdx = noteSet[sequence[si] % noteSet.length]
    let bestString = -1
    let bestFret = -1
    let bestDist = Infinity

    for (let s = 0; s < 4; s++) {
      for (let f = 0; f <= MAX_FRET; f++) {
        const midi = TUNING_MIDI[s] + f
        if (midi % 12 === noteIdx) {
          const dist = Math.abs(f - startFret - 2)
          const alreadyUsed = positions.some((p) => p.string === s && p.fret === f && p.order !== si)
          if (dist < bestDist && !alreadyUsed) {
            bestDist = dist
            bestString = s
            bestFret = f
          }
        }
      }
    }

    if (bestString >= 0) {
      positions.push({
        string: bestString,
        fret: bestFret,
        note: CHROMATIC[noteIdx],
        order: si + 1,
      })
    }
  }

  return positions
}

interface BracoArpejoProps {
  chordNotes: string[]
  sequence: number[]
  startFret?: number
}

export function BracoArpejo({ chordNotes, sequence, startFret = 0 }: BracoArpejoProps) {
  const positions = findArpejoPositions(chordNotes, sequence, startFret)

  const usedFrets = positions.filter((p) => p.fret > 0).map((p) => p.fret)
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

  const W = 140
  const H = 30 + numFrets * 28 + 20
  const LEFT = 30
  const TOP = 28
  const STRING_GAP = 22
  const FRET_H = 28
  const RIGHT = LEFT + STRING_GAP * 3

  const ORDER_COLORS = [
    "#7c3aed", "#2563eb", "#0891b2", "#059669",
    "#d97706", "#dc2626", "#9333ea", "#e11d48",
  ]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-32 h-auto flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      {showNut ? (
        <line x1={LEFT - 2} y1={TOP} x2={RIGHT + 2} y2={TOP} stroke="#a78bfa" strokeWidth={3} />
      ) : (
        <text x={LEFT - 14} y={TOP + FRET_H / 2 + 4} fontSize={10} fill="#94a3b8" textAnchor="middle">
          {displayStart}
        </text>
      )}

      {Array.from({ length: numFrets + 1 }, (_, i) => (
        <line key={`f-${i}`} x1={LEFT - 2} y1={TOP + i * FRET_H} x2={RIGHT + 2} y2={TOP + i * FRET_H} stroke="#334155" strokeWidth={1} />
      ))}

      {[0, 1, 2, 3].map((s) => (
        <line key={`s-${s}`} x1={LEFT + s * STRING_GAP} y1={TOP} x2={LEFT + s * STRING_GAP} y2={TOP + numFrets * FRET_H} stroke="#64748b" strokeWidth={s === 0 ? 1.8 : s === 3 ? 0.8 : 1.2} />
      ))}

      {TUNING_LABELS.map((label, s) => (
        <text key={`l-${s}`} x={LEFT + s * STRING_GAP} y={TOP + numFrets * FRET_H + 14} fontSize={9} fill="#64748b" textAnchor="middle">
          {label}
        </text>
      ))}

      {positions.map((pos, i) => {
        const x = LEFT + pos.string * STRING_GAP
        const color = ORDER_COLORS[i % ORDER_COLORS.length]

        if (pos.fret === 0) {
          return (
            <g key={`p-${i}`}>
              <circle cx={x} cy={TOP - 8} r={6} fill={color} />
              <text x={x} y={TOP - 5} fontSize={8} fill="white" textAnchor="middle" fontWeight="bold">
                {pos.order}
              </text>
            </g>
          )
        }

        const fretPos = pos.fret - displayStart
        const y = TOP + fretPos * FRET_H + FRET_H / 2

        return (
          <g key={`p-${i}`}>
            <circle cx={x} cy={y} r={9} fill={color} />
            <text x={x} y={y + 3.5} fontSize={8} fill="white" textAnchor="middle" fontWeight="bold">
              {pos.order}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
