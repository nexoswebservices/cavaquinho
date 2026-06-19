"use client"

import { useRouter } from "next/navigation"
import type { MusicaProgressao } from "@/lib/progressions-data"

const DEGREE_COLOR: Record<string, string> = {
  I: "bg-violet-500/30 border-violet-400/60 text-violet-100",
  I7: "bg-violet-500/25 border-violet-400/50 text-violet-100",
  ii: "bg-sky-500/25 border-sky-400/50 text-sky-100",
  iii: "bg-violet-500/20 border-violet-400/40 text-violet-200",
  IV: "bg-sky-500/30 border-sky-400/60 text-sky-100",
  IV7: "bg-sky-500/25 border-sky-400/50 text-sky-100",
  V: "bg-amber-500/25 border-amber-400/50 text-amber-100",
  V7: "bg-amber-500/30 border-amber-400/60 text-amber-100",
  vi: "bg-emerald-500/25 border-emerald-400/50 text-emerald-100",
  vii: "bg-rose-500/20 border-rose-400/40 text-rose-200",
  "viio": "bg-rose-500/20 border-rose-400/40 text-rose-200",
}

function getDegreeColor(deg: string): string {
  if (deg.startsWith("V7/")) return "bg-orange-500/30 border-orange-400/60 text-orange-100"
  return DEGREE_COLOR[deg] ?? "bg-slate-500/20 border-slate-400/40 text-slate-200"
}

interface MusicaAnaliseProps {
  musica: MusicaProgressao
  grausDestaque: string[]
}

export function MusicaAnalise({ musica, grausDestaque }: MusicaAnaliseProps) {
  const router = useRouter()

  function openInAnalise() {
    const encoded = encodeURIComponent(musica.todos_acordes)
    router.push(`/analise?p=${encoded}`)
  }

  const acordesGraus = musica.acordes_graus ?? []

  return (
    <div className="bg-[#120d24] border border-white/5 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-white font-semibold">{musica.titulo}</h3>
          <p className="text-slate-500 text-sm">{musica.artista}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 px-2.5 py-1 rounded-full font-medium">
            Tom: {musica.tom}
          </span>
          <button
            onClick={openInAnalise}
            className="text-xs bg-white/5 border border-white/10 text-slate-300 hover:border-violet-500/30 hover:text-violet-300 px-2.5 py-1 rounded-lg transition-colors"
          >
            Analisar →
          </button>
        </div>
      </div>

      {/* Acordes com graus coloridos */}
      <div className="flex flex-wrap gap-1.5">
        {acordesGraus.map((ag, i) => {
          const isHighlighted = grausDestaque.includes(ag.grau)
          return (
            <div
              key={i}
              className={`border-2 rounded-xl px-2.5 py-2 min-w-[48px] text-center transition-all ${
                isHighlighted
                  ? getDegreeColor(ag.grau)
                  : "bg-slate-800/40 border-slate-700/20 text-slate-400"
              }`}
            >
              <p className="text-sm font-bold font-mono leading-none mb-1">
                {ag.acorde}
              </p>
              <p className={`text-[0.6rem] font-semibold leading-none ${
                isHighlighted ? "opacity-80" : "opacity-50"
              }`}>
                {ag.grau}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
