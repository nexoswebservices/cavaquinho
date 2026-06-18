"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  parseChord,
  parseProgression,
  detectKey,
  analyzeDegrees,
  detectCadences,
  normNote,
} from "@/lib/teoria"
import type { Chord, KeyResult, DegreeInfo, Cadence } from "@/lib/teoria"

const CHORD_TOKEN =
  /^[A-G](#|b)?(maj|min|dim|aug|sus|add|m)?\d*(\([^)]*\))?(\/[A-G](#|b)?\d*)?[ºø+\-]*$/i
const TAB_LINE = /^[A-Ga-g]\|[-\d xhp/\\|]*\|?$/

function isChordToken(t: string): boolean {
  if (!t || t.length > 20) return false
  const cleaned = t.replace(/^\|+|\|+$/g, "").trim()
  if (!cleaned) return false
  return CHORD_TOKEN.test(cleaned)
}

function isChordLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed || TAB_LINE.test(trimmed)) return false
  const tokens = trimmed
    .split(/\s+/)
    .filter((t) => t !== "|" && t !== "||" && t.replace(/\|/g, "").trim())
  if (tokens.length === 0) return false
  return tokens.filter(isChordToken).length / tokens.length >= 0.6
}

function extractAllChords(conteudo: string): Chord[] {
  const lines = conteudo.split("\n")
  const chords: Chord[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || TAB_LINE.test(trimmed)) continue

    if (isChordLine(line)) {
      const tokens = trimmed
        .split(/\s+/)
        .map((t) => t.replace(/^\|+|\|+$/g, "").trim())
        .filter(Boolean)
      for (const token of tokens) {
        const chord = parseChord(token)
        if (chord) chords.push(chord)
      }
    }
  }

  if (chords.length === 0) {
    return parseProgression(conteudo)
  }

  return chords
}

const FN_COLORS: Record<string, string> = {
  Tônica: "bg-violet-500/30 border-violet-400/60 text-violet-100",
  Supertônica: "bg-sky-500/25 border-sky-400/50 text-sky-100",
  Mediante: "bg-violet-500/20 border-violet-400/40 text-violet-200",
  Subdominante: "bg-sky-500/30 border-sky-400/60 text-sky-100",
  Dominante: "bg-amber-500/30 border-amber-400/60 text-amber-100",
  Superdominante: "bg-violet-500/20 border-violet-400/40 text-violet-200",
  Sensível: "bg-rose-500/30 border-rose-400/50 text-rose-100",
  Subtônica: "bg-slate-500/25 border-slate-400/40 text-slate-200",
  "Dominante secundária": "bg-orange-500/30 border-orange-400/60 text-orange-100",
  "Empréstimo modal": "bg-pink-500/30 border-pink-400/50 text-pink-100",
  Cromatismo: "bg-slate-500/30 border-slate-400/50 text-slate-200",
  "Não identificado": "bg-slate-500/15 border-slate-500/30 text-slate-300",
}

function fnColor(fn: string): string {
  return FN_COLORS[fn] ?? FN_COLORS["Não identificado"]
}

function confidence(k: KeyResult, min: number, max: number): number {
  if (max === min) return 100
  return Math.round(((k.score - min) / (max - min)) * 100)
}

function buildProgressionString(chords: Chord[]): string {
  const seen = new Set<string>()
  const unique: string[] = []
  for (const c of chords) {
    if (!seen.has(c.original)) {
      seen.add(c.original)
      unique.push(c.original)
    }
  }
  return unique.join(" | ")
}

interface CifraAnaliseProps {
  conteudo: string
  tom?: string | null
  titulo?: string
}

