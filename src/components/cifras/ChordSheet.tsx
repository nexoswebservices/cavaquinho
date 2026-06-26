"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { transposeLine } from "@/lib/transpose"
import { ChordTooltip } from "./ChordTooltip"
import { initSampler, isReady, playNote } from "@/lib/sampler"

// Acorde completo: raiz + qualidade + extensões + baixo
// Reconhece: Am7/-5, C7/9, Bb7+/9, Em7/5-, F#m7(b5), G7(9/11), A4(7/9),
// A7M, C#m7b5, E7#9, F#º, G#7b13, B5+7, Dm7M, etc.
const CHORD_RE =
  /^[A-G](#|b)?[ºø]?(m|maj|min|dim|aug|sus|add)?\d*[ºø+\-]?[M]?([b#]?\d+[+-]?)*(\([^)]*\))?(\/[#b+-]?\d+[+-]?[#b]?)*(\/[A-G](#|b)?)?[ºø+\-]*$/i

// Tablatura padrão (E|--5-7--|)
const STD_TAB_LINE = /^[A-Ga-g]\s*\|[-\d xhpbs/\\|.~]*\|?\s*$/
// Tablatura numérica (| 21-10-11 | ou 12-23-34)
const NUM_TAB_LINE = /^\|?\s*\d{1,3}\s*[-\d|h\s]+[-\d]\s*\|?\s*$/
// Linha que é claramente tab de corda (D-----3--2--5--)
const STRING_TAB_LINE = /^[A-Ga-g]\s*[-\d|.~\s]{6,}$/
// Seções
const SECTION_RE =
  /^\[.*\]$|^[\[(].*[\])]$|^(INTRO|REFRÃO|VERSO|BRIDGE|CODA|INTRODUÇÃO|SOLO|PRÉ-REFRÃO|FINAL|REFR)[:\s]*$/i

// Inline: detecta acordes dentro de texto (para renderizar clicáveis)
const INLINE_CHORD_RE = /\b([A-G][#b]?[ºø]?(?:m|maj|min|dim|aug|sus|add)?\d*[ºø+\-]?M?(?:[b#]\d+[+-]?)*(?:\([^)]*\))?(?:\/[#b+-]?\d+[+-]?[#b]?)*(?:\/[A-G][#b]?)?)\b/g

function isChordToken(t: string): boolean {
  if (!t || t.length > 25) return false
  const cleaned = t.replace(/^\|+|\|+$/g, "").replace(/^\(|\)$/g, "").trim()
  if (!cleaned) return false
  return CHORD_RE.test(cleaned)
}

function isTabLine(line: string): boolean {
  const trimmed = line.trim()
  if (STD_TAB_LINE.test(trimmed)) return true
  if (NUM_TAB_LINE.test(trimmed)) return true
  if (STRING_TAB_LINE.test(trimmed)) return true
  // Linhas com predominância de números e dashes (tab numérica)
  const digits = (trimmed.match(/\d/g) || []).length
  const dashes = (trimmed.match(/-/g) || []).length
  const pipes = (trimmed.match(/\|/g) || []).length
  if (digits >= 4 && (digits + dashes + pipes) > trimmed.replace(/\s/g, "").length * 0.5) return true
  // Linhas que começam com | e tem números
  if (/^\|/.test(trimmed) && digits >= 3) return true
  // Linhas tipo "VIOLAO: | 53-40-41 |" — tem label + tab
  if (/:\s*\|/.test(trimmed) && digits >= 4) return true
  return false
}

function classifyLine(line: string): "chord" | "lyric" | "tab" | "numtab" | "section" | "empty" | "mixed" {
  const trimmed = line.trim()
  if (!trimmed) return "empty"
  if (SECTION_RE.test(trimmed)) return "section"
  if (isTabLine(trimmed)) return "numtab"

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

// Tablatura numérica do cavaquinho: 1º dígito = corda (1-4), restante = traste
// Ex: 21 = corda 2 traste 1, 110 = corda 1 traste 10
const TUNING_MIDI_TAB = [74, 71, 67, 62] // D5, B4, G4, D4 (cordas 1-4)
const CHROMATIC_TAB = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

function parseTabNumbers(text: string): [string, number][] {
  const nums = text.match(/\d{2,3}/g)
  if (!nums) return []

  const notes: [string, number][] = []
  for (const num of nums) {
    let stringNum: number
    let fret: number

    if (num.length === 3) {
      stringNum = parseInt(num[0])
      fret = parseInt(num.slice(1))
    } else {
      stringNum = parseInt(num[0])
      fret = parseInt(num[1])
    }

    if (stringNum < 1 || stringNum > 4 || fret > 17) continue

    const midi = TUNING_MIDI_TAB[stringNum - 1] + fret
    const note = CHROMATIC_TAB[midi % 12]
    const octave = Math.floor(midi / 12) - 1
    notes.push([note, octave])
  }

  return notes
}

function TabPlayButton({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false)

  const handlePlay = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isReady()) await initSampler()

    const notes = parseTabNumbers(text)
    if (notes.length === 0) return

    setPlaying(true)
    const interval = 250

    notes.forEach(([note, octave], i) => {
      setTimeout(() => playNote(note, octave), i * interval)
    })

    setTimeout(() => setPlaying(false), notes.length * interval + 200)
  }, [text])

  const notes = parseTabNumbers(text)
  if (notes.length === 0) return null

  return (
    <button
      onClick={handlePlay}
      className={`ml-2 inline-flex items-center justify-center w-6 h-6 rounded-md text-xs transition-all flex-shrink-0 ${
        playing
          ? "bg-emerald-500 text-white scale-110"
          : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
      }`}
      title={`Tocar tablatura (${notes.length} notas)`}
    >
      {playing ? "♪" : "▶"}
    </button>
  )
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
                <div key={i} className="flex items-center gap-0 text-emerald-400/60 text-[0.8em] leading-snug">
                  <span className="whitespace-pre flex-1">{b.text}</span>
                  <TabPlayButton text={b.text!} />
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
