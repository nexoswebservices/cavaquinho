import { prisma } from "./db"

export interface PartituraMatch {
  id: string
  artista: string
  postTitulo: string
  postUrl: string
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
}

/**
 * Busca no índice de partituras por título e artista.
 * Retorna o match mais relevante ou null.
 */
export async function searchPartituraIndex(
  titulo: string,
  artista: string
): Promise<PartituraMatch | null> {
  // Extrair palavras significativas do título (>3 chars), sem pontuação
  const tituloWords = titulo
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^\wáéíóúàèìòùãõâêîôûäëïöüçñ]/g, ""))
    .filter((w) => w.length > 3)

  if (tituloWords.length === 0) return null

  // Versão sem acentos para queries LIKE (MySQL pode ser accent-sensitive)
  const tituloWordsNorm = tituloWords.map(stripAccents)

  const candidates = await prisma.partituraIndex.findMany({
    where: {
      OR: [
        ...tituloWordsNorm.map((w) => ({ postTitulo: { contains: w } })),
        { artista: { contains: artista.substring(0, 8) } },
      ],
    },
    take: 50,
  })

  if (candidates.length === 0) return null

  // Ranqueia por palavras do título encontradas SÓ no postTitulo (não no
  // nome do artista — se contasse o artista, qualquer outra música do mesmo
  // artista no índice bateria com o nome dele e podia vencer por engano).
  // Exige pelo menos 2 palavras (ou todas, se o título só tiver 1) pra
  // aceitar o match, senão um único termo genérico compartilhado ("vivo",
  // "amor"...) confiaria numa música errada.
  const minScore = Math.min(2, tituloWordsNorm.length)
  const ranked = candidates
    .map((c) => {
      const text = stripAccents(c.postTitulo.toLowerCase())
      const score = tituloWordsNorm.filter((w) => text.includes(w)).length
      return { ...c, score }
    })
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score)

  return ranked[0] ?? null
}
