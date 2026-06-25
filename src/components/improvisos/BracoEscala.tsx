"use client"

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const TUNING_MIDI = [62, 67, 71, 74]
const TUNING_LABELS = ["D", "G", "B", "D"]
const NUM_FRETS = 12

function midiToNote(midi: number): string {
  return CHROMATIC[midi % 12]
}

interface BracoEscalaProps {
  root: string
  intervalos: number[]
  highlightNotes?: string[]
}

export function BracoEscala({ root, intervalos, highlightNotes }: BracoEscalaProps) {
  const rootIdx = CHROMATIC.indexOf(root)
  const scaleNotes = new Set(intervalos.map((i) => (rootIdx + i) % 12))
  const highlightSet = highlightNotes
    ? new Set(highlightNotes.map((n) => CHROMATIC.indexOf(n)))
    : null

  const FRET_W = 38
  const STRING_GAP = 20
  const LEFT = 28
  const TOP = 24
  const W = LEFT + NUM_FRETS * FRET_W + 20
  const H = TOP + 3 * STRING_GAP + 30

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto min-w-[500px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Nut */}
        <line x1={LEFT} y1={TOP - 2} x2={LEFT} y2={TOP + 3 * STRING_GAP + 2} stroke="#a78bfa" strokeWidth={3} />

        {/* Fret lines */}
        {Array.from({ length: NUM_FRETS }, (_, f) => {
          const x = LEFT + (f + 1) * FRET_W
          return <line key={`f-${f}`} x1={x} y1={TOP - 2} x2={x} y2={TOP + 3 * STRING_GAP + 2} stroke="#334155" strokeWidth={1} />
        })}

        {/* Fret markers (dots) */}
        {[3, 5, 7, 9].map((f) => {
          const x = LEFT + f * FRET_W - FRET_W / 2
          const y = TOP + 1.5 * STRING_GAP
          return <circle key={`m-${f}`} cx={x} cy={y} r={3} fill="#1e1b4b" />
        })}
        {/* Double dot at 12 */}
        <circle cx={LEFT + 12 * FRET_W - FRET_W / 2} cy={TOP + 0.8 * STRING_GAP} r={3} fill="#1e1b4b" />
        <circle cx={LEFT + 12 * FRET_W - FRET_W / 2} cy={TOP + 2.2 * STRING_GAP} r={3} fill="#1e1b4b" />

        {/* Strings */}
        {[0, 1, 2, 3].map((s) => {
          const y = TOP + s * STRING_GAP
          return (
            <g key={`s-${s}`}>
              <line x1={LEFT} y1={y} x2={LEFT + NUM_FRETS * FRET_W} y2={y} stroke="#64748b" strokeWidth={s === 0 ? 1.8 : s === 3 ? 0.8 : 1.2} />
              <text x={8} y={y + 4} fontSize={9} fill="#64748b" textAnchor="middle">{TUNING_LABELS[s]}</text>
            </g>
          )
        })}

        {/* Fret numbers */}
        {Array.from({ length: NUM_FRETS }, (_, f) => (
          <text key={`fn-${f}`} x={LEFT + f * FRET_W + FRET_W / 2} y={TOP + 3 * STRING_GAP + 16} fontSize={8} fill="#475569" textAnchor="middle">
            {f + 1}
          </text>
        ))}

        {/* Scale notes */}
        {[0, 1, 2, 3].map((s) =>
          Array.from({ length: NUM_FRETS + 1 }, (_, f) => {
            const midi = TUNING_MIDI[s] + f
            const noteIdx = midi % 12
            if (!scaleNotes.has(noteIdx)) return null

            const isRoot = noteIdx === rootIdx
            const isHighlight = highlightSet ? highlightSet.has(noteIdx) : false
            const x = f === 0 ? LEFT - 0 : LEFT + f * FRET_W - FRET_W / 2
            const y = TOP + s * STRING_GAP
            const note = midiToNote(midi)

            let fill = "#334155"
            if (isRoot) fill = "#7c3aed"
            else if (isHighlight) fill = "#f59e0b"
            else fill = "#475569"

            return (
              <g key={`n-${s}-${f}`}>
                <circle cx={x} cy={y} r={7} fill={fill} />
                <text x={x} y={y + 3} fontSize={7} fill="white" textAnchor="middle" fontWeight={isRoot ? "bold" : "normal"}>
                  {note}
                </text>
              </g>
            )
          })
        )}
      </svg>
    </div>
  )
}
