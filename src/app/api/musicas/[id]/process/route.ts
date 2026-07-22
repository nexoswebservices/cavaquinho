import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { searchPartituraIndex } from "@/lib/partitura-search"
import { fetchPartituraImageUrls, extractTabFromPartituraImage } from "@/lib/partitura-vision"
import { getCifraclubChords, cleanTitulo } from "@/lib/cifraclub-scraper"
import { buildMedidasFromChordList, validateVisionMedidas } from "@/lib/tab-checkpoints"

export const maxDuration = 60

// Faz o trabalho pesado de gerar a tab: busca a partitura oficial primeiro
// (fonte sem erro de interpretação, lida via Vision) e só cai pra cifra
// (CifraClub) se nenhuma partitura validar. Chamado pelo cliente logo após
// /generate criar a linha "pendente" — assim tem seu próprio orçamento de
// ~60s (teto do plano Hobby da Vercel), independente da requisição original.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const estudo = await prisma.estudo.findUnique({ where: { id: params.id } })
  if (!estudo) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

  // Idempotente: se outra chamada (outra aba, novo poll) já pegou essa
  // música, não reprocessa.
  if (estudo.status !== "pendente") {
    return NextResponse.json({ status: estudo.status })
  }

  await prisma.estudo.update({ where: { id: estudo.id }, data: { status: "processando" } })

  const { titulo, artista } = estudo
  // O título bruto do YouTube inclui o nome do artista antes do hífen
  // ("Grupo Menos É Mais, NATTAN - Pela Última Vez") — se passarmos isso
  // direto pra busca de partitura, palavras do NOME DO ARTISTA batem com
  // qualquer outra música do mesmo artista no índice e a busca pode
  // confiantemente devolver a música errada. Usa só o título da música.
  const tituloMusica = cleanTitulo(titulo)

  try {
    // 1) Partitura oficial primeiro
    const indexMatch = await searchPartituraIndex(tituloMusica, artista)

    if (indexMatch) {
      const imageUrls = await fetchPartituraImageUrls(indexMatch.postUrl)
      const candidatos = imageUrls.slice(0, 4)

      // Em paralelo — a versão antiga (2026-07-09) tentava uma imagem de cada
      // vez com await sequencial e estourava os 60s do serverless.
      const resultados = await Promise.allSettled(
        candidatos.map((url) => extractTabFromPartituraImage(url, tituloMusica, artista))
      )

      for (const r of resultados) {
        if (r.status !== "fulfilled" || !r.value) continue
        const medidas = validateVisionMedidas(r.value)
        if (!medidas) continue

        const tom = typeof r.value.tom === "string" ? r.value.tom : "C"
        const bpm = typeof r.value.bpm === "number" ? r.value.bpm : 90
        const compasso = typeof r.value.compasso === "string" ? r.value.compasso : "4/4"

        await prisma.estudo.update({
          where: { id: estudo.id },
          data: {
            status: "pronto",
            fonte: "partitura",
            tom,
            bpm,
            compasso,
            tabData: { medidas, partituraUrl: indexMatch.postUrl } as unknown as Prisma.InputJsonValue,
          },
        })
        return NextResponse.json({ status: "pronto", fonte: "partitura" })
      }
    }

    // 2) Nenhuma partitura validou: cai pra cifra — sem expor o site de
    // origem em nenhum campo lido pela UI.
    const cifraResult = await getCifraclubChords(artista, titulo)
    if (cifraResult) {
      const medidas = buildMedidasFromChordList(cifraResult.chords)
      if (medidas) {
        await prisma.estudo.update({
          where: { id: estudo.id },
          data: {
            status: "pronto",
            fonte: "cifra",
            tom: cifraResult.tom,
            bpm: cifraResult.bpm,
            compasso: "4/4",
            tabData: { medidas } as unknown as Prisma.InputJsonValue,
          },
        })
        return NextResponse.json({ status: "pronto", fonte: "cifra" })
      }
    }

    // 3) Nada validou
    await prisma.estudo.update({
      where: { id: estudo.id },
      data: { status: "falhou", erro: "Não encontramos partitura nem cifra para essa música ainda." },
    })
    return NextResponse.json({ status: "falhou" })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[process] erro:", msg)
    await prisma.estudo.update({
      where: { id: estudo.id },
      data: { status: "falhou", erro: "Erro ao processar a música." },
    })
    return NextResponse.json({ status: "falhou" }, { status: 500 })
  }
}
