"use client"

import { useState, useMemo } from "react"
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
const SECTION_RE =
  /^\[.*\]$|^[\[(].*[\])]$|^(INTRO|REFRÃO|REFRÃO:|VERSO|BRIDGE|CODA|INTRODUÇÃO|SOLO|PRÉ-REFRÃO|FINAL)[:\s]*$/i
const TAB_LINE = /^[A-Ga-g]\|[-\d xhp/\\|]*\|?$/

function isChordToken(t: string): boolean {
  if (!t || t.length > 20) return false
  const cleaned = t.replace(/^\|+|\|+$/g, "").trim()
  if (!cleaned) return false
  return CHORD_TOKEN.test(cleaned)
}

function isChordLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed || TAB_LINE.test(trimmed) || SECTION_RE.test(trimmed)) return false
  const tokens = trimmed
    .split(/\s+/)
    .filter((t) => t !== "|" && t !== "||" && t.replace(/\|/g, "").trim())
  if (tokens.length === 0) return false
  return tokens.filter(isChordToken).length / tokens.length >= 0.6
}

interface CifraSection {
  name: string
  chords: Chord[]
}

function extractSections(conteudo: string): CifraSection[] {
  const lines = conteudo.split("\n")
  const sections: CifraSection[] = []
  let currentName = "Progressão"
  let currentChords: Chord[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (SECTION_RE.test(trimmed)) {
      if (currentChords.length > 0) {
        sections.push({ name: currentName, chords: [...currentChords] })
        currentChords = []
      }
      currentName = trimmed.replace(/[\[\]()]/g, "").trim()
      continue
    }

    if (isChordLine(line)) {
      const tokens = trimmed
        .split(/\s+/)
        .map((t) => t.replace(/^\|+|\|+$/g, "").trim())
        .filter(Boolean)
      for (const token of tokens) {
        const chord = parseChord(token)
        if (chord) currentChords.push(chord)
      }
    }
  }

  if (currentChords.length > 0) {
    sections.push({ name: currentName, chords: currentChords })
  }

  if (sections.length === 0) {
    const allChords = parseProgression(conteudo)
    if (allChords.length > 0) {
      sections.push({ name: "Progressão completa", chords: allChords })
    }
  }

  return sections
}

function dedupeChords(chords: Chord[]): Chord[] {
  const seen = new Set<string>()
  return chords.filter((c) => {
    if (seen.has(c.original)) return false
    seen.add(c.original)
    return true
  })
}

const FN_COLORS: Record<string, string> = {
  Tônica: "bg-violet-600/20 border-violet-500/40 text-violet-200",
  Supertônica: "bg-sky-600/15 border-sky-500/30 text-sky-200",
  Mediante: "bg-violet-600/10 border-violet-500/20 text-violet-300",
  Subdominante: "bg-sky-600/20 border-sky-500/40 text-sky-200",
  Dominante: "bg-amber-600/20 border-amber-500/40 text-amber-200",
  Superdominante: "bg-violet-600/10 border-violet-500/20 text-violet-300",
  Sensível: "bg-rose-600/15 border-rose-500/30 text-rose-200",
  Subtônica: "bg-slate-600/15 border-slate-500/30 text-slate-300",
  "Dominante secundária": "bg-orange-600/20 border-orange-500/40 text-orange-200",
  "Empréstimo modal": "bg-rose-600/15 border-rose-500/30 text-rose-200",
  Cromatismo: "bg-slate-600/20 border-slate-500/30 text-slate-300",
  "Não identificado": "bg-slate-600/10 border-slate-500/20 text-slate-400",
}

function fnColor(fn: string): string {
  return FN_COLORS[fn] ?? FN_COLORS["Não identificado"]
}

function confidence(k: KeyResult, min: number, max: number): number {
  if (max === min) return 100
  return Math.round(((k.score - min) / (max - min)) * 100)
}

interface CifraAnaliseProps {
  conteudo: string
  tom?: string | null
}

export function CifraAnalise({ conteudo, tom }: CifraAnaliseProps) {
  const sections = useMemo(() => extractSections(conteudo), [conteudo])
  const allChords = useMemo(() => sections.flatMap((s) => s.chords), [sections])

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

  const sectionAnalyses = useMemo(() => {
    if (!selectedKey) return []
    return sections.map((section) => {
      const degrees = analyzeDegrees(section.chords, selectedKey)
      const cadences = detectCadences(degrees)
      return { ...section, degrees, cadences }
    })
  }, [sections, selectedKey])

  const stats = useMemo(() => {
    if (!selectedKey) return null
    const allDegrees = sectionAnalyses.flatMap((s) => s.degrees)
    const total = allDegrees.length
    if (!total) return null
    const diatonic = allDegrees.filter((d) => d.diatonic).length
    const secondary = allDegrees.filter((d) => d.fn === "Dominante secundária").length
    const modal = allDegrees.filter((d) => d.fn === "Empréstimo modal").length
    return {
      total,
      diatonic,
      diatonicPct: Math.round((diatonic / total) * 100),
      secondary,
      modal,
    }
  }, [sectionAnalyses, selectedKey])

  const allCadences = useMemo(
    () => sectionAnalyses.flatMap((s) => s.cadences),
    [sectionAnalyses]
  )

  const [activeSection, setActiveSection] = useState(0)

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

      {/* Tabs de seção */}
      {sectionAnalyses.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {sectionAnalyses.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSection(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeSection === i
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {s.name}
            </button>
          ))}
          <button
            onClick={() => setActiveSection(-1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeSection === -1
                ? "bg-violet-600 text-white"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            Todas
          </button>
        </div>
      )}

      {/* Blocos de progressão */}
      {(activeSection === -1 ? sectionAnalyses : [sectionAnalyses[activeSection]]).map(
        (section, si) =>
          section && (
            <div key={si} className="space-y-3">
              {activeSection === -1 && (
                <h3 className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  {section.name}
                </h3>
              )}
              <div className="flex flex-wrap gap-2">
                {section.degrees.map((d, di) => (
                  <div
                    key={di}
                    className={`border rounded-xl px-3 py-2.5 min-w-[56px] text-center transition-colors ${fnColor(
                      d.fn
                    )}`}
                  >
                    <p className="text-[0.65rem] opacity-60 leading-none mb-1 font-semibold">
                      {d.degree}
                    </p>
                    <p className="text-sm font-bold font-mono leading-none">
                      {d.chord.original}
                    </p>
                  </div>
                ))}
              </div>

              {/* Cadências da seção */}
              {section.cadences.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {section.cadences.map((c, ci) => (
                    <span
                      key={ci}
                      className="text-xs bg-emerald-600/10 border border-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg"
                    >
                      {c.chords.join(" – ")} <span className="opacity-60">({c.label.split("(")[1]?.replace(")", "") || c.label})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
      )}

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

      {/* Cadências globais */}
      {allCadences.length > 0 && activeSection !== -1 && (
        <div className="bg-[#120d24] border border-white/5 rounded-2xl p-5">
          <h2 className="text-sm text-slate-400 mb-3">Cadências detectadas (todas as seções)</h2>
          <ul className="space-y-2">
            {allCadences.map((c, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-violet-400 text-xs mt-0.5 flex-shrink-0">→</span>
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
