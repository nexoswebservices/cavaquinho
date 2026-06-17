"use client"

import { useState } from "react"

const CHORD_TOKEN =
  /^[A-G](#|b)?(maj|min|dim|aug|sus|add|m)?\d*(\([^)]*\))?(\/[A-G](#|b)?\d*)?[ºø+\-]*$/i
const TAB_LINE = /^[A-Ga-g]\|[-\d xhp/\\|]*\|?$/
const SECTION_RE = /^\[.*\]$|^[\[(].*[\])]$|^(INTRO|REFRÃO|REFRÃO:|VERSO|BRIDGE|CODA|INTRODUÇÃO|SOLO|PRÉ-REFRÃO|FINAL)[:\s]*$/i

function isChordToken(t: string): boolean {
  if (!t || t.length > 20) return false
  const cleaned = t.replace(/^\|+|\|+$/g, "").trim()
  if (!cleaned) return false
  return CHORD_TOKEN.test(cleaned)
}

function isChordLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (TAB_LINE.test(trimmed)) return false
  if (SECTION_RE.test(trimmed)) return false
  const tokens = trimmed.split(/\s+/).filter((t) => t !== "|" && t !== "||" && t.replace(/\|/g, "").trim())
  if (tokens.length === 0) return false
  const chordCount = tokens.filter(isChordToken).length
  return chordCount / tokens.length >= 0.6
}

function isTabLine(line: string): boolean {
  return TAB_LINE.test(line.trim())
}

function isSectionLine(line: string): boolean {
  return SECTION_RE.test(line.trim())
}

interface ParsedLine {
  type: "chord-lyric" | "chord-only" | "lyric" | "section" | "tab" | "empty"
  chordLine?: string
  lyricLine?: string
  text?: string
}

function parseLines(conteudo: string): ParsedLine[] {
  const raw = conteudo.split("\n")
  const result: ParsedLine[] = []
  let i = 0

  while (i < raw.length) {
    const line = raw[i]
    const trimmed = line.trim()

    if (!trimmed) {
      result.push({ type: "empty" })
      i++
      continue
    }

    if (isSectionLine(trimmed)) {
      result.push({ type: "section", text: trimmed })
      i++
      continue
    }

    if (isTabLine(trimmed)) {
      result.push({ type: "tab", text: line })
      i++
      continue
    }

    if (isChordLine(line)) {
      const next = i + 1 < raw.length ? raw[i + 1] : ""
      const nextTrimmed = next.trim()
      if (nextTrimmed && !isChordLine(next) && !isSectionLine(nextTrimmed) && !isTabLine(nextTrimmed)) {
        result.push({ type: "chord-lyric", chordLine: line, lyricLine: next })
        i += 2
        continue
      }
      result.push({ type: "chord-only", chordLine: line })
      i++
      continue
    }

    result.push({ type: "lyric", text: line })
    i++
  }

  return result
}

function ChordSpan({ text }: { text: string }) {
  return (
    <span className="text-violet-300 font-bold whitespace-pre">{text}</span>
  )
}

function renderChordLyricPair(chordLine: string, lyricLine: string, key: number) {
  return (
    <div key={key} className="leading-relaxed mb-1">
      <div className="text-violet-300 font-bold whitespace-pre text-[0.85em] leading-tight select-all">
        {chordLine}
      </div>
      <div className="text-slate-200 whitespace-pre-wrap">{lyricLine}</div>
    </div>
  )
}

function renderChordOnly(chordLine: string, key: number) {
  return (
    <div key={key} className="mb-1">
      <ChordSpan text={chordLine} />
    </div>
  )
}

interface ChordSheetProps {
  conteudo: string
}

export function ChordSheet({ conteudo }: ChordSheetProps) {
  const [fontSize, setFontSize] = useState(14)
  const parsed = parseLines(conteudo)

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
        {parsed.map((line, i) => {
          switch (line.type) {
            case "empty":
              return <div key={i} className="h-4" />

            case "section":
              return (
                <div key={i} className="text-slate-400 font-semibold text-[0.9em] mt-6 mb-2 first:mt-0 border-b border-white/5 pb-1">
                  {line.text}
                </div>
              )

            case "tab":
              return (
                <div key={i} className="text-emerald-400/70 whitespace-pre text-[0.85em] leading-tight">
                  {line.text}
                </div>
              )

            case "chord-lyric":
              return renderChordLyricPair(line.chordLine!, line.lyricLine!, i)

            case "chord-only":
              return renderChordOnly(line.chordLine!, i)

            case "lyric":
              return (
                <div key={i} className="text-slate-200 whitespace-pre-wrap mb-1">
                  {line.text}
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
