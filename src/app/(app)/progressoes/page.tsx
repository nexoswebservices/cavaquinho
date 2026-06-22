"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CampoHarmonico } from "@/components/biblioteca/CampoHarmonico"
import { campoHarmonico } from "@/lib/teoria"
import type { Mode } from "@/lib/teoria"
import { PROGRESSOES } from "@/lib/progressions-data"
import { ProgressaoCard } from "@/components/progressoes/ProgressaoCard"
import { PlayButton } from "@/components/ui/PlayButton"
import { FormacaoAcordes } from "@/components/progressoes/FormacaoAcordes"

interface SavedProgression {
  progression: string
  key: string
  date: string
}

const TABS = [
  { id: "campo", label: "Campo Harmônico" },
  { id: "cadencias", label: "Cadências" },
  { id: "sequencias", label: "Sequências" },
  { id: "acordes", label: "Formação de Acordes" },
  { id: "minhas", label: "Minhas Progressões" },
] as const

type TabId = (typeof TABS)[number]["id"]

const NOTAS_DISPLAY = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
const TO_NORM: Record<string, string> = { Eb: "D#", Ab: "G#", Bb: "A#" }

// ── Cadências unificadas (merge /cadencias + /biblioteca) ──────────────

interface Padrao {
  nome: string
  tipo: string
  graus: number[]
  modo: Mode
  descricao: string
  dica: string
  grausLabel: string
}

const PADROES: Padrao[] = [
  {
    nome: "ii – V7 – I",
    tipo: "Jazz/Samba",
    graus: [1, 4, 0],
    modo: "major",
    grausLabel: "ii – V7 – I",
    descricao: "A cadência mais importante do samba. O ii cria tensão, o V7 aumenta, e o I resolve.",
    dica: "Pratique lento e ouça a sensação de \"chegada\" no I.",
  },
  {
    nome: "I – IV – V7 – I",
    tipo: "Básica",
    graus: [0, 3, 4, 0],
    modo: "major",
    grausLabel: "I – IV – V7 – I",
    descricao: "Base de inúmeras músicas populares. Funciona em qualquer tonalidade.",
    dica: "Experimente variar o ritmo: marque o I e o IV mais longos.",
  },
  {
    nome: "I – vi – IV – V",
    tipo: "Pop/Pagode",
    graus: [0, 5, 3, 4],
    modo: "major",
    grausLabel: "I – vi – IV – V",
    descricao: "Sequência clássica do pagode moderno. Cria uma sensação circular.",
    dica: "Tente cantarolar uma melodia por cima enquanto toca.",
  },
  {
    nome: "I – V – vi – IV",
    tipo: "Pop/Pagode",
    graus: [0, 4, 5, 3],
    modo: "major",
    grausLabel: "I – V – vi – IV",
    descricao: "Variação da anterior, muito usada em hits do pagode dos anos 2000.",
    dica: "A mudança de V para vi é chamada cadência deceptiva — surpresa harmônica.",
  },
  {
    nome: "I – I7 – IV – IVm",
    tipo: "Blues/Samba",
    graus: [0, 0, 3, 3],
    modo: "major",
    grausLabel: "I – I7 – IV – IVm – I",
    descricao: "O I7 cria tensão que resolve no IV. O IVm é emprestado do menor paralelo.",
    dica: "O IVm é o segredo do \"sabor\" desta progressão — não deixe de ouvi-lo.",
  },
  {
    nome: "i – VII – VI – V7",
    tipo: "Menor/Andaluza",
    graus: [0, 6, 5, 4],
    modo: "minor",
    grausLabel: "i – VII – VI – V7",
    descricao: "Cadência andaluza descendo. Muito usada no samba mais dramático e chorinho.",
    dica: "Note que o V7 aqui é maior (da escala harmônica menor), criando tensão forte.",
  },
  {
    nome: "i – iv – V7 – i",
    tipo: "Menor Clássica",
    graus: [0, 3, 4, 0],
    modo: "minor",
    grausLabel: "i – iv – V7 – i",
    descricao: "Versão menor do I-IV-V. O V7 vem da escala harmônica menor.",
    dica: "Compare com a versão maior: a mudança de modo cria emoção diferente.",
  },
  {
    nome: "I – bVII – IV – I",
    tipo: "Modal",
    graus: [0, 4, 3, 0],
    modo: "major",
    grausLabel: "I – bVII – IV – I",
    descricao: "Empréstimo do Mixolídio. O bVII não pertence ao campo harmônico maior.",
    dica: "O bVII é 1 tom abaixo do I. Em C: C – Bb – F – C.",
  },
  {
    nome: "Ciclo de Quintas",
    tipo: "Avançada",
    graus: [0, 3, 6, 2, 5, 1, 4, 0],
    modo: "major",
    grausLabel: "I – IV – viiº – iii – vi – ii – V – I",
    descricao: "Sequência que percorre todas as quintas do campo harmônico. Fundamental no choro e samba elaborado.",
    dica: "Ouça como cada acorde \"cai\" uma quinta até voltar ao I — é o ciclo completo.",
  },
]

