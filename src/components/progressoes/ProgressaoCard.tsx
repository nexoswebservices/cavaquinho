import Link from "next/link"
import type { Progressao } from "@/lib/progressions-data"

const TIPO_COLORS: Record<string, string> = {
  Fundamental: "bg-emerald-600/20 text-emerald-300 border-emerald-500/20",
  "Intermediária": "bg-sky-600/20 text-sky-300 border-sky-500/20",
  "Com Dom. Secundária": "bg-amber-600/20 text-amber-300 border-amber-500/20",
  "Dom. Secundárias": "bg-orange-600/20 text-orange-300 border-orange-500/20",
  "Avançada": "bg-rose-600/20 text-rose-300 border-rose-500/20",
}

const DEGREE_COLOR: Record<string, string> = {
  I: "bg-violet-500/25 border-violet-400/40 text-violet-200",
  I7: "bg-violet-500/20 border-violet-400/30 text-violet-200",
  ii: "bg-sky-500/20 border-sky-400/40 text-sky-200",
  iii: "bg-teal-500/20 border-teal-400/40 text-teal-200",
  IV: "bg-cyan-500/25 border-cyan-400/40 text-cyan-200",
  iv: "bg-cyan-500/20 border-cyan-400/30 text-cyan-200",
  V: "bg-amber-500/20 border-amber-400/40 text-amber-200",
  V7: "bg-amber-500/25 border-amber-400/50 text-amber-200",
  v: "bg-amber-500/15 border-amber-400/30 text-amber-200",
  vi: "bg-emerald-500/20 border-emerald-400/40 text-emerald-200",
  VI: "bg-emerald-500/20 border-emerald-400/40 text-emerald-200",
  vii: "bg-rose-500/20 border-rose-400/30 text-rose-200",
  "viiø": "bg-rose-500/20 border-rose-400/30 text-rose-200",
  VII: "bg-rose-500/20 border-rose-400/30 text-rose-200",
}

function grauColor(g: string): string {
  if (g.startsWith("V7/")) return "bg-orange-500/20 border-orange-400/40 text-orange-200"
  return DEGREE_COLOR[g] ?? "bg-slate-500/15 border-slate-400/30 text-slate-300"
}

// ── Chord calculation (default key = C) ──

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11]
const NORM: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" }
const FLAT_DISPLAY: Record<string, string> = { "A#": "Bb", "D#": "Eb", "G#": "Ab" }
const FLAT_KEYS = new Set(["F", "A#", "D#", "G#", "C#", "F#"])

function noteAt(root: string, semitones: number): string {
  const r = NORM[root] ?? root
  const idx = CHROMATIC.indexOf(r)
  if (idx === -1) return root
  const n = CHROMATIC[(idx + semitones) % 12]
  if (FLAT_KEYS.has(r) && FLAT_DISPLAY[n]) return FLAT_DISPLAY[n]
  return n
}

function scaleNote(root: string, degree: number): string {
  return noteAt(root, MAJOR_INTERVALS[degree])
}

interface ChordInfo {
  name: string
  notes: string[]
}

const DEGREE_MAP: Record<string, [number, string, number[]]> = {
  I:      [0, "",   [0, 4, 7]],
  I7:     [0, "7",  [0, 4, 7, 10]],
  i:      [0, "m",  [0, 3, 7]],
  ii:     [1, "m",  [0, 3, 7]],
  iii:    [2, "m",  [0, 3, 7]],
  III:    [2, "",   [0, 4, 7]],
  IV:     [3, "",   [0, 4, 7]],
  iv:     [3, "m",  [0, 3, 7]],
  V:      [4, "",   [0, 4, 7]],
  V7:     [4, "7",  [0, 4, 7, 10]],
  v:      [4, "m",  [0, 3, 7]],
  vi:     [5, "m",  [0, 3, 7]],
  VI:     [5, "",   [0, 4, 7]],
  vii:    [6, "m",  [0, 3, 7]],
  "viiø": [6, "m7(5-)", [0, 3, 6, 10]],
  VII:    [6, "",   [0, 4, 7]],
}

function degreeToChordInfo(grau: string, root: string): ChordInfo {
  const r = NORM[root] ?? root

  // V7/x — secondary dominant
  const secMatch = grau.match(/^V7?\/(vi|ii|iii|iv|IV|V|I)/)
  if (secMatch) {
    const targetMap: Record<string, number> = { I: 0, ii: 1, iii: 2, IV: 3, iv: 3, V: 4, vi: 5 }
    const tIdx = targetMap[secMatch[1]]
    if (tIdx !== undefined) {
      const targetNote = scaleNote(r, tIdx)
      const domRoot = noteAt(targetNote, 7)
      return {
        name: domRoot + "7",
        notes: [0, 4, 7, 10].map((s) => noteAt(domRoot, s)),
      }
    }
  }

  const entry = DEGREE_MAP[grau]
  if (entry) {
    const [degIdx, suffix, intervals] = entry
    const chordRoot = scaleNote(r, degIdx)
    return {
      name: chordRoot + suffix,
      notes: intervals.map((s) => noteAt(chordRoot, s)),
    }
  }

  return { name: grau, notes: [] }
}

const DEFAULT_KEY = "C"

export function ProgressaoCard({ progressao }: { progressao: Progressao }) {
  const tipoColor = TIPO_COLORS[progressao.tipo] ?? TIPO_COLORS["Fundamental"]
  const chords = progressao.graus.map((g) => degreeToChordInfo(g, DEFAULT_KEY))

  return (
    <Link
      href={`/progressoes/${progressao.slug}`}
      className="block bg-[#120d24] border border-white/5 hover:border-violet-500/30 rounded-2xl p-6 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold font-mono text-white group-hover:text-violet-300 transition-colors">
          {progressao.nome}
        </h2>
        <span className={`text-xs border px-2.5 py-1 rounded-full flex-shrink-0 ${tipoColor}`}>
          {progressao.tipo}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {progressao.graus.map((g, i) => {
          const chord = chords[i]
          return (
            <div
              key={i}
              className={`border rounded-xl px-3 py-2 text-center min-w-[3.5rem] ${grauColor(g)}`}
            >
              <p className="text-[10px] opacity-60 leading-tight">{g}</p>
              <p className="text-sm font-bold font-mono leading-tight my-0.5">{chord.name}</p>
              {chord.notes.length > 0 && (
                <p className="text-[10px] opacity-50 font-mono leading-tight">
                  {chord.notes.join(" ")}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
        {progressao.descricao}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {progressao.musicas.length} {progressao.musicas.length === 1 ? "música" : "músicas"} • Em C maior
        </span>
        <span className="text-xs text-violet-400 group-hover:text-violet-300 transition-colors">
          Ver músicas →
        </span>
      </div>
    </Link>
  )
}
