// Parser da tablatura numérica ("cavaco por números") usada em posts "solo"
// do nandinhocavaco.com.br: sequências de códigos de 2 dígitos "XY" = corda X
// (1=D5 mais aguda ... 4=D4 mais grave, mesma convenção de STRING_LABELS em
// PartituraCompleta.tsx) + traste Y, impressas em linhas separadas,
// intercaladas com a letra da música. Não tem imagem de pauta nenhuma —
// é texto puro, então dá pra extrair com 100% de certeza (sem Vision/IA).
//
// Validado manualmente contra "Cartola - As Rosas Não Falam": a sequência
// decodificada (G4-A4-A#4-C5-C#5-D5, cromática ascendente) é musicalmente
// coerente com o tom Dm da cifra real do CifraClub pra essa mesma música.

const TUNING_MIDI = [74, 71, 67, 62] // D5, B4, G4, D4 — corda 1..4
const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const MAX_FRET = 12

function midiToNoteOctave(midi: number): { note: string; octave: number } {
  return { note: CHROMATIC[midi % 12], octave: Math.floor(midi / 12) - 1 }
}

export interface NotaTabEvento {
  nota: string
  octave: number
  string: number
  fret: number
}

export interface MedidaTabNumerico {
  letra: string
  eventos: NotaTabEvento[]
}

// Mínimo de linhas numéricas pra considerar que o post realmente usa esse
// formato (evita falso positivo em posts que só têm números soltos em outro
// contexto, ex: ano de lançamento, número de página).
const MIN_LINHAS_NUMERICAS = 6

/**
 * Tenta extrair a tablatura numérica do HTML de um post do nandinhocavaco.
 * Retorna null se o post não usa esse formato (nesse caso, o caller deve
 * cair pro caminho de imagem/Vision).
 */
export function parseNumericTabPost(html: string): MedidaTabNumerico[] | null {
  const idx = html.indexOf("entry-content")
  if (idx < 0) return null
  const raw = html.slice(idx, idx + 40000)

  const linhas = raw
    .split(/<[^>]+>/)
    .map((s) => s.replace(/&nbsp;/g, " ").trim())
    .filter((s) => s.length > 0 && !s.startsWith("var ") && !s.includes("currentposturl"))

  const isLinhaNumerica = (s: string) => /^(\d{2}\s*)+$/.test(s.replace(/\s+/g, " ").trim())
  const totalNumericas = linhas.filter(isLinhaNumerica).length
  if (totalNumericas < MIN_LINHAS_NUMERICAS) return null

  const medidas: MedidaTabNumerico[] = []

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i]
    if (!isLinhaNumerica(linha)) continue

    const codigos = linha.match(/\d{2}/g) ?? []
    const letra = linhas[i + 1] && !isLinhaNumerica(linhas[i + 1]) ? linhas[i + 1] : ""

    const eventos: NotaTabEvento[] = []
    for (const cod of codigos) {
      const corda = parseInt(cod[0], 10)
      const fret = parseInt(cod[1], 10)
      if (corda < 1 || corda > 4 || fret < 0 || fret > MAX_FRET) continue
      const midi = TUNING_MIDI[corda - 1] + fret
      const { note, octave } = midiToNoteOctave(midi)
      eventos.push({ nota: note, octave, string: corda, fret })
    }
    if (eventos.length > 0) medidas.push({ letra, eventos })
  }

  return medidas.length >= 3 ? medidas : null
}

// Escolhe uma duração VexFlow razoável pra encaixar N notas num compasso de
// 4 tempos. O renderer (PartituraCompleta.tsx) usa Voice.Mode.SOFT — não
// exige que a soma bata exatamente, então essa é só uma aproximação visual
// razoável, não uma transcrição rítmica exata (a fonte numérica não informa
// duração, só a sequência de notas).
export function duracaoParaQuantidade(n: number): string {
  if (n <= 1) return "w"
  if (n <= 2) return "h"
  if (n <= 4) return "q"
  return "8"
}
