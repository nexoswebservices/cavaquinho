"use client"

import { useState, useMemo } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getProgressao } from "@/lib/progressions-data"
import { MusicaAnalise } from "@/components/progressoes/MusicaAnalise"

const NOTAS_DISPLAY = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]

const NOTES_CHROMATIC = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11]
const NORM_MAP: Record<string, string> = { Eb: "D#", Ab: "G#", Bb: "A#", Db: "C#", Gb: "F#" }
const FLAT_DISPLAY: Record<string, string> = { "A#":"Bb","D#":"Eb","G#":"Ab","C#":"Db","F#":"Gb" }
const FLAT_KEYS = new Set(["F","A#","D#","G#","C#","F#"])

function noteAt(root: string, semitones: number): string {
  const normR = NORM_MAP[root] ?? root
  const idx = NOTES_CHROMATIC.indexOf(normR)
  if (idx === -1) return root
  const note = NOTES_CHROMATIC[(idx + semitones) % 12]
  if (FLAT_KEYS.has(normR) && FLAT_DISPLAY[note]) return FLAT_DISPLAY[note]
  return note
}

function scaleNote(root: string, degree: number): string {
  return noteAt(root, MAJOR_INTERVALS[degree])
}

function degreeToChord(grau: string, root: string): string {
  const r = NORM_MAP[root] ?? root
  // V7/x — secondary dominant
  const secMatch = grau.match(/^V7?\/(vi|ii|iii|iv|IV|V|I)/)
  if (secMatch) {
    const target = secMatch[1]
    const targetMap: Record<string, number> = { I:0, ii:1, iii:2, IV:3, iv:3, V:4, vi:5 }
    const tIdx = targetMap[target]
    if (tIdx !== undefined) {
      const targetNote = scaleNote(r, tIdx)
      const domNote = noteAt(targetNote, 7)
      return domNote + "7"
    }
  }
  // Direct degree mapping
  const MAP: Record<string, [number, string]> = {
    "I": [0, ""], "I7": [0, "7"], "i": [0, "m"],
    "ii": [1, "m"], "iiº": [1, "m7(b5)"],
    "iii": [2, "m"], "III": [2, ""],
    "IV": [3, ""], "IV7": [3, "7"], "iv": [3, "m"],
    "V": [4, ""], "V7": [4, "7"], "v": [4, "m"],
    "vi": [5, "m"], "VI": [5, ""],  "VI7": [5, "7"],
    "vii": [6, "m"], "viiº": [6, "m7(b5)"], "viio": [6, "m7(b5)"], "viiø": [6, "m7(b5)"],
    "VII": [6, ""], "VII7": [6, "7"],
  }
  const entry = MAP[grau]
  if (entry) {
    return scaleNote(r, entry[0]) + entry[1]
  }
  return grau
}

export default function ProgressaoPage({ params }: { params: { slug: string } }) {
  const progressao = getProgressao(params.slug)
  if (!progressao) notFound()

  const [nota, setNota] = useState("C")
  const [busca, setBusca] = useState("")
  const acordesExemplo = useMemo(() => {
    return progressao.graus.map((g) => degreeToChord(g, nota))
  }, [progressao.graus, nota])

  const musicasFiltradas = useMemo(() => {
    const q = busca.toLowerCase().trim()
    if (!q) return progressao.musicas
    return progressao.musicas.filter(
      (m) => m.titulo.toLowerCase().includes(q) || m.artista.toLowerCase().includes(q)
    )
  }, [progressao.musicas, busca])

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/progressoes" className="hover:text-slate-300 transition-colors">
          Progressões
        </Link>
        <span>/</span>
        <span className="text-slate-300">{progressao.nome}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white font-mono">{progressao.nome}</h1>
          <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/20 px-2.5 py-1 rounded-full">
            {progressao.tipo}
          </span>
        </div>
        <p className="text-slate-400 leading-relaxed">{progressao.descricao}</p>
      </div>

      {/* Exemplo no tom selecionado */}
      <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-5 mb-8">
        <h2 className="text-sm text-slate-400 mb-3">Exemplo em {nota} maior</h2>

        {/* Seletor de tom */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {NOTAS_DISPLAY.map((n) => (
            <button
              key={n}
              onClick={() => setNota(n)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                nota === n
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Graus + acordes reais */}
        <div className="flex gap-3">
          {progressao.graus.map((g, i) => (
            <div key={i} className="text-center">
              <p className="text-xs text-slate-500 mb-1">{g}</p>
              <p className="text-lg font-bold font-mono text-violet-300">{acordesExemplo[i]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por música ou artista..."
          className="w-full bg-[#120d24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      {/* Contagem */}
      <p className="text-sm text-slate-500 mb-4">
        {musicasFiltradas.length} {musicasFiltradas.length === 1 ? "música" : "músicas"}
        {busca && ` para "${busca}"`}
      </p>

      {/* Lista de músicas */}
      <div className="space-y-3">
        {musicasFiltradas.map((m, i) => (
          <MusicaAnalise key={i} musica={m} />
        ))}
      </div>

      {musicasFiltradas.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-8">
          Nenhuma música encontrada.
        </p>
      )}
    </div>
  )
}
