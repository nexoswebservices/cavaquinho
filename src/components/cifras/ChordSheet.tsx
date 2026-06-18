"use client"

import { useState } from "react"

const CHORD_RE =
  /^[A-G](#|b)?(maj|min|dim|aug|sus|add|m)?\d*(\([^)]*\))?(\/[A-G](#|b)?\d*)?[ºø+\-]*$/i
const STD_TAB_LINE = /^[A-Ga-g]\|[-\d xhp/\\|]*\|?$/
const NUM_TAB_LINE = /^\|?\s*\d{1,3}(-\d{1,3}){2,}/
const SECTION_RE =
  /^\[.*\]$|^[\[(].*[\])]$|^(INTRO|REFRÃO|VERSO|BRIDGE|CODA|INTRODUÇÃO|SOLO|PRÉ-REFRÃO|FINAL|REFR)[:\s]*$/i

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

    if (cls === "empty") {
      result.push({ type: "empty" })
      i++
      continue
    }

    if (cls === "section") {
      result.push({ type: "section", text: line.trim() })
      i++
      continue
    }

    if (cls === "tab" || cls === "numtab") {
      result.push({ type: "tab", text: line })
      i++
      continue
    }

    if (cls === "mixed") {
      result.push({ type: "lyric", text: line })
      i++
      continue
    }

    if (cls === "chord") {
      // Collect consecutive chord lines
      const chordLines: string[] = [line.trim()]
      let j = i + 1
      while (j < raw.length) {
        const nextCls = classifyLine(raw[j])
        if (nextCls === "empty") { j++; continue }
        if (nextCls === "chord") {
          chordLines.push(raw[j].trim())
          j++
        } else {
          break
        }
      }

      // Find next non-empty line
      let nextIdx = j
      while (nextIdx < raw.length && !raw[nextIdx].trim()) nextIdx++

      const nextLine = nextIdx < raw.length ? raw[nextIdx] : ""
      const nextCls = classifyLine(nextLine)

      if ((nextCls === "lyric" || nextCls === "mixed") && chordLines.length >= 1) {
        // Emit earlier chord lines as chord-only
        for (let k = 0; k < chordLines.length - 1; k++) {
          result.push({ type: "chord-only", chords: chordLines[k] })
        }
        // Pair last chord line with lyric
        result.push({
          type: "chord-lyric",
          chords: chordLines[chordLines.length - 1],
          lyrics: nextLine,
        })
        i = nextIdx + 1
        continue
      }

      // No lyric follows
      for (const cl of chordLines) {
        result.push({ type: "chord-only", chords: cl })
      }
      i = j
      continue
    }

    // lyric
    result.push({ type: "lyric", text: line })
    i++
  }

  return result
}

export function ChordSheet({ conteudo }: { conteudo: string }) {
  const [fontSize, setFontSize] = useState(14)
  const blocks = parseContent(conteudo)

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-slate-500">Tamanho</span>
        <button
          onClick={() => setFontSize((s) => Math.max(10, s - 1))}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white text-sm font-bold transition-colors"
        >
          −
        </button>
        <span className="text-xs text-slate-400 w-6 text-center">{fontSize}</span>
        <button
          onClick={() => setFontSize((s) => Math.min(22, s + 1))}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white text-sm font-bold transition-colors"
        >
          +
        </button>
      </div>

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
                <div
                  key={i}
                  className="text-amber-400/90 font-bold text-[0.95em] mt-7 mb-3 first:mt-0 uppercase tracking-wide"
                >
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
                  <div className="text-violet-400 font-bold whitespace-pre text-[0.9em] leading-tight">
                    {b.chords}
                  </div>
                  <div className="text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {b.lyrics}
                  </div>
                </div>
              )

            case "chord-only":
              return (
                <div key={i} className="text-violet-400 font-bold whitespace-pre mb-0.5">
                  {b.chords}
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
    </div>
  )
}
