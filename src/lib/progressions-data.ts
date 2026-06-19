import data from "./progressions-data.json"

export interface AcordeGrau {
  acorde: string
  grau: string
}

export interface MusicaProgressao {
  titulo: string
  artista: string
  tom: string
  key_detected: string
  acordes_reais: string[]
  todos_acordes: string
  graus_completos: string[]
  acordes_graus: AcordeGrau[]
}

export interface Progressao {
  slug: string
  nome: string
  graus: string[]
  tipo: string
  descricao: string
  musicas: MusicaProgressao[]
}

export const PROGRESSOES: Progressao[] = data as Progressao[]

export function getProgressao(slug: string): Progressao | undefined {
  return PROGRESSOES.find((p) => p.slug === slug)
}
