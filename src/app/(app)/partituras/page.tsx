"use client"

import { useState } from "react"
import { ABCViewer } from "@/components/partituras/ABCViewer"
import { QuizNota } from "@/components/partituras/QuizNota"
import { CifraToPartitura } from "@/components/partituras/CifraToPartitura"
import { ExercicioLeitura } from "@/components/partituras/ExercicioLeitura"
import { LICOES_PARTITURA } from "@/lib/partituras-data"
import { PartituraView } from "@/components/partitura/PartituraView"

const TABS = [
  { id: "aprenda", label: "Aprenda a Ler" },
  { id: "visualizador", label: "Visualizador" },
  { id: "gerador", label: "Cifra → Partitura" },
  { id: "exercicios", label: "Exercícios" },
] as const

type TabId = (typeof TABS)[number]["id"]

export default function PartiturasPage() {
  const [tab, setTab] = useState<TabId>("aprenda")
  const [licaoIdx, setLicaoIdx] = useState(0)

  const licao = LICOES_PARTITURA[licaoIdx]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Partituras</h1>
        <p className="text-slate-400">
          Aprenda a ler partitura, visualize notação musical e gere partituras das cifras.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.id ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ Tab: Aprenda a Ler ═══ */}
      {tab === "aprenda" && (
        <div className="space-y-6">
          {/* Seletor de lição */}
          <div className="flex flex-wrap gap-1.5">
            {LICOES_PARTITURA.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setLicaoIdx(i)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  licaoIdx === i ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {i + 1}. {l.titulo}
              </button>
            ))}
          </div>

          {/* Conteúdo da lição */}
          <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-1">{licao.titulo}</h2>
            <p className="text-xs text-slate-500 mb-4">{licao.descricao}</p>

            {/* Texto */}
            <div className="space-y-3 mb-6">
              {licao.conteudo.split("\n\n").map((para, i) => {
                if (para.startsWith("|")) {
                  return (
                    <div key={i} className="overflow-x-auto">
                      <table className="w-full text-sm bg-[#0a0714] border border-white/5 rounded-xl overflow-hidden">
                        {para.split("\n").map((row, ri) => {
                          const cells = row.split("|").filter(Boolean).map((c) => c.trim())
                          if (ri === 0) return (
                            <thead key={ri}><tr className="border-b border-white/5">
                              {cells.map((c, ci) => <th key={ci} className="px-3 py-2 text-left text-xs text-slate-500 font-medium">{c}</th>)}
                            </tr></thead>
                          )
                          if (ri === 1) return null
                          return (
                            <tbody key={ri}><tr className="border-b border-white/5 last:border-0">
                              {cells.map((c, ci) => <td key={ci} className="px-3 py-2 text-slate-300 text-xs">{c}</td>)}
                            </tr></tbody>
                          )
                        })}
                      </table>
                    </div>
                  )
                }
                return (
                  <p key={i} className="text-slate-300 text-sm leading-relaxed">
                    {para.split("**").map((part, pi) =>
                      pi % 2 === 1
                        ? <strong key={pi} className="text-white font-semibold">{part}</strong>
                        : <span key={pi}>{part}</span>
                    )}
                  </p>
                )
              })}
            </div>

            {/* Exemplo no pentagrama */}
            {licao.exemplos.length > 0 && (
              <div className="bg-[#0a0714] border border-white/5 rounded-xl p-4 mb-4">
                <p className="text-xs text-slate-500 mb-2">Exemplo</p>
                <PartituraView notes={licao.exemplos} />
              </div>
            )}

            {/* Dicas */}
            <div className="space-y-2">
              {licao.dicas.map((dica, i) => (
                <p key={i} className="text-amber-400 text-sm">
                  <span className="font-semibold">Dica {i + 1}: </span>{dica}
                </p>
              ))}
            </div>

            {/* Navegação */}
            <div className="flex justify-between mt-6 pt-4 border-t border-white/5">
              <button
                onClick={() => setLicaoIdx((i) => Math.max(0, i - 1))}
                disabled={licaoIdx === 0}
                className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setLicaoIdx((i) => Math.min(LICOES_PARTITURA.length - 1, i + 1))}
                disabled={licaoIdx === LICOES_PARTITURA.length - 1}
                className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                Próxima →
              </button>
            </div>
          </div>

          {/* Quiz */}
          <div className="bg-[#120d24] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quiz: Identifique a Nota</h3>
            <QuizNota />
          </div>
        </div>
      )}

      {/* ═══ Tab: Visualizador ═══ */}
      {tab === "visualizador" && <ABCViewer />}

      {/* ═══ Tab: Gerador ═══ */}
      {tab === "gerador" && <CifraToPartitura />}

      {/* ═══ Tab: Exercícios ═══ */}
      {tab === "exercicios" && <ExercicioLeitura />}
    </div>
  )
}
