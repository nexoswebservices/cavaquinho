import Link from "next/link"
import type { Progressao } from "@/lib/progressions-data"

const TIPO_COLORS: Record<string, string> = {
  "Jazz/Samba": "bg-violet-600/20 text-violet-300 border-violet-500/20",
  "Básica": "bg-emerald-600/20 text-emerald-300 border-emerald-500/20",
  "Clássica": "bg-sky-600/20 text-sky-300 border-sky-500/20",
  "Pop/Pagode": "bg-amber-600/20 text-amber-300 border-amber-500/20",
  "Avançada": "bg-rose-600/20 text-rose-300 border-rose-500/20",
}

export function ProgressaoCard({ progressao }: { progressao: Progressao }) {
  const tipoColor = TIPO_COLORS[progressao.tipo] ?? TIPO_COLORS["Básica"]

  return (
    <Link
      href={`/progressoes/${progressao.slug}`}
      className="bg-[#120d24] border border-white/5 hover:border-violet-500/30 rounded-2xl p-6 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-xl font-bold font-mono text-white group-hover:text-violet-300 transition-colors">
          {progressao.nome}
        </h2>
        <span className={`text-xs border px-2.5 py-1 rounded-full flex-shrink-0 ${tipoColor}`}>
          {progressao.tipo}
        </span>
      </div>

      <div className="flex gap-1.5 mb-4">
        {progressao.graus.map((g, i) => (
          <span
            key={i}
            className="bg-violet-600/15 border border-violet-500/20 text-violet-300 font-mono text-sm font-bold px-2.5 py-1 rounded-lg"
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
