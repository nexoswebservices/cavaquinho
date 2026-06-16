import { AnalisadorHarmonico } from "@/components/analise/AnalisadorHarmonico"

export default function AnalisePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Análise Harmônica</h1>
        <p className="text-slate-400">
          Cole uma progressão de acordes e descubra a tonalidade, graus e cadências.
        </p>
      </div>
      <AnalisadorHarmonico />
    </div>
  )
}
