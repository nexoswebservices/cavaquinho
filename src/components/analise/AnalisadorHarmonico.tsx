"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  parseProgression,
  detectKey,
  analyzeDegrees,
  detectCadences,
} from "@/lib/teoria"
import type { KeyResult, DegreeInfo, Cadence } from "@/lib/teoria"

const EXEMPLO = `C6(9) D/C Bm7(5-) E7(5+) Am7(11)
Em7 A7 Dm7(9) Dm/C
Bm7(5-) E7(13-) Am7
F7M C9/E Dm7 G7`

interface Resultado {
  keys: KeyResult[]
  selectedKey: KeyResult
  degrees: DegreeInfo[]
  cadences: Cadence[]
  minScore: number
  maxScore: number
}

function buildResultado(text: string, selectedKey?: KeyResult): Resultado | null {
  const chords = parseProgression(text)
  if (!chords.length) return null

  const keys = detectKey(chords)
  const key = selectedKey ?? keys[0]
  const degrees = analyzeDegrees(chords, key)
  const cadences = detectCadences(degrees)

  const scores = keys.map((k) => k.score)
  const minScore = Math.min(...scores)
  const maxScore = Math.max(...scores)

  return { keys, selectedKey: key, degrees, cadences, minScore, maxScore }
}

function confidence(k: KeyResult, minScore: number, maxScore: number): number {
  if (maxScore === minScore) return 100
  return Math.round(((k.score - minScore) / (maxScore - minScore)) * 100)
}

interface Props {
  preloadText?: string
}

export function AnalisadorHarmonico({ preloadText }: Props) {
  const router = useRouter()
  const [text, setText] = useState(preloadText ?? "")
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const analisar = useCallback(() => {
    const chords = parseProgression(text)
    if (!chords.length) {
      setError("Nenhum acorde reconhecido. Digite acordes separados por espaços.")
      return
    }
    setError("")
    setSaved(false)
    setResultado(buildResultado(text) ?? null)
  }, [text])

  useEffect(() => {
    if (preloadText) {
      const r = buildResultado(preloadText)
      if (r) { setResultado(r); setError("") }
    }
  }, [preloadText])

  function selectKey(key: KeyResult) {
    if (!resultado) return
    const chords = resultado.degrees.map((d) => d.chord)
    const degrees = analyzeDegrees(chords, key)
    const cadences = detectCadences(degrees)
    setResultado({ ...resultado, selectedKey: key, degrees, cadences })
  }

  function carregarExemplo() {
    setText(EXEMPLO)
    const r = buildResultado(EXEMPLO)
    if (r) { setResultado(r); setError("") }
  }

  function salvarNaBiblioteca() {
    if (!resultado) return
    const progressionStr = resultado.degrees.map((d) => d.chord.original).join(" | ")
    const key = resultado.selectedKey.label
    const entry = { progression: progressionStr, key, date: new Date().toISOString() }
    const existing = JSON.parse(localStorage.getItem("savedProgressions") ?? "[]")
    existing.push(entry)
    localStorage.setItem("savedProgressions", JSON.stringify(existing))
    setSaved(true)
  }

  const conf = resultado
    ? confidence(resultado.selectedKey, resultado.minScore, resultado.maxScore)
    : 0

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) analisar()
          }}
          placeholder={"Cole sua progressão de acordes aqui...\nExemplo: Am F C G7"}
          rows={5}
          className="w-full bg-[#120d24] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
        />
        {error && <p className="text-rose-400 text-sm">{error}</p>}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={analisar}
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Analisar
          </button>
          <button
            onClick={carregarExemplo}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Carregar exemplo
          </button>
          <span className="text-slate-600 text-xs">Ctrl+Enter para analisar</span>
        </div>
      </div>

      {resultado && (
        <div className="space-y-5">
          {/* Tonalidade */}
          <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm text-slate-400">Tonalidade detectada</h2>
              <span className="text-xs text-slate-500">
                Confiança:{" "}
                <span className={conf >= 70 ? "text-emerald-400" : conf >= 40 ? "text-amber-400" : "text-rose-400"}>
                  {conf}%
                </span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {resultado.keys.slice(0, 6).map((k) => {
                const c = confidence(k, resultado.minScore, resultado.maxScore)
                const active = k.root === resultado.selectedKey.root && k.mode === resultado.selectedKey.mode
                return (
                  <button
                    key={`${k.root}${k.mode}`}
                    onClick={() => selectKey(k)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      active
                        ? "bg-violet-600 text-white"
                        : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {k.label}
                    <span className="text-xs opacity-60">{c}%</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Graus */}
          <div className="bg-[#120d24] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5">
              <h2 className="text-sm text-slate-400">
                Graus em{" "}
                <span className="text-violet-300 font-medium">{resultado.selectedKey.label}</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-2.5 text-left text-xs text-slate-500 font-medium w-1/3">Acorde</th>
                    <th className="px-4 py-2.5 text-left text-xs text-slate-500 font-medium w-1/4">Grau</th>
                    <th className="px-4 py-2.5 text-left text-xs text-slate-500 font-medium">Função</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.degrees.map((d, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 font-mono text-violet-300 font-semibold">
                        {d.chord.original}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-white font-bold">{d.degree}</td>
                      <td
                        className={`px-4 py-2.5 text-xs ${
                          d.diatonic ? "text-slate-400" : "text-amber-400"
                        }`}
                      >
                        {d.fn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cadências */}
          {resultado.cadences.length > 0 && (
            <div className="bg-[#120d24] border border-white/5 rounded-2xl p-5">
              <h2 className="text-sm text-slate-400 mb-3">Cadências detectadas</h2>
              <ul className="space-y-2">
                {resultado.cadences.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-violet-400 text-xs mt-0.5 flex-shrink-0">→</span>
                    <div>
                      <span className="text-white font-mono text-sm font-medium">
                        {c.chords.join(" – ")}
                      </span>
                      <span className="text-slate-500 text-xs ml-2">{c.label}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resultado.cadences.length === 0 && resultado.degrees.length > 0 && (
            <p className="text-slate-600 text-sm">
              Nenhuma cadência clássica detectada nessa sequência.
            </p>
          )}

          {/* Salvar na biblioteca */}
          <div className="flex items-center gap-3">
            <button
              onClick={salvarNaBiblioteca}
              disabled={saved}
              className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors ${
                saved
                  ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                  : "bg-[#120d24] border border-white/10 text-slate-300 hover:border-violet-500/30 hover:text-violet-300"
              }`}
            >
              {saved ? "✓ Salvo na Biblioteca" : "Salvar na Biblioteca"}
            </button>
            {saved && (
              <button
                onClick={() => router.push("/biblioteca")}
                className="text-xs text-violet-300 hover:text-violet-200 transition-colors"
              >
                Ver na Biblioteca →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
