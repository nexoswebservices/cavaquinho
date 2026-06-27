"use client"

import { useState, useCallback } from "react"
import { PartituraView } from "@/components/partitura/PartituraView"
import { TablaturaView } from "@/components/partitura/TablaturaView"
import { BracoCavaquinho } from "@/components/progressoes/BracoCavaquinho"
import { initSampler, isReady, playNote } from "@/lib/sampler"
import type { NoteData } from "@/components/partitura/PartituraView"

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const TUNING_MIDI = [62, 67, 71, 74]

const EXERCICIOS = [
  { id: "identificar", label: "Identificar Nota", descricao: "Veja a nota no pentagrama e diga qual é" },
  { id: "posicao", label: "Encontrar no Braço", descricao: "Veja a nota e encontre a posição no cavaquinho" },
  { id: "melodia", label: "Ler Melodia", descricao: "Leia uma sequência de notas e ouça" },
]

type Nivel = "iniciante" | "intermediario" | "avancado"

const NOTAS_POR_NIVEL: Record<Nivel, { note: string; octave: number; name: string }[]> = {
  iniciante: [
    { note: "D", octave: 4, name: "Ré" }, { note: "E", octave: 4, name: "Mi" },
    { note: "F", octave: 4, name: "Fá" }, { note: "G", octave: 4, name: "Sol" },
    { note: "A", octave: 4, name: "Lá" }, { note: "B", octave: 4, name: "Si" },
    { note: "C", octave: 5, name: "Dó" },
  ],
  intermediario: [
    { note: "C", octave: 4, name: "Dó" }, { note: "D", octave: 4, name: "Ré" },
    { note: "E", octave: 4, name: "Mi" }, { note: "F", octave: 4, name: "Fá" },
    { note: "F#", octave: 4, name: "Fá#" }, { note: "G", octave: 4, name: "Sol" },
    { note: "A", octave: 4, name: "Lá" }, { note: "A#", octave: 4, name: "Sib" },
    { note: "B", octave: 4, name: "Si" }, { note: "C", octave: 5, name: "Dó5" },
    { note: "D", octave: 5, name: "Ré5" },
  ],
  avancado: [
    { note: "C", octave: 4, name: "Dó4" }, { note: "C#", octave: 4, name: "Dó#4" },
    { note: "D", octave: 4, name: "Ré4" }, { note: "D#", octave: 4, name: "Ré#4" },
    { note: "E", octave: 4, name: "Mi4" }, { note: "F", octave: 4, name: "Fá4" },
    { note: "F#", octave: 4, name: "Fá#4" }, { note: "G", octave: 4, name: "Sol4" },
    { note: "G#", octave: 4, name: "Sol#4" }, { note: "A", octave: 4, name: "Lá4" },
    { note: "A#", octave: 4, name: "Sib4" }, { note: "B", octave: 4, name: "Si4" },
    { note: "C", octave: 5, name: "Dó5" }, { note: "D", octave: 5, name: "Ré5" },
    { note: "E", octave: 5, name: "Mi5" },
  ],
}

function randomNotes(nivel: Nivel, count: number): typeof NOTAS_POR_NIVEL["iniciante"] {
  const pool = NOTAS_POR_NIVEL[nivel]
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(pool[Math.floor(Math.random() * pool.length)])
  }
  return result
}

function findOnFretboard(note: string): { string: number; fret: number } {
  const noteIdx = CHROMATIC.indexOf(note)
  for (let s = 0; s <= 3; s++) {
    for (let f = 0; f <= 7; f++) {
      if ((TUNING_MIDI[s] + f) % 12 === noteIdx) return { string: s + 1, fret: f }
    }
  }
  return { string: 1, fret: 0 }
}

export function ExercicioLeitura() {
  const [exercicio, setExercicio] = useState("melodia")
  const [nivel, setNivel] = useState<Nivel>("iniciante")
  const [melodia, setMelodia] = useState(() => randomNotes("iniciante", 8))
  const [revealed, setRevealed] = useState(false)

  const handleNew = useCallback(() => {
    setMelodia(randomNotes(nivel, exercicio === "melodia" ? 8 : 1))
    setRevealed(false)
  }, [nivel, exercicio])

  const handlePlay = useCallback(async () => {
    if (!isReady()) await initSampler()
    melodia.forEach((n, i) => {
      setTimeout(() => playNote(n.note, n.octave), i * 500)
    })
  }, [melodia])

  const partNotes: NoteData[] = melodia.map((n) => ({
    note: n.note.replace("#", ""),
    octave: n.octave,
    duration: "q",
    accidental: n.note.includes("#") ? "#" as const : undefined,
  }))

  const tabNotes = melodia.map((n) => findOnFretboard(n.note))

  return (
    <div className="space-y-6">
      {/* Tipo de exercício */}
      <div className="flex flex-wrap gap-1.5">
        {EXERCICIOS.map((ex) => (
          <button
            key={ex.id}
            onClick={() => { setExercicio(ex.id); handleNew() }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              exercicio === ex.id ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Nível */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Nível</span>
        {(["iniciante", "intermediario", "avancado"] as Nivel[]).map((n) => (
          <button
            key={n}
            onClick={() => { setNivel(n); handleNew() }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              nivel === n ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {n === "iniciante" ? "Iniciante" : n === "intermediario" ? "Intermediário" : "Avançado"}
          </button>
        ))}
      </div>

      <p className="text-slate-400 text-sm">
        {EXERCICIOS.find((e) => e.id === exercicio)?.descricao}
      </p>

      {/* Partitura */}
      <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-6 space-y-4">
        <div className="bg-[#0a0714] border border-white/5 rounded-xl p-4 space-y-0">
          <PartituraView notes={partNotes} />
          {revealed && <TablaturaView notes={tabNotes} />}
        </div>

        {/* Braço (para exercício de posição) */}
        {exercicio === "posicao" && revealed && (
          <div className="flex justify-center">
            <BracoCavaquinho chordNotes={melodia.map((n) => n.note)} voicingIndex={0} />
          </div>
        )}

        {/* Notas reveladas */}
        {revealed && (
          <div className="flex flex-wrap gap-2">
            {melodia.map((n, i) => (
              <span key={i} className="bg-violet-500/15 border border-violet-400/30 text-violet-200 font-mono text-sm font-bold px-3 py-1 rounded-lg">
                {n.name}
              </span>
            ))}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3">
          <button
            onClick={handlePlay}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
          >
            ▶ Ouvir
          </button>
          <button
            onClick={() => setRevealed(true)}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            Revelar Resposta
          </button>
          <button
            onClick={handleNew}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            Novo Exercício
          </button>
        </div>
      </div>
    </div>
  )
}
