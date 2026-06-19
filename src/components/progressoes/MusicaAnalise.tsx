"use client"

import { useRouter } from "next/navigation"
import type { MusicaProgressao, AcordeGrau } from "@/lib/progressions-data"

const DEGREE_COLOR: Record<string, string> = {
  // Tônica (violeta)
  I: "bg-violet-500/30 border-violet-400/60 text-violet-100",
  I7: "bg-violet-500/25 border-violet-400/50 text-violet-100",
  i: "bg-violet-500/30 border-violet-400/60 text-violet-100",
  // Supertônica (sky)
  ii: "bg-sky-500/25 border-sky-400/50 text-sky-100",
  "iiº": "bg-sky-500/20 border-sky-400/40 text-sky-200",
  // Mediante (teal)
  iii: "bg-teal-500/25 border-teal-400/50 text-teal-100",
  III: "bg-teal-500/25 border-teal-400/50 text-teal-100",
  // Subdominante (cyan)
  IV: "bg-cyan-500/30 border-cyan-400/60 text-cyan-100",
  IV7: "bg-cyan-500/25 border-cyan-400/50 text-cyan-100",
  iv: "bg-cyan-500/25 border-cyan-400/50 text-cyan-100",
  // Dominante (amber)
  V: "bg-amber-500/30 border-amber-400/60 text-amber-100",
  V7: "bg-amber-500/35 border-amber-400/70 text-amber-100",
  v: "bg-amber-500/20 border-amber-400/40 text-amber-200",
  // Superdominante (emerald)
  vi: "bg-emerald-500/30 border-emerald-400/60 text-emerald-100",
  VI: "bg-emerald-500/30 border-emerald-400/60 text-emerald-100",
  // Sensível / Subtônica (rose)
  vii: "bg-rose-500/25 border-rose-400/50 text-rose-100",
  "viiº": "bg-rose-500/25 border-rose-400/50 text-rose-100",
  viio: "bg-rose-500/25 border-rose-400/50 text-rose-100",
  VII: "bg-rose-500/25 border-rose-400/50 text-rose-100",
  VII7: "bg-rose-500/20 border-rose-400/40 text-rose-200",
  // Dominantes secundárias (orange)
  "V7/vi": "bg-orange-500/30 border-orange-400/60 text-orange-100",
  "V7/ii": "bg-orange-500/30 border-orange-400/60 text-orange-100",
  "V7/IV": "bg-orange-500/30 border-orange-400/60 text-orange-100",
  "V7/iii": "bg-orange-500/30 border-orange-400/60 text-orange-100",
  "V7/V": "bg-orange-500/30 border-orange-400/60 text-orange-100",
}

function getDegreeColor(deg: string): string {
  if (DEGREE_COLOR[deg]) return DEGREE_COLOR[deg]
  if (deg.startsWith("V7/") || deg.startsWith("V/")) return "bg-orange-500/30 border-orange-400/60 text-orange-100"
  if (deg.startsWith("♭") || deg.startsWith("#")) return "bg-pink-500/25 border-pink-400/50 text-pink-100"
  if (deg === "?") return "bg-slate-500/15 border-slate-500/30 text-slate-400"
  return "bg-slate-500/20 border-slate-400/40 text-slate-200"
}

function ChordBlock({ ag }: { ag: AcordeGrau }) {
  const color = getDegreeColor(ag.grau)
  return (
    <div className="flex flex-col gap-0.5">
      <div className={`border-2 rounded-lg px-2.5 py-1.5 min-w-[44px] text-center font-mono text-sm font-bold ${color}`}>
        {ag.acorde}
      </div>
      <div className={`border-2 rounded-lg px-2.5 py-1 min-w-[44px] text-center font-mono text-[0.65rem] font-bold ${color}`}>
        {ag.grau}
      </div>
    </div>
  )
}

interface MusicaAnaliseProps {
  musica: MusicaProgressao
}

export function MusicaAnalise({ musica }: MusicaAnaliseProps) {
  const router = useRouter()

  function openInAnalise() {
    const encoded = encodeURIComponent(musica.todos_acordes)
    router.push(`/analise?p=${encoded}`)
  }

  const secoes = musica.secoes ?? []
  const hasSections = secoes.length > 0

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

      {/* Com seções */}
      {hasSections ? (
        <div className="space-y-4">
          {secoes.map((secao, si) => (
            <div key={si}>
              <p className="text-xs text-amber-400/80 font-semibold uppercase tracking-wider mb-2">
                {secao.nome}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {secao.acordes_graus.map((ag, i) => (
                  <ChordBlock key={i} ag={ag} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Sem seções — mostra todos os acordes */
        <div className="flex flex-wrap gap-1.5">
          {(musica.acordes_graus ?? []).map((ag, i) => (
            <ChordBlock key={i} ag={ag} />
          ))}
        </div>
      )}
    </div>
  )
}
