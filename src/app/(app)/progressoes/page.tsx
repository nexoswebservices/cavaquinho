import { PROGRESSOES } from "@/lib/progressions-data"
import { ProgressaoCard } from "@/components/progressoes/ProgressaoCard"

const ORDER = [
  "sequencia-I",
  "sequencia-II",
  "sequencia-III",
  "sequencia-IV",
  "sequencia-V",
]

export default function ProgressoesPage() {
  const sorted = [...PROGRESSOES].sort((a, b) => {
    const ai = ORDER.indexOf(a.slug)
    const bi = ORDER.indexOf(b.slug)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Progressões Harmônicas</h1>
        <p className="text-slate-400">
          Estude os padrões harmônicos mais usados no samba e pagode através de músicas reais do repertório.
        </p>
      </div>

      <div className="space-y-4">
        {sorted.map((p) => (
          <ProgressaoCard key={p.slug} progressao={p} />
        ))}
      </div>

      <div className="mt-8 bg-[#120d24] border border-white/5 rounded-2xl p-5 text-center">
        <p className="text-slate-500 text-sm">
          {PROGRESSOES.reduce((sum, p) => sum + p.musicas.length, 0)} análises de músicas em{" "}
          {PROGRESSOES.length} progressões • Baseado em 20 cifras curadas do repertório
        </p>
      </div>
    </div>
  )
}
