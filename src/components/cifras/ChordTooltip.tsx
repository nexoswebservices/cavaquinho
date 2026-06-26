"use client"

import { useEffect, useRef } from "react"
import { BracoCavaquinho } from "@/components/progressoes/BracoCavaquinho"
import { PlayButton } from "@/components/ui/PlayButton"

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const TO_SHARP: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" }

function noteAtSemitone(root: string, semitones: number): string {
  const idx = CHROMATIC.indexOf(root)
  if (idx === -1) return root
  return CHROMATIC[(idx + semitones) % 12]
}

function parseChordForTooltip(chord: string): { root: string; notes: string[] } {
  const match = chord.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return { root: "C", notes: ["C", "E", "G"] }

  const root = TO_SHARP[match[1]] ?? match[1]
  const q = match[2].replace(/\/[A-G][#b]?$/, "") // remove bass note

  const intervals: number[] = []

  // Determinar tríade base
  const isMinor = /^m(?!aj)/.test(q) || /m\d/.test(q) || q.includes("m7") || q.includes("m9")
  const isDim = /dim|º|ø/.test(q) || /m7[/(]?b?5[-b)]?/.test(q) || /m7b5/.test(q) || /5-/.test(q) || /m5-/.test(q)
  const isAug = /aug|\+|5\+|#5/.test(q) && !/5\+7/.test(q) // 5+7 é aug+7

  if (isDim) {
    intervals.push(0, 3, 6) // dim triad
  } else if (isAug) {
    intervals.push(0, 4, 8) // aug triad
  } else if (isMinor) {
    intervals.push(0, 3, 7) // minor triad
  } else if (/sus4|sus$/.test(q)) {
    intervals.push(0, 5, 7)
  } else if (/sus2/.test(q)) {
    intervals.push(0, 2, 7)
  } else {
    intervals.push(0, 4, 7) // major triad
  }

  // Extensões de 7ª
  if (/7M|maj7|7\+(?!\d)|M$/.test(q) && !/5\+7/.test(q)) {
    intervals.push(11) // major 7th
  } else if (/º7|dim7/.test(q)) {
    intervals.push(9) // diminished 7th
  } else if (/7/.test(q)) {
    intervals.push(10) // dominant 7th
  }

  // 5+7 pattern (augmented with 7)
  if (/5\+7/.test(q)) {
    // Replace 5th with aug 5th if not already
    const idx5 = intervals.indexOf(7)
    if (idx5 !== -1) intervals[idx5] = 8
    if (!intervals.includes(10)) intervals.push(10)
  }

  // Extensões superiores
  if (/9/.test(q) && !/\/9/.test(q) && !/#9/.test(q) && !/b9/.test(q)) {
    intervals.push(14)
  }
  if (/11/.test(q) && !/\/11/.test(q)) {
    intervals.push(17)
  }
  if (/13/.test(q) && !/b13/.test(q) && !/\/13/.test(q)) {
    intervals.push(21)
  }

  // Alterações
  if (/#9/.test(q) || /9\+/.test(q) || /\+9/.test(q)) intervals.push(15)
  if (/b9/.test(q) || /9-/.test(q) || /-9/.test(q)) intervals.push(13)
  if (/#5/.test(q) || /5\+/.test(q)) {
    const idx5 = intervals.indexOf(7)
    if (idx5 !== -1) intervals[idx5] = 8
  }
  if (/b5/.test(q) || /5-/.test(q) || /-5/.test(q)) {
    const idx5 = intervals.indexOf(7)
    if (idx5 !== -1) intervals[idx5] = 6
  }
  if (/b13/.test(q) || /13-/.test(q) || /-13/.test(q)) intervals.push(20)
  if (/6/.test(q) && !/16/.test(q) && !/b6/.test(q)) {
    if (!intervals.includes(9)) intervals.push(9)
  }
  if (/4/.test(q) && !/sus4/.test(q) && !/14/.test(q)) {
    if (!intervals.includes(5)) intervals.push(5)
  }

  // Deduplicate and sort
  const unique = Array.from(new Set(intervals)).sort((a, b) => a - b)
  const notes = unique.map((s) => noteAtSemitone(root, s % 12))

  return { root, notes }
}

interface ChordTooltipProps {
  chord: string
  position: { x: number; y: number }
  onClose: () => void
}

export function ChordTooltip({ chord, position, onClose }: ChordTooltipProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose])

  const { notes: chordNotes } = parseChordForTooltip(chord)
  const playNotes: [string, number][] = chordNotes.map((n) => [n, 4])

  return (
    <div
      ref={ref}
      className="fixed z-[100] bg-[#120d24] border border-violet-500/30 rounded-xl p-3 shadow-2xl shadow-violet-900/40"
      style={{
        left: Math.min(position.x - 60, window.innerWidth - 160),
        top: Math.max(position.y - 200, 10),
      }}
    >
      <div className="flex items-start gap-3">
        <BracoCavaquinho chordNotes={chordNotes} voicingIndex={0} />
        <div className="flex flex-col items-center gap-2">
          <p className="text-white font-bold font-mono text-lg">{chord}</p>
          <p className="text-violet-300 font-mono text-xs">{chordNotes.join(" – ")}</p>
          <PlayButton notes={playNotes} size="md" label={`Tocar ${chord}`} />
        </div>
      </div>
    </div>
  )
}
