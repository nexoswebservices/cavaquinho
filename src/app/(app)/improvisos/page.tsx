"use client"

import { useState, useCallback } from "react"
import { ESCALAS, ESCALA_TIPOS } from "@/lib/escalas-data"
import { FRASES, FRASE_NIVEIS } from "@/lib/frases-data"
import { BracoEscala } from "@/components/improvisos/BracoEscala"
import { PartituraComTab } from "@/components/partitura/PartituraComTab"
import { PlayButton } from "@/components/ui/PlayButton"
import { initSampler, isReady, playArpejo, playBackingTrack, stopBackingTrack } from "@/lib/sampler"

const NOTAS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const TO_SHARP: Record<string, string> = { Eb: "D#", Ab: "G#", Bb: "A#", Db: "C#", Gb: "F#" }

function noteAtSemitone(root: string, semitones: number): string {
  const r = TO_SHARP[root] ?? root
  const idx = CHROMATIC.indexOf(r)
  if (idx === -1) return root
  return CHROMATIC[(idx + semitones) % 12]
}

const TABS = [
  { id: "escalas", label: "Escalas" },
  { id: "frases", label: "Frases" },
  { id: "exercicios", label: "Exercícios" },
  { id: "backing", label: "Backing Tracks" },
] as const

type TabId = (typeof TABS)[number]["id"]

const BACKING_PROGRESSIONS = [
  { nome: "ii – V – I", graus: [[1, "m"], [4, "7"], [0, ""]] as [number, string][] },
  { nome: "I – IV – V – I", graus: [[0, ""], [3, ""], [4, "7"], [0, ""]] as [number, string][] },
  { nome: "I – vi – IV – V", graus: [[0, ""], [5, "m"], [3, ""], [4, ""]] as [number, string][] },
  { nome: "I – vi – ii – V (Roda de Samba)", graus: [[0, ""], [5, "m"], [1, "m"], [4, "7"]] as [number, string][] },
  { nome: "Blues 12 compassos", graus: [[0, "7"], [0, "7"], [0, "7"], [0, "7"], [3, "7"], [3, "7"], [0, "7"], [0, "7"], [4, "7"], [3, "7"], [0, "7"], [4, "7"]] as [number, string][] },
]

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11]

