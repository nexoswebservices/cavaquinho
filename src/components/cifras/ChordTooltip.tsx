"use client"

import { useEffect, useRef } from "react"
import { BracoCavaquinho } from "@/components/progressoes/BracoCavaquinho"
import { PlayButton } from "@/components/ui/PlayButton"

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const TO_SHARP: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" }

const QUALITY_INTERVALS: Record<string, number[]> = {
  "": [0, 4, 7],
  m: [0, 3, 7],
  "7": [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
  "7M": [0, 4, 7, 11],
  dim: [0, 3, 6],
  "º": [0, 3, 6],
  aug: [0, 4, 8],
  "+": [0, 4, 8],
  sus4: [0, 5, 7],
  sus2: [0, 2, 7],
  "6": [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  "9": [0, 4, 7, 10, 14],
  m9: [0, 3, 7, 10, 14],
  "dim7": [0, 3, 6, 9],
  "º7": [0, 3, 6, 9],
  "m7(b5)": [0, 3, 6, 10],
  "m7(5-)": [0, 3, 6, 10],
}

function parseChordForTooltip(chord: string): { root: string; quality: string; intervals: number[] } {
  const match = chord.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return { root: "C", quality: "", intervals: [0, 4, 7] }

  const root = TO_SHARP[match[1]] ?? match[1]
  const qualityRaw = match[2].replace(/\/.*$/, "")

  for (const [q, intervals] of Object.entries(QUALITY_INTERVALS)) {
    if (qualityRaw === q) return { root, quality: q, intervals }
  }

  if (qualityRaw.startsWith("m") && !qualityRaw.startsWith("maj")) {
    return { root, quality: "m", intervals: QUALITY_INTERVALS["m"] }
  }
  if (qualityRaw.includes("7")) {
    return { root, quality: "7", intervals: QUALITY_INTERVALS["7"] }
  }

  return { root, quality: "", intervals: [0, 4, 7] }
}

function noteAtSemitone(root: string, semitones: number): string {
  const idx = CHROMATIC.indexOf(root)
  if (idx === -1) return root
  return CHROMATIC[(idx + semitones) % 12]
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

  const { root, intervals } = parseChordForTooltip(chord)
  const chordNotes = intervals.map((s) => noteAtSemitone(root, s % 12))
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