const PADROES_ESPECIAIS: Record<string, (nota: string, campo: ReturnType<typeof campoHarmonico>) => string[]> = {
  "I – I7 – IV – IVm": (_nota, campo) => {
    const I = campo[0].example
    const I7 = campo[0].root + "7"
    const IV = campo[3].example
    const IVm = campo[3].root + "m"
    return [I, I7, IV, IVm]
  },
  "I – bVII – IV – I": (_nota, campo) => {
    const I = campo[0].example
    const IV = campo[3].example
    const bVII_MAP: Record<string, string> = {
      C: "Bb", "C#": "B", D: "C", Eb: "Db", E: "D", F: "Eb",
      "F#": "E", G: "F", Ab: "Gb", A: "G", Bb: "Ab", B: "A",
    }
    const bVII = (bVII_MAP[campo[0].root] ?? "?") + "7"
    return [I, bVII, IV, I]
  },
}

function getChordsForPadrao(padrao: Padrao, nota: string): string[] {
  const normRoot = TO_NORM[nota] ?? nota
  const campo = campoHarmonico(normRoot, padrao.modo)
  if (PADROES_ESPECIAIS[padrao.nome]) {
    return PADROES_ESPECIAIS[padrao.nome](nota, campo)
  }
  return padrao.graus.map((g) => campo[g].example)
}

// ── Progressões comuns (para tab Campo Harmônico) ──────────────

const PROGRESSOES_COMUNS = [
  { nome: "I – IV – V – I", tipo: "Básica", graus: "I – IV – V7 – I", indices: [0, 3, 4, 0], descricao: "A progressão mais usada na música popular." },
  { nome: "ii – V – I", tipo: "Jazz/Samba", graus: "ii – V7 – I", indices: [1, 4, 0], descricao: "Base do samba e jazz. Gera tensão e resolução perfeita." },
  { nome: "I – vi – IV – V", tipo: "Clássica", graus: "I – vi – IV – V", indices: [0, 5, 3, 4], descricao: "Usada em inúmeros clássicos do pagode." },
  { nome: "I – V – vi – IV", tipo: "Pop/Pagode", graus: "I – V – vi – IV", indices: [0, 4, 5, 3], descricao: "Variação da anterior, muito usada no pagode moderno." },
  { nome: "i – VII – VI – V", tipo: "Menor", graus: "i – VII – VI – V7", indices: [0, 6, 5, 4], descricao: "Cadência andaluza, frequente no samba mais dramático.", forceMinor: true },
  { nome: "I – bVII – IV – I", tipo: "Modal", graus: "I – bVII – IV – I", indices: [0, -1, 3, 0], descricao: "Empréstimo modal, muito usado em samba-rock." },
  { nome: "Ciclo de Quintas", tipo: "Avançada", graus: "I – IV – viiº – iii – vi – ii – V – I", indices: [0, 3, 6, 2, 5, 1, 4, 0], descricao: "Sequência que percorre todas as quintas do campo harmônico." },
  { nome: "I – I7 – IV – IVm", tipo: "Blues/Samba", graus: "I – I7 – IV – IVm – I", indices: [0, -2, 3, -3, 0], descricao: "Tônica dominante seguida de movimento IV – IVm muito usado no pagode." },
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
    if (idx === -1 && minorCampo) return minorCampo[6].example
    if (idx === -2) return campo[0].root + "7"
    if (idx === -3) return campo[3].root + "m"
    return campo[idx].example
  })

  return `Em ${nota}: ${parts.join(" – ")}`
}

