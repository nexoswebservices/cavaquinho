import Link from "next/link"
import type { Progressao } from "@/lib/progressions-data"

const TIPO_COLORS: Record<string, string> = {
  Fundamental: "bg-emerald-600/20 text-emerald-300 border-emerald-500/20",
  "Intermediária": "bg-sky-600/20 text-sky-300 border-sky-500/20",
  "Com Dom. Secundária": "bg-amber-600/20 text-amber-300 border-amber-500/20",
  "Dom. Secundárias": "bg-orange-600/20 text-orange-300 border-orange-500/20",
  "Avançada": "bg-rose-600/20 text-rose-300 border-rose-500/20",
}

const DEGREE_COLOR: Record<string, string> = {
  I: "bg-violet-500/25 border-violet-400/40 text-violet-200",
  I7: "bg-violet-500/20 border-violet-400/30 text-violet-200",
  ii: "bg-sky-500/20 border-sky-400/40 text-sky-200",
  iii: "bg-teal-500/20 border-teal-400/40 text-teal-200",
  IV: "bg-cyan-500/25 border-cyan-400/40 text-cyan-200",
  iv: "bg-cyan-500/20 border-cyan-400/30 text-cyan-200",
  V: "bg-amber-500/20 border-amber-400/40 text-amber-200",
  V7: "bg-amber-500/25 border-amber-400/50 text-amber-200",
  v: "bg-amber-500/15 border-amber-400/30 text-amber-200",
  vi: "bg-emerald-500/20 border-emerald-400/40 text-emerald-200",
  VI: "bg-emerald-500/20 border-emerald-400/40 text-emerald-200",
  vii: "bg-rose-500/20 border-rose-400/30 text-rose-200",
  "viiø": "bg-rose-500/20 border-rose-400/30 text-rose-200",
  VII: "bg-rose-500/20 border-rose-400/30 text-rose-200",
}

function grauColor(g: string): string {
  if (g.startsWith("V7/")) return "bg-orange-500/20 border-orange-400/40 text-orange-200"
  return DEGREE_COLOR[g] ?? "bg-slate-500/15 border-slate-400/30 text-slate-300"
}

export function ProgressaoCard({ progressao }: { progressao: Progressao }) {
  const tipoColor = TIPO_COLORS[progressao.tipo] ?? TIPO_COLORS["Fundamental"]

  return (
    <Link
      href={`/progressoes/${progressao.slug}`}
      className="block bg-[#120d24] border border-white/5 hover:border-violet-500/30 rounded-2xl p-6 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-lg font-bold font-mono text-white group-hover:text-violet-300 transition-colors">
          {progressao.nome}
        </h2>
        <span className={`text-xs border px-2.5 py-1 rounded-full flex-shrink-0 ${tipoColor}`}>
          {progressao.tipo}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {progressao.graus.map((g, i) => (
          <span
            key={i}
            className={`border font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${grauColor(g)}`}
          >
            {g}
          </span>
        ))}
      </div>

      <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
        {progressao.descricao}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {progressao.musicas.length} {progressao.musicas.length === 1 ? "música" : "músicas"}
        </span>
        <span className="text-xs text-violet-400 group-hover:text-violet-300 transition-colors">
          Ver músicas →
        </span>
      </div>
    </Link>
  )
}
