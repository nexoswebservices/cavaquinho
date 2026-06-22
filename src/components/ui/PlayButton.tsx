"use client"

import { useState, useCallback } from "react"
import { initSampler, playChord, isReady } from "@/lib/sampler"

interface PlayButtonProps {
  notes: [string, number][]
  size?: "sm" | "md"
  label?: string
}

export function PlayButton({ notes, size = "sm", label }: PlayButtonProps) {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePlay = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isReady()) {
      setLoading(true)
      await initSampler()
      setLoading(false)
    }

    setPlaying(true)
    playChord(notes)
    setTimeout(() => setPlaying(false), 800)
  }, [notes])

  const sizeClass = size === "md"
    ? "w-10 h-10 text-lg"
    : "w-8 h-8 text-sm"

  return (
    <button
      onClick={handlePlay}
      title={label ?? "Tocar acorde"}
      className={`${sizeClass} rounded-xl flex items-center justify-center transition-all ${
        playing
          ? "bg-violet-600 text-white scale-110"
          : loading
            ? "bg-white/10 text-slate-500 animate-pulse"
            : "bg-white/5 text-slate-400 hover:bg-violet-600/20 hover:text-violet-300"
      }`}
    >
      {loading ? "..." : playing ? "♪" : "▶"}
    </button>
  )
}
