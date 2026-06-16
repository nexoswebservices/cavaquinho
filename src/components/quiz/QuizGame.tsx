"use client"

import { useState, useCallback } from "react"
import { gerarPerguntas } from "@/lib/quiz"
import type { Pergunta } from "@/lib/quiz"

const N_PERGUNTAS = 10

type Estado = 'inicio' | 'jogando' | 'fim'

export function QuizGame() {
  const [estado, setEstado] = useState<Estado>('inicio')
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [atual, setAtual] = useState(0)
  const [respostas, setRespostas] = useState<(number | null)[]>([])
  const [mostrarExp, setMostrarExp] = useState(false)

  const iniciar = useCallback(() => {
    const ps = gerarPerguntas(N_PERGUNTAS)
    setPerguntas(ps)
    setAtual(0)
    setRespostas(new Array(N_PERGUNTAS).fill(null))
    setMostrarExp(false)
    setEstado('jogando')
  }, [])

  function responder(idx: number) {
    if (respostas[atual] !== null) return
    const novas = [...respostas]
    novas[atual] = idx
    setRespostas(novas)
    setMostrarExp(true)
  }

  function proxima() {
    if (atual + 1 >= N_PERGUNTAS) {
      setEstado('fim')
    } else {
      setAtual(atual + 1)
      setMostrarExp(false)
    }
  }

  const acertos = respostas.filter((r, i) => perguntas[i] && r === perguntas[i].correta).length

  // ── Tela inicial ─────────────────────────────────────────────────────────
  if (estado === 'inicio') {
    return (
      <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto">
        <div className="text-5xl mb-4">🎵</div>
        <h2 className="text-xl font-bold text-white mb-2">Quiz de Teoria Musical</h2>
        <p className="text-slate-400 text-sm mb-6">
          {N_PERGUNTAS} perguntas sobre acordes, graus e cadências do samba e pagode.
          As perguntas são geradas aleatoriamente a cada rodada.
        </p>
        <button
          onClick={iniciar}
          className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors"
        >
          Começar Quiz
        </button>
      </div>
    )
  }

  // ── Tela de resultado ─────────────────────────────────────────────────────
  if (estado === 'fim') {
    const pct = Math.round((acertos / N_PERGUNTAS) * 100)
    const estrelas = pct >= 90 ? '⭐⭐⭐' : pct >= 70 ? '⭐⭐' : pct >= 50 ? '⭐' : ''
    const msg = pct >= 90
      ? 'Excelente! Você domina a harmonia do samba!'
      : pct >= 70
      ? 'Muito bem! Continue praticando!'
      : pct >= 50
      ? 'Bom começo. Revise os graus e cadências.'
      : 'Continue estudando — a teoria vem com prática!'

    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">{estrelas || '🎵'}</div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {acertos}/{N_PERGUNTAS} acertos
          </h2>
          <p className="text-slate-400 text-sm mb-2">{msg}</p>
          <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${
                pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <button
            onClick={iniciar}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors"
          >
            Jogar Novamente
          </button>
        </div>

        {/* Resumo das perguntas */}
        <div className="space-y-2">
          {perguntas.map((p, i) => {
            const resp = respostas[i]
            const acertou = resp === p.correta
            return (
              <div
                key={p.id}
                className={`bg-[#120d24] border rounded-xl p-3 flex items-start gap-3 ${
                  acertou ? 'border-emerald-500/20' : 'border-rose-500/20'
                }`}
              >
                <span className={`text-sm flex-shrink-0 ${acertou ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {acertou ? '✓' : '✗'}
                </span>
                <div>
                  <p className="text-xs text-slate-400">{p.texto}</p>
                  <p className="text-xs text-white font-medium mt-0.5">
                    {p.opcoes[p.correta]}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Jogando ───────────────────────────────────────────────────────────────
  const pergunta = perguntas[atual]
  const resposta = respostas[atual]
  const respondeu = resposta !== null

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Progresso */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-slate-800 rounded-full h-1.5">
          <div
            className="h-1.5 bg-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${(atual / N_PERGUNTAS) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 flex-shrink-0">
          {atual + 1} / {N_PERGUNTAS}
        </span>
        <span className="text-xs text-slate-500 flex-shrink-0">
          ✓ {respostas.filter((r, i) => perguntas[i] && r === perguntas[i].correta).length}
        </span>
      </div>

      {/* Pergunta */}
      <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-6">
        <p className="text-white font-semibold text-base mb-5">{pergunta.texto}</p>

        <div className="space-y-2">
          {pergunta.opcoes.map((opcao, i) => {
            let cls = 'border-white/10 text-slate-300 hover:border-white/20'
            if (respondeu) {
              if (i === pergunta.correta) {
                cls = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
              } else if (i === resposta) {
                cls = 'border-rose-500/50 bg-rose-500/10 text-rose-300'
              } else {
                cls = 'border-white/5 text-slate-500'
              }
            }
            return (
              <button
                key={i}
                onClick={() => responder(i)}
                disabled={respondeu}
                className={`w-full text-left border rounded-xl px-4 py-3 text-sm font-mono font-semibold transition-colors disabled:cursor-default ${cls}`}
              >
                <span className="text-slate-600 text-xs mr-2 font-sans font-normal not-italic">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opcao}
              </button>
            )
          })}
        </div>

        {/* Explicação */}
        {mostrarExp && (
          <div className={`mt-4 p-3 rounded-xl text-sm ${
            respostas[atual] === pergunta.correta
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
          }`}>
            {respostas[atual] === pergunta.correta ? '✓ Correto! ' : '✗ Errado. '}
            {pergunta.explicacao}
          </div>
        )}
      </div>

      {/* Botão próxima */}
      {respondeu && (
        <div className="flex justify-end">
          <button
            onClick={proxima}
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            {atual + 1 >= N_PERGUNTAS ? 'Ver resultado →' : 'Próxima →'}
          </button>
        </div>
      )}
    </div>
  )
}
