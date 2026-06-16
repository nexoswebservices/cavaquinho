"use client"

import { useState, useCallback } from "react"
import { campoHarmonico } from "@/lib/teoria"
import type { Mode } from "@/lib/teoria"

const NOTAS_DISPLAY = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const TO_NORM: Record<string, string> = { Eb: 'D#', Ab: 'G#', Bb: 'A#' }

interface Padrao {
  nome: string
  tipo: string
  graus: number[]  // 0-indexed: 0=I, 1=II, etc.
  modo: Mode
  descricao: string
  dica: string
}

const PADROES: Padrao[] = [
  {
    nome: 'ii – V7 – I',
    tipo: 'Jazz/Samba',
    graus: [1, 4, 0],
    modo: 'major',
    descricao: 'A cadência mais importante do samba. O ii cria tensão, o V7 aumenta, e o I resolve.',
    dica: 'Pratique lento e ouça a sensação de "chegada" no I.',
  },
  {
    nome: 'I – IV – V7 – I',
    tipo: 'Básica',
    graus: [0, 3, 4, 0],
    modo: 'major',
    descricao: 'Base de inúmeras músicas populares. Funciona em qualquer tonalidade.',
    dica: 'Experimente variar o ritmo: marque o I e o IV mais longos.',
  },
  {
    nome: 'I – vi – IV – V',
    tipo: 'Pop/Pagode',
    graus: [0, 5, 3, 4],
    modo: 'major',
    descricao: 'Sequência clássica do pagode moderno. Cria uma sensação circular.',
    dica: 'Tente cantarolar uma melodia por cima enquanto toca.',
  },
  {
    nome: 'I – V – vi – IV',
    tipo: 'Pop/Pagode',
    graus: [0, 4, 5, 3],
    modo: 'major',
    descricao: 'Variação da anterior, muito usada em hits do pagode dos anos 2000.',
    dica: 'A mudança de V para vi é chamada cadência deceptiva — surpresa harmônica.',
  },
  {
    nome: 'I – I7 – IV – IVm',
    tipo: 'Blues/Samba',
    graus: [0, 0, 3, 3],
    modo: 'major',
    descricao: 'O I7 cria tensão que resolve no IV. O IVm é emprestado do menor paralelo.',
    dica: 'O IVm é o segredo do "sabor" deste progressão — não deixe de ouvi-lo.',
    // Special: grau 3 (IV) e o IVm é IV com modo alterado — tratamos abaixo
  },
  {
    nome: 'i – VII – VI – V7',
    tipo: 'Menor',
    graus: [0, 6, 5, 4],
    modo: 'minor',
    descricao: 'Cadência andaluza descendo. Muito usada no samba mais dramático e chorinho.',
    dica: 'Note que o V7 aqui é maior (da escala harmônica menor), criando tensão forte.',
  },
  {
    nome: 'i – iv – V7 – i',
    tipo: 'Menor Clássica',
    graus: [0, 3, 4, 0],
    modo: 'minor',
    descricao: 'Versão menor do I-IV-V. O V7 vem da escala harmônica menor.',
    dica: 'Compare com a versão maior: a mudança de modo cria emoção diferente.',
  },
  {
    nome: 'I – bVII – IV – I',
    tipo: 'Modal',
    graus: [0, 4, 3, 0],
    modo: 'major',
    descricao: 'Empréstimo do Mixolídio. O bVII não pertence ao campo harmônico maior.',
    dica: 'O bVII é 1 tom abaixo do I. Em C: C – Bb – F – C.',
    // Special: different progression
  },
]

const PADROES_ESPECIAIS: Record<string, (nota: string, campo: ReturnType<typeof campoHarmonico>) => string[]> = {
  'I – I7 – IV – IVm': (nota, campo) => {
    const I = campo[0].example
    const I7 = campo[0].root + '7'
    const IV = campo[3].example
    const IVm = campo[3].root + 'm'
    return [I, I7, IV, IVm]
  },
  'I – bVII – IV – I': (nota, campo) => {
    const I = campo[0].example
    const IV = campo[3].example
    // bVII = 1 tom abaixo do I
    const bVII_MAP: Record<string, string> = {
      C: 'Bb', 'C#': 'B', D: 'C', Eb: 'Db', E: 'D', F: 'Eb',
      'F#': 'E', G: 'F', Ab: 'Gb', A: 'G', Bb: 'Ab', B: 'A',
    }
    const bVII = (bVII_MAP[campo[0].root] ?? '?') + '7'
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

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function TreinoCadencias() {
  const [nota, setNota] = useState("C")
  const [padraoIdx, setPadraoIdx] = useState(0)
  const [mode, setMode] = useState<Mode>("major")

  const padrao = PADROES[padraoIdx]

  // Sync mode with padrao
  const selectPadrao = useCallback((idx: number) => {
    setPadraoIdx(idx)
    setMode(PADROES[idx].modo)
  }, [])

  function embaralhar() {
    const idx = Math.floor(Math.random() * PADROES.length)
    setPadraoIdx(idx)
    setMode(PADROES[idx].modo)
    setNota(randomFrom(NOTAS_DISPLAY))
  }

  const chords = getChordsForPadrao(padrao, nota)
  const modeLabel = padrao.modo === 'major' ? 'maior' : 'menor'

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="space-y-4">
        {/* Nota */}
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

        {/* Padrão */}
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

      {/* Exercício */}
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

        {/* Acordes */}
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

        {/* Progressão em graus */}
        <p className="text-sm text-slate-500 font-mono mb-4">{padrao.nome}</p>

        {/* Descrição + dica */}
        <div className="space-y-2 border-t border-white/5 pt-4">
          <p className="text-slate-300 text-sm">{padrao.descricao}</p>
          <p className="text-amber-400 text-sm">
            <span className="font-semibold">Dica: </span>{padrao.dica}
          </p>
        </div>
      </div>

      {/* Referência rápida */}
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
  )
}
