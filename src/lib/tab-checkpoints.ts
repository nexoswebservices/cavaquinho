// Checkpoints de validação de acordes/tab, compartilhados entre as fontes de
// geração (partitura via Vision e cifra via CifraClub) na rota /process.
import { parseChordSymbol, chordToTab, chordToNotes, notaParaCordaTraste } from "./cavaquinho-tab"
import type { ChordWithLyric } from "./cifraclub-scraper"
import { duracaoParaQuantidade, type MedidaTabNumerico } from "./nandinho-numeric-tab"

export interface AcordeMedida {
  batida: number
  acorde: string
  duration: string
  notas: string[]
  tab: number[]
}

// Medida "de cifra": um shape de acorde batido por medida — usado quando a
// fonte é CifraClub/Cifras.com.br (nunca finge ler melodia de verdade).
export interface Medida {
  numero: number
  letra: string
  acordes: AcordeMedida[]
}

// Nota individual de uma medida "de partitura" — leitura nota-a-nota de
// verdade (via tablatura numérica de texto do nandinhocavaco, ou futuramente
// via Vision lendo o pentagrama), não um shape de acorde inteiro.
export interface NotaEvento {
  duration: string
  nota?: string
  octave?: number
  string?: number
  fret?: number
}

// Medida "de partitura": sequência de notas reais + uma cifra de referência
// opcional (rótulo harmônico, não uma instrução de "toque este shape aqui").
export interface MedidaEventos {
  numero: number
  letra: string
  acordeReferencia?: string
  eventos: NotaEvento[]
}

// Checkpoint: o acorde existe no dicionário de fórmulas?
export function validarAcorde(chord: string): boolean {
  return parseChordSymbol(chord) !== null
}

// Checkpoint: o acorde converte em tab com trastes 0–12?
export function acordeParaTab(chord: string): number[] | null {
  if (!validarAcorde(chord)) return null
  const tab = chordToTab(chord)
  if (tab.some((f) => f < 0 || f > 12)) return null
  return tab
}

// Caminho da cifra (CifraClub/Cifras.com.br): 1 acorde por medida.
export function buildMedidasFromChordList(chords: ChordWithLyric[]): Medida[] | null {
  const acordesValidos = chords.filter((cwl) => validarAcorde(cwl.chord))
  if (acordesValidos.length < 3) return null

  const medidas = acordesValidos
    .map((cwl, i): Medida | null => {
      const tab = acordeParaTab(cwl.chord)
      if (!tab) return null
      return {
        numero: i + 1,
        letra: cwl.lyric || "",
        acordes: [{ batida: 1, acorde: cwl.chord, duration: "w", notas: chordToNotes(cwl.chord), tab }],
      }
    })
    .filter((m): m is Medida => m !== null)

  return medidas.length >= 3 ? medidas : null
}

// Caminho da partitura via tablatura numérica de texto (nandinhocavaco,
// posts "solo"): já são notas de verdade, sem chance de alucinação — só
// precisa virar o formato de Medida e escolher uma duração aproximada por
// nota (a fonte numérica não informa ritmo, só a sequência de alturas).
export function buildMedidasFromNumericTab(blocos: MedidaTabNumerico[]): MedidaEventos[] | null {
  const medidas: MedidaEventos[] = blocos.map((bloco, i) => {
    const duration = duracaoParaQuantidade(bloco.eventos.length)
    return {
      numero: i + 1,
      letra: bloco.letra,
      eventos: bloco.eventos.map((e) => ({
        duration,
        nota: e.nota,
        octave: e.octave,
        string: e.string,
        fret: e.fret,
      })),
    }
  })
  return medidas.length >= 3 ? medidas : null
}

// Checkpoint: a nota existe e a oitava é plausível pra um cavaquinho (2–7)?
function validarNota(nota: unknown, octave: unknown): nota is string {
  if (typeof nota !== "string" || typeof octave !== "number") return false
  if (!/^[A-G][#b]?$/.test(nota)) return false
  return octave >= 2 && octave <= 7
}

// Caminho da partitura via Vision lendo o pentagrama de verdade: cada medida
// já vem como sequência de notas reais (não placeholders). Valida cada nota
// e calcula a posição de corda/traste tocável (a Vision só lê pitch+duração,
// não sabe de tablatura), preferindo ficar perto da nota anterior pra gerar
// uma tab que faça sentido de mão. Descarta notas inválidas; medidas sem
// nenhuma nota válida são removidas. A cifra de referência (se houver) só é
// mantida se for um símbolo reconhecido — senão vira só uma medida sem rótulo,
// não descarta as notas.
export function validateVisionMedidas(raw: unknown): MedidaEventos[] | null {
  if (!raw || typeof raw !== "object" || raw === null) return null
  if ((raw as { temPartitura?: boolean }).temPartitura === false) return null
  if (!Array.isArray((raw as { medidas?: unknown }).medidas)) return null

  const medidasRaw = (raw as { medidas: unknown[] }).medidas
  let posicaoAnterior: { string: number; fret: number } | undefined

  const medidas = medidasRaw
    .map((m, i): MedidaEventos | null => {
      if (!m || typeof m !== "object") return null
      const medida = m as { letra?: string; acordeReferencia?: string; eventos?: unknown[] }
      const eventosRaw = Array.isArray(medida.eventos) ? medida.eventos : []

      const eventos = eventosRaw
        .map((e): NotaEvento | null => {
          if (!e || typeof e !== "object") return null
          const ev = e as { nota?: string; octave?: number; duration?: string }
          if (!validarNota(ev.nota, ev.octave)) return null
          const pos = notaParaCordaTraste(ev.nota, ev.octave as number, posicaoAnterior)
          if (!pos) return null
          posicaoAnterior = pos
          return { duration: ev.duration ?? "q", nota: ev.nota, octave: ev.octave, string: pos.string, fret: pos.fret }
        })
        .filter((e): e is NotaEvento => e !== null)

      if (eventos.length === 0) return null

      const acordeReferencia =
        typeof medida.acordeReferencia === "string" && validarAcorde(medida.acordeReferencia)
          ? medida.acordeReferencia
          : undefined

      return { numero: i + 1, letra: medida.letra ?? "", acordeReferencia, eventos }
    })
    .filter((m): m is MedidaEventos => m !== null)

  return medidas.length >= 4 ? medidas : null
}
