import { prisma } from "./db"

export interface PartituraMatch {
  id: string
  artista: string
  postTitulo: string
  postUrl: string
}

/**
 * Busca no índice de partituras por título e artista.
 * Retorna o match mais relevante ou null.
 */
export async function searchPartituraIndex(
  titulo: string,
  artista: string
): Promise<PartituraMatch | null> {
  // Extrair palavras significativas do título (>3 chars)
  const tituloWords = titulo
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)

  if (tituloWords.length === 0) return null

  // Tentar match no postTitulo (que contém artista + músicas do post)
  const candidates = await prisma.partituraIndex.findMany({
    where: {
      OR: [
        // Primeiro palavra significativa do título
        { postTitulo: { contains: tituloWords[0] } },
        // Segunda palavra se existir
        ...(tituloWords[1]
          ? [{ postTitulo: { contains: tituloWords[1] } }]
          : []),
        // Artista (primeiros 8 chars para tolerar variações)
        { artista: { contains: artista.substring(0, 8) } },
      ],
    },
    take: 10,
  })

  if (candidates.length === 0) return null

  // Ranquear: priorizar matches que contêm mais palavras do título
  const ranked = candidates
    .map((c) => {
      const text = (c.postTitulo + " " + c.artista).toLowerCase()
      const score = tituloWords.filter((w) => text.includes(w)).length
      return { ...c, score }
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)

  return ranked[0] ?? null
}
