// Checkpoints de validação de acordes/tab, compartilhados entre as fontes de
// geração (partitura via Vision e cifra via CifraClub) na rota /process.
import { parseChordSymbol, chordToTab, chordToNotes } from "./cavaquinho-tab"
import type { ChordWithLyric } from "./cifraclub-scraper"

export interface AcordeMedida {
  batida: number
  acorde: string
  duration: string
  notas: string[]
  tab: number[]
}

export interface Medida {
  numero: number
  letra: string
  acordes: AcordeMedida[]
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

// Caminho da partitura (Vision): já vem agrupado em medidas com 1+ acordes cada.
// Recalcula o tab de verdade (a Vision só manda placeholder) e descarta acordes
// inválidos; medidas que ficarem sem nenhum acorde válido são removidas.
export function validateVisionMedidas(raw: unknown): Medida[] | null {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { medidas?: unknown }).medidas)) {
    return null
  }

  const medidasRaw = (raw as { medidas: unknown[] }).medidas

  const medidas = medidasRaw
    .map((m, i) => {
      if (!m || typeof m !== "object") return null
      const medida = m as { letra?: string; acordes?: unknown[] }
      const acordesRaw = Array.isArray(medida.acordes) ? medida.acordes : []

      const acordes = acordesRaw
        .map((a): AcordeMedida | null => {
          if (!a || typeof a !== "object") return null
          const ac = a as { batida?: number; acorde?: string; duration?: string }
          if (!ac.acorde) return null
          const tab = acordeParaTab(ac.acorde)
          if (!tab) return null
          return {
            batida: ac.batida ?? 1,
            acorde: ac.acorde,
            duration: ac.duration ?? "w",
            notas: chordToNotes(ac.acorde),
            tab,
          }
        })
        .filter((a): a is AcordeMedida => a !== null)

      if (acordes.length === 0) return null
      return { numero: i + 1, letra: medida.letra ?? "", acordes } as Medida
    })
    .filter((m): m is Medida => m !== null)

  return medidas.length >= 4 ? medidas : null
}