// ── Sequências order ──────────────

const SEQ_ORDER = [
  "roda-de-samba",
  "passeio-diatonico",
  "dominante-secundaria",
  "cadeia-de-dominantes",
  "ciclo-completo",
]

// ── Page ──────────────

export default function ProgressoesPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabId>("campo")
  const [nota, setNota] = useState("C")
  const [mode, setMode] = useState<Mode>("major")
  const [savedProgs, setSavedProgs] = useState<SavedProgression[]>([])
  const [padraoIdx, setPadraoIdx] = useState(0)

  useEffect(() => {
    const raw = localStorage.getItem("savedProgressions")
    if (raw) setSavedProgs(JSON.parse(raw))
  }, [])

  const padrao = PADROES[padraoIdx]

  const selectPadrao = useCallback((idx: number) => {
    setPadraoIdx(idx)
    setMode(PADROES[idx].modo)
  }, [])

  function embaralhar() {
    const idx = Math.floor(Math.random() * PADROES.length)
    setPadraoIdx(idx)
    setMode(PADROES[idx].modo)
    setNota(NOTAS_DISPLAY[Math.floor(Math.random() * NOTAS_DISPLAY.length)])
  }

  function removeSaved(index: number) {
    const updated = savedProgs.filter((_, i) => i !== index)
    setSavedProgs(updated)
    localStorage.setItem("savedProgressions", JSON.stringify(updated))
  }

  function openInAnalise(progression: string) {
    const encoded = encodeURIComponent(progression.replace(/\s*\|\s*/g, " "))
    router.push(`/analise?p=${encoded}`)
  }

  const normRoot = TO_NORM[nota] ?? nota
  const campo = campoHarmonico(normRoot, mode)
  const chords = getChordsForPadrao(padrao, nota)
  const modeLabel = padrao.modo === "major" ? "maior" : "menor"

  const sortedSeqs = [...PROGRESSOES].sort((a, b) => {
    const ai = SEQ_ORDER.indexOf(a.slug)
    const bi = SEQ_ORDER.indexOf(b.slug)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Progressões Harmônicas</h1>
        <p className="text-slate-400">
          Campo harmônico, cadências, sequências e suas progressões — tudo num só lugar.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-violet-600 text-white"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {t.label}
            {t.id === "minhas" && savedProgs.length > 0 && (
              <span className="ml-1.5 bg-violet-500/30 text-violet-200 text-xs px-1.5 py-0.5 rounded-full">
                {savedProgs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ Tab: Campo Harmônico ═══ */}
      {tab === "campo" && (
        <div className="space-y-12">
          <section>
            <h2 className="text-lg font-semibold text-white mb-1">Campo Harmônico</h2>
            <p className="text-slate-400 text-sm mb-5">
              Selecione a tonalidade para ver os 7 acordes diatônicos e suas funções.
            </p>
            <CampoHarmonico nota={nota} mode={mode} onNotaChange={setNota} onModeChange={setMode} />
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-1">Progressões Comuns do Samba e Pagode</h2>
            <p className="text-slate-400 text-sm mb-5">
              Exemplos transpostos para <span className="text-violet-300 font-medium">{nota} {mode === "major" ? "maior" : "menor"}</span>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROGRESSOES_COMUNS.map((p) => (
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
                  <p className="text-slate-500 text-xs mt-1">{p.descricao}</p>
                </div>
              ))}
            </div>
          </section>

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
      )}

      {/* ═══ Tab: Cadências ═══ */}
      {tab === "cadencias" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-2">Tonalidade</p>
              <div className="flex flex-wrap gap-1.5">
                {NOTAS_DISPLAY.map((n) => (
                  <button
                    key={n}
                    onClick={() => setNota(n)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                      nota === n
                        ? "bg-violet-600 text-white"
                        : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={embaralhar}
                  className="px-4 h-10 rounded-lg text-sm font-medium bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-2"
                >
                  Embaralhar
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-2">Progressão</p>
              <div className="flex flex-wrap gap-2">
                {PADROES.map((p, i) => (
                  <button
                    key={p.nome}
                    onClick={() => selectPadrao(i)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      padraoIdx === i
                        ? "bg-violet-600 text-white"
                        : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span className="font-mono">{p.nome}</span>
                    <span className="opacity-50">{p.tipo}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Pratique em</p>
                <h2 className="text-xl font-bold text-white">
                  {nota} {modeLabel}
                </h2>
              </div>
              <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/20 px-3 py-1.5 rounded-full">
                {padrao.tipo}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap mb-5">
              {chords.map((chord, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="bg-[#0a0714] border border-violet-500/30 rounded-xl px-5 py-4 text-center">
                    <p className="text-2xl font-bold font-mono text-violet-200">{chord}</p>
                  </div>
                  {i < chords.length - 1 && (
                    <span className="text-slate-600 text-xl">→</span>
                  )}
                </div>
              ))}
            </div>

            <p className="text-sm text-slate-500 font-mono mb-4">{padrao.grausLabel}</p>

            <div className="space-y-2 border-t border-white/5 pt-4">
              <p className="text-slate-300 text-sm">{padrao.descricao}</p>
              <p className="text-amber-400 text-sm">
                <span className="font-semibold">Dica: </span>{padrao.dica}
              </p>
            </div>
          </div>

          <div className="bg-[#120d24] border border-white/5 rounded-2xl p-5">
            <p className="text-xs text-slate-500 mb-3">Campo harmônico de {nota} {modeLabel}</p>
            <div className="flex flex-wrap gap-2">
              {campoHarmonico(TO_NORM[nota] ?? nota, padrao.modo).map((c) => (
                <span
                  key={c.degree}
                  className="text-xs font-mono bg-white/5 text-slate-400 px-2.5 py-1 rounded-lg"
                >
                  <span className="text-slate-600">{c.degree}: </span>
                  {c.example}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Tab: Sequências ═══ */}
      {tab === "sequencias" && (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Estude os padrões harmônicos mais usados no samba e pagode através de músicas reais do repertório.
          </p>
          {sortedSeqs.map((p) => (
            <ProgressaoCard key={p.slug} progressao={p} />
          ))}
          <div className="bg-[#120d24] border border-white/5 rounded-2xl p-5 text-center">
            <p className="text-slate-500 text-sm">
              {PROGRESSOES.reduce((sum, p) => sum + p.musicas.length, 0)} análises de músicas em{" "}
              {PROGRESSOES.length} progressões • Baseado em 20 cifras curadas do repertório
            </p>
          </div>
        </div>
      )}

      {/* ═══ Tab: Formação de Acordes ═══ */}
      {tab === "acordes" && <FormacaoAcordes />}

      {/* ═══ Tab: Minhas Progressões ═══ */}
      {tab === "minhas" && (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Progressões salvas a partir do Analisador Harmônico.
          </p>
          {savedProgs.length > 0 ? (
            <div className="space-y-3">
              {savedProgs.map((sp, i) => (
                <div key={i} className="bg-[#120d24] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-mono text-sm truncate">{sp.progression}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Tom: <span className="text-violet-300">{sp.key}</span>
                      <span className="ml-3">{new Date(sp.date).toLocaleDateString("pt-BR")}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openInAnalise(sp.progression)}
                      className="text-xs bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      Analisar
                    </button>
                    <button
                      onClick={() => removeSaved(i)}
                      className="text-xs text-slate-600 hover:text-rose-400 transition-colors px-1.5 py-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#120d24] border border-white/5 rounded-2xl p-8 text-center">
              <p className="text-slate-500 text-sm mb-3">Nenhuma progressão salva ainda.</p>
              <p className="text-slate-600 text-xs">
                Use o <button onClick={() => router.push("/analise")} className="text-violet-400 hover:text-violet-300 transition-colors underline">Analisador Harmônico</button> para analisar e salvar progressões.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
