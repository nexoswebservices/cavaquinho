"use client"

import { useState, useCallback, useEffect } from "react"
import { PartituraView } from "@/components/partitura/PartituraView"
import { QUIZ_NOTAS } from "@/lib/partituras-data"
import { initSampler, isReady, playNote } from "@/lib/sampler"

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

type Nivel = "iniciante" | "intermediario" | "avancado"
const NIVEIS: { id: Nivel; label: string }[] = [
  { id: "iniciante", label: "Iniciante" },
  { id: "intermediario", label: "Intermediário" },
  { id: "avancado", label: "Avançado" },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function QuizNota() {
  const [nivel, setNivel] = useState<Nivel>("iniciante")
  const [score, setScore] = useState({ acertos: 0, erros: 0 })
  const [answered, setAnswered] = useState<string | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)

  const pool = QUIZ_NOTAS[nivel]
  const current = pool[currentIdx % pool.length]

  // Ordem inicial determinística (sem Math.random) para o HTML do servidor
  // bater com a primeira renderização no cliente. O embaralhamento real só
  // acontece depois de montado (useEffect abaixo), evitando erro de hidratação.
  const buildOptions = useCallback(() => {
    const correct = current.name
    const others = pool.filter((n) => n.name !== correct).map((n) => n.name)
    return [correct, ...others.slice(0, 3)]
  }, [current, pool])

  const [options, setOptions] = useState<string[]>(buildOptions)

  useEffect(() => {
    const correct = current.name
    const others = pool.filter((n) => n.name !== correct).map((n) => n.name)
    const wrong = shuffle(others).slice(0, 3)
    setOptions(shuffle([correct, ...wrong]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, pool])

  const handleAnswer = useCallback(async (answer: string) => {
    if (answered) return
    setAnswered(answer)

    const isCorrect = answer === current.name
    if (isCorrect) {
      setScore((s) => ({ ...s, acertos: s.acertos + 1 }))
      if (!isReady()) await initSampler()
      const noteSharp = current.accidental === "#" ? current.note + "#" : current.note
      playNote(CHROMATIC.includes(noteSharp) ? noteSharp : current.note, current.octave)
    } else {
      setScore((s) => ({ ...s, erros: s.erros + 1 }))
    }

    setTimeout(() => {
      setAnswered(null)
      setCurrentIdx((i) => i + 1)
    }, 1200)
  }, [answered, current])

  const handleReset = () => {
    setScore({ acertos: 0, erros: 0 })
    setCurrentIdx(0)
    setAnswered(null)
  }

  return (
    <div className="space-y-5">
      {/* Nível */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">Nível</span>
        {NIVEIS.map((n) => (
          <button
            key={n.id}
            onClick={() => { setNivel(n.id); handleReset() }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              nivel === n.id ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* Score */}
      <div className="flex gap-4 text-sm">
        <span className="text-emerald-400">✓ {score.acertos}</span>
        <span className="text-rose-400">✕ {score.erros}</span>
        <span className="text-slate-500">#{currentIdx + 1}</span>
      </div>

      {/* Nota no pentagrama */}
      <div className="bg-[#0a0714] border border-white/5 rounded-xl p-4">
        <p className="text-xs text-slate-500 mb-2">Que nota é esta?</p>
        <PartituraView
          notes={[{
            note: current.note,
            octave: current.octave,
            duration: "w",
            accidental: current.accidental,
          }]}
        />
      </div>

      {/* Opções */}
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          let btnClass = "bg-white/5 text-slate-300 hover:bg-white/10"
          if (answered) {
            if (opt === current.name) btnClass = "bg-emerald-600 text-white"
            else if (opt === answered) btnClass = "bg-rose-600 text-white"
            else btnClass = "bg-white/5 text-slate-600"
          }
          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={!!answered}
              className={`py-3 rounded-xl text-sm font-bold transition-all ${btnClass}`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <p className={`text-center text-sm font-bold ${answered === current.name ? "text-emerald-400" : "text-rose-400"}`}>
          {answered === current.name ? "Correto!" : `Errado — era ${current.name}`}
        </p>
      )}

      {/* Reset */}
      <button
        onClick={handleReset}
        className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
      >
        Reiniciar quiz
      </button>
    </div>
  )
}
