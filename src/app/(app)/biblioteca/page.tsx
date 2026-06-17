"use client"

import { useState } from "react"
import { CampoHarmonico } from "@/components/biblioteca/CampoHarmonico"
import { campoHarmonico } from "@/lib/teoria"
import type { Mode } from "@/lib/teoria"

const TO_NORM: Record<string, string> = {
  Eb: "D#", Ab: "G#", Bb: "A#",
}

const PROGRESSOES = [
  {
    nome: "I – IV – V – I",
    tipo: "Básica",
    graus: "I – IV – V7 – I",
    indices: [0, 3, 4, 0],
    descricao: "A progressão mais usada na música popular.",
  },
  {
    nome: "ii – V – I",
    tipo: "Jazz/Samba",
    graus: "ii – V7 – I",
    indices: [1, 4, 0],
    descricao: "Base do samba e jazz. Gera tensão e resolução perfeita.",
  },
  {
    nome: "I – vi – IV – V",
    tipo: "Clássica",
    graus: "I – vi – IV – V",
    indices: [0, 5, 3, 4],
    descricao: "Usada em inúmeros clássicos do pagode.",
  },
  {
    nome: "I – V – vi – IV",
    tipo: "Pop/Pagode",
    graus: "I – V – vi – IV",
    indices: [0, 4, 5, 3],
    descricao: "Variação da anterior, muito usada no pagode moderno.",
  },
  {
    nome: "i – VII – VI – V",
    tipo: "Menor",
    graus: "i – VII – VI – V7",
    indices: [0, 6, 5, 4],
    descricao: "Cadência andaluza, frequente no samba mais dramático.",
    forceMinor: true,
  },
  {
    nome: "I – bVII – IV – I",
    tipo: "Modal",
    graus: "I – bVII – IV – I",
    indices: [0, -1, 3, 0],
    descricao: "Empréstimo modal, muito usado em samba-rock.",
  },
  {
    nome: "Ciclo de Quintas",
    tipo: "Avançada",
    graus: "I – IV – viiº – iii – vi – ii – V – I",
    indices: [0, 3, 6, 2, 5, 1, 4, 0],
    descricao: "Sequência que percorre todas as quintas do campo harmônico.",
  },
  {
    nome: "I – I7 – IV – IVm",
    tipo: "Blues/Samba",
    graus: "I – I7 – IV – IVm – I",
    indices: [0, -2, 3, -3, 0],
    descricao: "Tônica dominante seguida de movimento IV – IVm muito usado no pagode.",
  },
]

function buildExemplo(
  indices: number[],
  nota: string,
  mode: Mode,
  forceMinor?: boolean,
): string {
  const normRoot = TO_NORM[nota] ?? nota
  const effectiveMode = forceMinor ? "minor" : mode
  const campo = campoHarmonico(normRoot, effectiveMode)
  const minorCampo = forceMinor ? null : campoHarmonico(normRoot, "minor")

  const parts = indices.map((idx) => {
    if (idx === -1 && minorCampo) {
      return minorCampo[6].example
    }
    if (idx === -2) {
      return campo[0].root + "7"
    }
    if (idx === -3) {
      const ivRoot = campo[3].root
      return ivRoot + "m"
    }
    return campo[idx].example
  })

  return `Em ${nota}: ${parts.join(" – ")}`
}

export default function BibliotecaPage() {
  const [nota, setNota] = useState("C")
  const [mode, setMode] = useState<Mode>("major")

  const normRoot = TO_NORM[nota] ?? nota
  const campo = campoHarmonico(normRoot, mode)

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Biblioteca</h1>
        <p className="text-slate-400">Referência rápida de teoria musical para cavaquinho.</p>
      </div>

      {/* Campo Harmônico */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-1">Campo Harmônico</h2>
        <p className="text-slate-400 text-sm mb-5">
          Selecione a tonalidade para ver os 7 acordes diatônicos e suas funções.
        </p>
        <CampoHarmonico nota={nota} mode={mode} onNotaChange={setNota} onModeChange={setMode} />
      </section>

      {/* Progressões Comuns */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-1">Progressões Comuns do Samba e Pagode</h2>
        <p className="text-slate-400 text-sm mb-5">
          Exemplos transpostos para <span className="text-violet-300 font-medium">{nota} {mode === "major" ? "maior" : "menor"}</span>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROGRESSOES.map((p) => (
            <div key={p.nome} className="bg-[#120d24] border border-white/5 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-white font-semibold text-sm">{p.nome}</h3>
                <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                  {p.tipo}
                </span>
              </div>
              <p className="text-violet-300 font-mono text-sm font-bold mb-2">{p.graus}</p>
              <p className="text-slate-400 font-mono text-xs mb-1">
                {buildExemplo(p.indices, nota, mode, p.forceMinor)}
              </p>
              {p.descricao && (
                <p className="text-slate-500 text-xs mt-1">{p.descricao}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Intervalos */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-1">Intervalos e Graus</h2>
        <p className="text-slate-400 text-sm mb-5">
          Distâncias entre notas e suas funções em <span className="text-violet-300 font-medium">{nota} {mode === "major" ? "maior" : "menor"}</span>.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-[#120d24] border border-white/5 rounded-2xl overflow-hidden">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Grau</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Nome</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">Função</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500 font-medium">
                  Em {nota} {mode === "major" ? "maior" : "menor"}
                </th>
              </tr>
            </thead>
            <tbody>
              {campo.map((c, i) => {
                const GRAU_NOMES = [
                  "Tônica", "Supertônica", "Mediante", "Subdominante",
                  "Dominante", "Superdominante", "Sensível",
                ]
                const GRAU_FUNCOES = [
                  "Repouso, chegada, home base",
                  "Pré-dominante, leva ao V",
                  "Substituto da tônica",
                  "Afastamento da tônica",
                  "Máxima tensão, resolve no I",
                  "Tônica relativa, substituto do I",
                  "Tensão extrema, raramente usado sozinho",
                ]
                const degreeDisplay = c.degree === "vii" ? "viiº" : c.degree
                return (
                  <tr key={c.degree} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-violet-300 font-bold">{degreeDisplay}</td>
                    <td className="px-4 py-2.5 text-white">{GRAU_NOMES[i]}</td>
                    <td className="px-4 py-2.5 text-slate-400 text-xs">{GRAU_FUNCOES[i]}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-300 text-xs">{c.example}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