export function CifraAnalise({ conteudo, tom, titulo }: CifraAnaliseProps) {
  const router = useRouter()
  const allChords = useMemo(() => extractAllChords(conteudo), [conteudo])

  const keys = useMemo(() => {
    if (!allChords.length) return []
    return detectKey(allChords)
  }, [allChords])

  const initialKey = useMemo(() => {
    if (tom) {
      const normTom = normNote(tom)
      const match = keys.find(
        (k) => k.root === normTom || k.root === tom
      )
      if (match) return match
    }
    return keys[0] ?? null
  }, [tom, keys])

  const [selectedKey, setSelectedKey] = useState<KeyResult | null>(initialKey)

  const scores = keys.map((k) => k.score)
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)

  const degrees = useMemo(() => {
    if (!selectedKey) return []
    return analyzeDegrees(allChords, selectedKey)
  }, [allChords, selectedKey])

  const cadences = useMemo(() => {
    return detectCadences(degrees)
  }, [degrees])

  const stats = useMemo(() => {
    const total = degrees.length
    if (!total) return null
    const diatonic = degrees.filter((d) => d.diatonic).length
    const secondary = degrees.filter((d) => d.fn === "Dominante secundária").length
    const modal = degrees.filter((d) => d.fn === "Empréstimo modal").length
    return {
      total,
      diatonicPct: Math.round((diatonic / total) * 100),
      secondary,
      modal,
    }
  }, [degrees])

  const progressionStr = useMemo(() => buildProgressionString(allChords), [allChords])

  function openInAnalise() {
    const encoded = encodeURIComponent(progressionStr.replace(/\s*\|\s*/g, " "))
    router.push(`/analise?p=${encoded}`)
  }

  if (!allChords.length) {
    return (
      <div className="text-slate-500 text-sm py-8 text-center">
        Nenhum acorde reconhecido nesta cifra para análise.
      </div>
    )
  }

  if (!selectedKey) return null

  const conf = confidence(selectedKey, minScore, maxScore)

  return (
    <div className="space-y-6">
      {/* Progressão harmônica */}
      <div className="bg-[#120d24] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-sm text-slate-400">
            Progressão harmônica
            {titulo && <span className="text-slate-600"> — {titulo}</span>}
          </h2>
          <button
            onClick={openInAnalise}
            className="text-xs bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Abrir no Analisador →
          </button>
        </div>
        <p className="text-white font-mono text-sm leading-relaxed break-all">
          {progressionStr}
        </p>
      </div>

      {/* Tonalidade */}
      <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm text-slate-400">
            Tonalidade {tom ? "da cifra" : "detectada"}
          </h2>
          <span className="text-xs text-slate-500">
            Confiança:{" "}
            <span
              className={
                conf >= 70
                  ? "text-emerald-400"
                  : conf >= 40
                  ? "text-amber-400"
                  : "text-rose-400"
              }
            >
              {conf}%
            </span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {keys.slice(0, 6).map((k) => {
            const c = confidence(k, minScore, maxScore)
            const active = k.root === selectedKey.root && k.mode === selectedKey.mode
            return (
              <button
                key={`${k.root}${k.mode}`}
                onClick={() => setSelectedKey(k)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  active
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {k.label}
                <span className="text-xs opacity-60">{c}%</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Blocos de progressão — visualização completa */}
      <div>
        <h3 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
          Análise por grau em {selectedKey.label}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {degrees.map((d, di) => (
            <div
              key={di}
              className={`border-2 rounded-xl px-3 py-2.5 min-w-[60px] text-center transition-all hover:scale-105 ${fnColor(d.fn)}`}
            >
              <p className="text-[0.6rem] font-bold leading-none mb-1.5 opacity-80">
                {d.degree}
              </p>
              <p className="text-sm font-bold font-mono leading-none">
                {d.chord.original}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo harmônico */}
      {stats && (
        <div className="bg-[#120d24] border border-white/5 rounded-2xl p-5">
          <h2 className="text-sm text-slate-400 mb-4">Resumo harmônico</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-500">Acordes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-violet-300">{stats.diatonicPct}%</p>
              <p className="text-xs text-slate-500">Diatônicos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-300">{stats.secondary}</p>
              <p className="text-xs text-slate-500">Dom. secundárias</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-300">{stats.modal}</p>
              <p className="text-xs text-slate-500">Empréstimos modais</p>
            </div>
          </div>
        </div>
      )}

      {/* Cadências */}
      {cadences.length > 0 && (
        <div className="bg-[#120d24] border border-white/5 rounded-2xl p-5">
          <h2 className="text-sm text-slate-400 mb-3">Cadências detectadas</h2>
          <ul className="space-y-2">
            {cadences.map((c, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-emerald-400 text-xs mt-0.5 flex-shrink-0">→</span>
                <div>
                  <span className="text-white font-mono text-sm font-medium">
                    {c.chords.join(" – ")}
                  </span>
                  <span className="text-slate-500 text-xs ml-2">{c.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
