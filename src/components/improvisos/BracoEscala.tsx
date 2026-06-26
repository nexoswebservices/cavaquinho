"use client"

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const TUNING_MIDI = [62, 67, 71, 74]
const TUNING_LABELS = ["D", "G", "B", "D"]
const NUM_FRETS = 12

function midiToNote(midi: number): string {
  return CHROMATIC[midi % 12]
}

// Cores por grau da escala (índice no array de intervalos)
export const DEGREE_COLORS = [
  "#7c3aed", // 1º grau (tônica) — violet
  "#2563eb", // 2º — blue
  "#0891b2", // 3º — cyan
  "#059669", // 4º — green
  "#d97706", // 5º — amber
  "#ea580c", // 6º — orange
  "#e11d48", // 7º — rose
  "#7c3aed", // 8º+ (repete)
  "#2563eb",
  "#0891b2",
  "#059669",
  "#d97706",
]

interface ActivePosition {
  string: number
  fret: number
}

interface BracoEscalaProps {
  root: string
  intervalos: number[]
  highlightNotes?: string[]
  activeNoteIdx?: number
  activePosition?: ActivePosition
}

export function BracoEscala({ root, intervalos, activeNoteIdx, activePosition }: BracoEscalaProps) {
  const rootIdx = CHROMATIC.indexOf(root)
  const scaleNoteMap = new Map<number, number>()
  intervalos.forEach((interval, degreeIdx) => {
    scaleNoteMap.set((rootIdx + interval) % 12, degreeIdx)
  })

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

        {/* Fret markers */}
        {[3, 5, 7, 9].map((f) => (
          <circle key={`m-${f}`} cx={LEFT + f * FRET_W - FRET_W / 2} cy={TOP + 1.5 * STRING_GAP} r={3} fill="#1e1b4b" />
        ))}
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

        {/* Scale notes com cores por grau */}
        {[0, 1, 2, 3].map((s) =>
          Array.from({ length: NUM_FRETS + 1 }, (_, f) => {
            const midi = TUNING_MIDI[s] + f
            const noteIdx = midi % 12
            const degreeIdx = scaleNoteMap.get(noteIdx)
            if (degreeIdx === undefined) return null

            const isActive = activePosition
              ? activePosition.string === s && activePosition.fret === f
              : activeNoteIdx !== undefined && degreeIdx === activeNoteIdx

            const x = f === 0 ? LEFT : LEFT + f * FRET_W - FRET_W / 2
            const y = TOP + s * STRING_GAP
            const note = midiToNote(midi)
            const color = DEGREE_COLORS[degreeIdx]
            const r = isActive ? 10 : 7

            return (
              <g key={`n-${s}-${f}`}>
                {isActive && (
                  <circle cx={x} cy={y} r={14} fill={color} opacity={0.25} />
                )}
                <circle
                  cx={x} cy={y} r={r}
                  fill={isActive ? "#ffffff" : color}
                  stroke={isActive ? color : "none"}
                  strokeWidth={isActive ? 2.5 : 0}
                  opacity={isActive ? 1 : 0.85}
                />
                <text
                  x={x} y={y + 3} fontSize={isActive ? 8 : 7}
                  fill={isActive ? color : "white"}
                  textAnchor="middle"
                  fontWeight={degreeIdx === 0 || isActive ? "bold" : "normal"}
                >
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
