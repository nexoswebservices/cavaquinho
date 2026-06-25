"use client"

export interface TabNote {
  string: number  // 1-4 (1=mais aguda D5, 4=mais grave D4)
  fret: number
  duration?: string
}

interface TablaturaProps {
  notes: TabNote[]
  tuning?: string[]
  width?: number
}

const DEFAULT_TUNING = ["D", "B", "G", "D"]

export function TablaturaView({ notes, tuning = DEFAULT_TUNING, width }: TablaturaProps) {
  const numStrings = tuning.length
  const noteSpacing = 40
  const leftPad = 30
  const rightPad = 20
  const topPad = 10
  const stringGap = 16
  const w = width ?? Math.max(leftPad + notes.length * noteSpacing + rightPad, 200)
  const h = topPad * 2 + (numStrings - 1) * stringGap + 20

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      {/* TAB label */}
      <text x={8} y={topPad + ((numStrings - 1) * stringGap) / 2 + 4} fontSize={10} fill="#64748b" fontWeight="bold">
        TAB
      </text>

      {/* Strings */}
      {Array.from({ length: numStrings }, (_, i) => {
        const y = topPad + i * stringGap
        return (
          <g key={`s-${i}`}>
            <line x1={leftPad} y1={y} x2={w - rightPad} y2={y} stroke="#334155" strokeWidth={0.8} />
            {/* Tuning label at end */}
            <text x={w - rightPad + 6} y={y + 3.5} fontSize={8} fill="#475569">
              {tuning[i]}
            </text>
          </g>
        )
      })}

      {/* Fret numbers */}
      {notes.map((n, i) => {
        const x = leftPad + 20 + i * noteSpacing
        const y = topPad + (n.string - 1) * stringGap

        return (
          <g key={`n-${i}`}>
            {/* White background to cover string line */}
            <rect
              x={x - 6}
              y={y - 7}
              width={12}
              height={14}
              fill="#0a0714"
              rx={2}
            />
            <text
              x={x}
              y={y + 4}
              fontSize={11}
              fill="#e2e8f0"
              textAnchor="middle"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {n.fret}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
