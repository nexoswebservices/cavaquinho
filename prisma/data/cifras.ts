import cifrasJson from "./cifras.json"

export interface CifraSeed {
  titulo: string
  artista: string | null
  tom: string | null
  conteudo: string
  progressao: string | null
}

export const CIFRAS = cifrasJson as CifraSeed[]
