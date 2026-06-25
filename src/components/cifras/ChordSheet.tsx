"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { transposeLine } from "@/lib/transpose"
import { ChordTooltip } from "./ChordTooltip"

const CHORD_RE =
  /^[A-G](#|b)?(maj|min|dim|aug|sus|add|m)?\d*(\([^)]*\))?(\/[A-G](#|b)?\d*)?[ºø+\-]*$/i
const STD_TAB_LINE = /^[A-Ga-g]\|[-\d xhp/\\|]*\|?$/
const NUM_TAB_LINE = /^\|?\s*\d{1,3}(-\d{1,3}){2,}/
const SECTION_RE =
  /^\[.*\]$|^[\[(].*[\])]$|^(INTRO|REFRÃO|VERSO|BRIDGE|CODA|INTRODUÇÃO|SOLO|PRÉ-REFRÃO|FINAL|REFR)[:\s]*$/i

const INLINE_CHORD_RE = /\b([A-G][#b]?(?:m7?\(?b?5?\)?|7M|7\+|7|maj7|dim7?|º7?|ø|aug|sus[24]|add9|6|9|11|13|m7\(b?5[-)]|m7\(5-\))?(?:\/[A-G][#b]?)?)\b/g

function isChordToken(t: string): boolean {
  if (!t || t.length > 20) return false
  const cleaned = t.replace(/^\|+|\|+$/g, "").replace(/[()]/g, "").trim()
  if (!cleaned) return false
  return CHORD_RE.test(cleaned)
}

function classifyLine(line: string): "chord" | "lyric" | "tab" | "numtab" | "section" | "empty" | "mixed" {
  const trimmed = line.trim()
  if (!trimmed) return "empty"
  if (SECTION_RE.test(trimmed)) return "section"
  if (STD_TAB_LINE.test(trimmed)) return "tab"
  if (NUM_TAB_LINE.test(trimmed)) return "numtab"

  const tokens = trimmed
    .split(/\s+/)
    .filter((t) => t !== "|" && t !== "||" && t !== "%" && t.replace(/\|/g, "").trim())
  if (tokens.length === 0) return "empty"

  const chordCount = tokens.filter(isChordToken).length
  const ratio = chordCount / tokens.length

  if (ratio >= 0.5 && chordCount > 0) return "chord"
  if (/[a-záàâãéêíóôõúüçA-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]{2,}/.test(trimmed) && ratio < 0.5) return "lyric"
  if (chordCount > 0 && /[a-záàâãéêíóôõúüç]{3,}/i.test(trimmed)) return "mixed"

  return "lyric"
}

interface ParsedBlock {
  type: "chord-lyric" | "chord-only" | "lyric" | "section" | "tab" | "empty"
  chords?: string
  lyrics?: string
  text?: string
}

function parseContent(conteudo: string): ParsedBlock[] {
  const raw = conteudo.split("\n")
  const result: ParsedBlock[] = []
  let i = 0

  while (i < raw.length) {
    const line = raw[i]
    const cls = classifyLine(line)

    if (cls === "empty") { result.push({ type: "empty" }); i++; continue }
    if (cls === "section") { result.push({ type: "section", text: line.trim() }); i++; continue }
    if (cls === "tab" || cls === "numtab") { result.push({ type: "tab", text: line }); i++; continue }
    if (cls === "mixed") { result.push({ type: "lyric", text: line }); i++; continue }

    if (cls === "chord") {
      const chordLines: string[] = [line.trim()]
      let j = i + 1
      while (j < raw.length) {
        const nextCls = classifyLine(raw[j])
        if (nextCls === "empty") { j++; continue }
        if (nextCls === "chord") { chordLines.push(raw[j].trim()); j++ }
        else break
      }

      let nextIdx = j
      while (nextIdx < raw.length && !raw[nextIdx].trim()) nextIdx++

      const nextLine = nextIdx < raw.length ? raw[nextIdx] : ""
      const nextCls = classifyLine(nextLine)

      if ((nextCls === "lyric" || nextCls === "mixed") && chordLines.length >= 1) {
        for (let k = 0; k < chordLines.length - 1; k++) {
          result.push({ type: "chord-only", chords: chordLines[k] })
        }
        result.push({ type: "chord-lyric", chords: chordLines[chordLines.length - 1], lyrics: nextLine })
        i = nextIdx + 1
        continue
      }

      for (const cl of chordLines) result.push({ type: "chord-only", chords: cl })
      i = j
      continue
    }

    result.push({ type: "lyric", text: line })
    i++
  }

  return result
}

function renderChordLine(
  text: string,
  onChordClick: (chord: string, e: React.MouseEvent) => void,
): React.ReactNode {
  const parts: React.ReactNode[] = []
  let lastIdx = 0
  const re = new RegExp(INLINE_CHORD_RE.source, "g")
  let m: RegExpExecArray | null

  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push(<span key={`s-${lastIdx}`}>{text.slice(lastIdx, m.index)}</span>)
    }
    const chord = m[0]
    parts.push(
      <span
        key={`c-${m.index}`}
        className="text-violet-400 cursor-pointer hover:text-violet-300 hover:underline transition-colors"
        onClick={(e) => onChordClick(chord, e)}
      >
        {chord}
      </span>
    )
    lastIdx = m.index + m[0].length
  }

  if (lastIdx < text.length) {
    parts.push(<span key={`e-${lastIdx}`}>{text.slice(lastIdx)}</span>)
  }

  return parts.length > 0 ? parts : text
}

interface ChordSheetProps {
  conteudo: string
  transposeSemitones?: number
  fontSize?: number
}

export function ChordSheet({ conteudo, transposeSemitones = 0, fontSize = 14 }: ChordSheetProps) {
  const [tooltip, setTooltip] = useState<{ chord: string; x: number; y: number } | null>(null)
  const [autoScrollActive, setAutoScrollActive] = useState(false)
  const rafRef = useRef<number | null>(null)
  const scrollSpeedRef = useRef(3)

  const transposed = transposeSemitones !== 0
    ? conteudo.split("\n").map((line) => {
        const cls = classifyLine(line)
        if (cls === "chord" || cls === "mixed") return transposeLine(line, transposeSemitones)
        return line
      }).join("\n")
    : conteudo

  const blocks = parseContent(transposed)

  const handleChordClick = useCallback((chord: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setTooltip({ chord, x: e.clientX, y: e.clientY })
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (!autoScrollActive) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    let lastTime = 0
    const tick = (time: number) => {
      if (lastTime) {
        const delta = (time - lastTime) / 1000
        window.scrollBy(0, scrollSpeedRef.current * delta * 20)
      }
      lastTime = time
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [autoScrollActive])

  return (
    <div onClick={() => setTooltip(null)}>
      {/* Sheet */}
      <div
        className="font-mono overflow-x-auto bg-[#0d0920] border border-white/5 rounded-2xl px-5 py-6 select-text"
        style={{ fontSize: `${fontSize}px` }}
      >
        {blocks.map((b, i) => {
          switch (b.type) {
            case "empty":
              return <div key={i} className="h-3" />

            case "section":
              return (
                <div key={i} className="text-amber-400/90 font-bold text-[0.95em] mt-7 mb-3 first:mt-0 uppercase tracking-wide">
                  {b.text}
                </div>
              )

            case "tab":
              return (
                <div key={i} className="text-emerald-400/60 whitespace-pre text-[0.8em] leading-snug">
                  {b.text}
                </div>
              )

            case "chord-lyric":
              return (
                <div key={i} className="mb-2">
                  <div className="font-bold whitespace-pre text-[0.9em] leading-tight">
                    {renderChordLine(b.chords!, handleChordClick)}
                  </div>
                  <div className="text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {b.lyrics}
                  </div>
                </div>
              )

            case "chord-only":
              return (
                <div key={i} className="font-bold whitespace-pre mb-0.5">
                  {renderChordLine(b.chords!, handleChordClick)}
                </div>
              )

            case "lyric":
              return (
                <div key={i} className="text-slate-100 whitespace-pre-wrap leading-relaxed mb-1">
                  {b.text}
                </div>
              )

            default:
              return null
          }
        })}
      </div>

      {/* Chord tooltip */}
      {tooltip && (
        <ChordTooltip
          chord={tooltip.chord}
          position={{ x: tooltip.x, y: tooltip.y }}
          onClose={() => setTooltip(null)}
        />
      )}
    </div>
  )
}
