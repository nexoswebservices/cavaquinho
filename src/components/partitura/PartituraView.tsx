"use client"

import { useEffect, useRef } from "react"

export interface NoteData {
  note: string
  octave: number
  duration: string
  accidental?: "#" | "b"
}

interface PartituraProps {
  notes: NoteData[]
  timeSignature?: string
  keySignature?: string
  title?: string
  width?: number
  highlightIndex?: number
}

const SHARP_NOTES = new Set(["C#", "D#", "F#", "G#", "A#"])
const FLAT_MAP: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" }

function noteToVexKey(note: string, octave: number): { key: string; accidental?: string } {
  const normalized = FLAT_MAP[note] ?? note
  const base = normalized.replace("#", "")
  const hasSharp = SHARP_NOTES.has(normalized)

  return {
    key: `${base.toLowerCase()}/${octave}`,
    accidental: hasSharp ? "#" : undefined,
  }
}

export function PartituraView({
  notes,
  timeSignature = "4/4",
  keySignature = "C",
  title,
  width: propWidth,
  highlightIndex,
}: PartituraProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || notes.length === 0) return

    let mounted = true

    const render = async () => {
      const VF = await import("vexflow")
      if (!mounted || !container) return

      container.innerHTML = ""

      const w = propWidth ?? container.clientWidth ?? 600
      const h = 160

      const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG)
      renderer.resize(w, h)
      const context = renderer.getContext()

      const staveWidth = Math.max(w - 20, 200)
      const stave = new VF.Stave(10, 25, staveWidth)
      stave.addClef("treble")
      stave.addTimeSignature(timeSignature)
      if (keySignature !== "C") {
        stave.addKeySignature(keySignature)
      }
      stave.setContext(context).draw()

      const vexNotes = notes.map((n, i) => {
        const { key, accidental } = noteToVexKey(n.note, n.octave)
        const sn = new VF.StaveNote({
          keys: [key],
          duration: n.duration,
        })
        if (accidental || n.accidental) {
          sn.addModifier(new VF.Accidental(accidental ?? n.accidental!))
        }

        if (highlightIndex !== undefined && i === highlightIndex) {
          sn.setStyle({ fillStyle: "#a78bfa", strokeStyle: "#a78bfa" })
        }

        return sn
      })

      if (vexNotes.length > 0) {
        const voice = new VF.Voice({ numBeats: notes.length, beatValue: 4 }).setMode(
          VF.Voice.Mode.SOFT
        )
        voice.addTickables(vexNotes)

        new VF.Formatter().joinVoices([voice]).format([voice], staveWidth - 80)
        voice.draw(context, stave)

        // Agrupa colcheias/semicolcheias em feixes, quebrando por tempo (sem
        // "groups" o VexFlow tenta beamar todas as notas numa barra só).
        const beams = VF.Beam.generateBeams(vexNotes, { groups: [new VF.Fraction(1, 4)] })
        beams.forEach((b) => b.setContext(context).draw())
      }
    }

    render()

    return () => {
      mounted = false
    }
  }, [notes, timeSignature, keySignature, propWidth, highlightIndex])

  return (
    <div className="overflow-x-auto vf-partitura">
      {title && <p className="text-xs text-slate-500 mb-1">{title}</p>}
      <div ref={containerRef} className="min-h-[160px]" />
    </div>
  )
}