export default function ImprovisosPage() {
  const [tab, setTab] = useState<TabId>("escalas")
  const [root, setRoot] = useState("C")
  const [escalaId, setEscalaId] = useState("pent-maior")
  const [fraseNivel, setFraseNivel] = useState("Iniciante")
  const [backingIdx, setBackingIdx] = useState(0)
  const [backingPlaying, setBackingPlaying] = useState(false)
  const [backingBpm, setBackingBpm] = useState(100)

  const rootSharp = TO_SHARP[root] ?? root
  const escala = ESCALAS.find((e) => e.id === escalaId)!

  const filteredFrases = FRASES.filter((f) => fraseNivel === "Todos" || f.nivel === fraseNivel)

  const handlePlayBacking = useCallback(async () => {
    if (!isReady()) await initSampler()
    if (backingPlaying) {
      stopBackingTrack()
      setBackingPlaying(false)
      return
    }

    const rootIdx = CHROMATIC.indexOf(rootSharp)
    const prog = BACKING_PROGRESSIONS[backingIdx]
    const chords = prog.graus.map(([degree, suffix]) => {
      const noteIdx = (rootIdx + MAJOR_SCALE[degree]) % 12
      const note = CHROMATIC[noteIdx]
      if (suffix === "m") return [[note, 4], [noteAtSemitone(note, 3), 4], [noteAtSemitone(note, 7), 4]] as [string, number][]
      if (suffix === "7") return [[note, 4], [noteAtSemitone(note, 4), 4], [noteAtSemitone(note, 7), 4], [noteAtSemitone(note, 10), 4]] as [string, number][]
      return [[note, 4], [noteAtSemitone(note, 4), 4], [noteAtSemitone(note, 7), 4]] as [string, number][]
    })

    playBackingTrack(chords, backingBpm, 4)
    setBackingPlaying(true)
  }, [backingPlaying, backingIdx, backingBpm, rootSharp])

  const handlePlayFrase = useCallback(async (fraseNotas: [string, number][]) => {
    if (!isReady()) await initSampler()
    playArpejo(fraseNotas, 120, fraseNotas.map((_, i) => i))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Improvisos</h1>
        <p className="text-slate-400">
          Escalas, frases prontas e backing tracks para improvisar no cavaquinho.
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

      {/* Nota raiz (compartilhada) */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Tonalidade</p>
        <div className="flex flex-wrap gap-1.5">
          {NOTAS.map((n) => (
            <button
              key={n}
              onClick={() => setRoot(n)}
              className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                root === n ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Tab: Escalas ═══ */}
      {tab === "escalas" && (
        <div className="space-y-6">
          <div>
            <p className="text-xs text-slate-500 mb-2">Escala</p>
            <div className="space-y-3">
              {ESCALA_TIPOS.map((tipo) => (
                <div key={tipo}>
                  <p className="text-xs text-slate-600 mb-1.5">{tipo}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ESCALAS.filter((e) => e.tipo === tipo).map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setEscalaId(e.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                          escalaId === e.id ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {e.nome}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{escala.nome} de {root}</h2>
                <p className="text-xs text-slate-500 mt-1">{escala.tipo} • {escala.usoComum}</p>
              </div>
              <PlayButton
                notes={escala.intervalos.map((i): [string, number] => [noteAtSemitone(rootSharp, i), 4])}
                size="md"
                label="Tocar escala"
              />
            </div>

            <BracoEscala root={rootSharp} intervalos={escala.intervalos} />

            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                {escala.intervalos.map((i, idx) => (
                  <span key={idx} className="bg-violet-500/15 border border-violet-400/30 text-violet-200 font-mono text-sm font-bold px-3 py-1 rounded-lg">
                    {noteAtSemitone(rootSharp, i)}
                  </span>
                ))}
              </div>
              <p className="text-slate-300 text-sm mt-3">{escala.descricao}</p>
              <p className="text-xs text-slate-500">Acordes compatíveis: {escala.acordesCompativeis.join(", ")}</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Tab: Frases ═══ */}
      {tab === "frases" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-1.5">
            {["Todos", ...FRASE_NIVEIS].map((n) => (
              <button
                key={n}
                onClick={() => setFraseNivel(n)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  fraseNivel === n ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredFrases.map((frase) => {
              const escalaRef = ESCALAS.find((e) => e.id === frase.escala)
              const frasePlayNotes: [string, number][] = frase.notas.map((n) => [
                TO_SHARP[n.note] ?? n.note,
                n.octave,
              ])

              return (
                <div key={frase.id} className="bg-[#120d24] border border-white/5 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-white font-bold">{frase.nome}</h3>
                      <p className="text-xs text-slate-500">
                        {escalaRef?.nome} • {frase.nivel}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePlayFrase(frasePlayNotes)}
                      className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 flex items-center justify-center transition-colors"
                    >
                      ▶
                    </button>
                  </div>

                  <PartituraComTab notes={frase.notas} tab={frase.tab} />

                  <div className="mt-3 space-y-1">
                    <p className="text-slate-300 text-sm">{frase.descricao}</p>
                    <p className="text-amber-400 text-sm">
                      <span className="font-semibold">Dica: </span>{frase.dica}
                    </p>
                    {frase.musicasExemplo.length > 0 && (
                      <p className="text-xs text-slate-500">
                        Músicas: {frase.musicasExemplo.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══ Tab: Exercícios ═══ */}
      {tab === "exercicios" && (
        <div className="space-y-6">
          <p className="text-slate-400 text-sm">
            Selecione uma escala na tab Escalas e pratique sobre as progressões na tab Backing Tracks.
            Combine frases da biblioteca com os backing tracks para criar seus improvisos.
          </p>

          <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Exercício Guiado</h2>
            <div className="space-y-3">
              <div className="bg-[#0a0714] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Passo 1</p>
                <p className="text-slate-300 text-sm">Escolha uma tonalidade e a escala <span className="text-violet-300 font-bold">{escala.nome}</span></p>
              </div>
              <div className="bg-[#0a0714] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Passo 2</p>
                <p className="text-slate-300 text-sm">Memorize as posições no braço (tab Escalas)</p>
              </div>
              <div className="bg-[#0a0714] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Passo 3</p>
                <p className="text-slate-300 text-sm">Aprenda 2-3 frases da biblioteca (tab Frases)</p>
              </div>
              <div className="bg-[#0a0714] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Passo 4</p>
                <p className="text-slate-300 text-sm">Ligue um backing track e improvise combinando as frases com notas da escala</p>
              </div>
              <div className="bg-[#0a0714] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Passo 5</p>
                <p className="text-slate-300 text-sm">Use o metrônomo (botão flutuante) para controlar o andamento</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Tab: Backing Tracks ═══ */}
      {tab === "backing" && (
        <div className="space-y-6">
          <div>
            <p className="text-xs text-slate-500 mb-2">BPM</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setBackingBpm((b) => Math.max(40, b - 10))} className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white text-lg font-bold transition-colors">−</button>
              <span className="text-white font-mono text-xl font-bold w-12 text-center">{backingBpm}</span>
              <button onClick={() => setBackingBpm((b) => Math.min(200, b + 10))} className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white text-lg font-bold transition-colors">+</button>
            </div>
          </div>

          <div className="space-y-3">
            {BACKING_PROGRESSIONS.map((prog, i) => (
              <div
                key={i}
                className={`bg-[#120d24] border rounded-2xl p-5 transition-all cursor-pointer ${
                  backingIdx === i ? "border-violet-500/30" : "border-white/5 hover:border-violet-500/20"
                }`}
                onClick={() => setBackingIdx(i)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold font-mono">{prog.nome}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {prog.graus.length} acordes • Em {root}
                    </p>
                  </div>
                  {backingIdx === i && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePlayBacking() }}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        backingPlaying
                          ? "bg-rose-600 hover:bg-rose-500 text-white"
                          : "bg-violet-600 hover:bg-violet-500 text-white"
                      }`}
                    >
                      {backingPlaying ? "PARAR" : "▶ TOCAR"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#0a0714] border border-white/5 rounded-xl p-4 text-center">
            <p className="text-slate-500 text-xs">
              Escala sugerida: <span className="text-violet-300 font-bold">{escala.nome} de {root}</span>
              {" "}• Ligue o metrônomo para manter o tempo
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
