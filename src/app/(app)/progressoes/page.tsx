import { PROGRESSOES } from "@/lib/progressions-data"
import { ProgressaoCard } from "@/components/progressoes/ProgressaoCard"

export default function ProgressoesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Progressões Harmônicas</h1>
        <p className="text-slate-400">
          Estude os padrões harmônicos mais usados no samba e pagode através de músicas reais do repertório.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROGRESSOES.map((p) => (
          <ProgressaoCard key={p.slug} progressao={p} />
        ))}
      </div>

      <div className="mt-8 bg-[#120d24] border border-white/5 rounded-2xl p-5 text-center">
        <p className="text-slate-500 text-sm">
          {PROGRESSOES.reduce((sum, p) => sum + p.musicas.length, 0)} análises de músicas em{" "}
          {PROGRESSOES.length} progressões • Baseado em 448 cifras do repertório
        </p>
      </div>
    </div>
  )
}
