"use client"

import { useState, useMemo } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getProgressao } from "@/lib/progressions-data"
import { campoHarmonico, normNote } from "@/lib/teoria"
import type { Mode } from "@/lib/teoria"
import { MusicaAnalise } from "@/components/progressoes/MusicaAnalise"

const NOTAS_DISPLAY = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
const TO_NORM: Record<string, string> = { Eb: "D#", Ab: "G#", Bb: "A#" }

const DEGREE_TO_INDEX: Record<string, number> = {
  I: 0, ii: 1, iii: 2, IV: 3, V: 4, V7: 4, vi: 5, vii: 6,
}

export default function ProgressaoPage({ params }: { params: { slug: string } }) {
  const progressao = getProgressao(params.slug)
  if (!progressao) notFound()

  const [nota, setNota] = useState("C")
  const [busca, setBusca] = useState("")

  const normRoot = TO_NORM[nota] ?? nota
  const campo = campoHarmonico(normRoot, "major" as Mode)

  const acordesExemplo = useMemo(() => {
    return progressao.graus.map((g) => {
      const base = g.replace("7", "").replace("/", "")
      const idx = DEGREE_TO_INDEX[base] ?? DEGREE_TO_INDEX[g]
      if (idx !== undefined && campo[idx]) {
        return campo[idx].example
      }
      return g
    })
  }, [progressao.graus, campo])

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
