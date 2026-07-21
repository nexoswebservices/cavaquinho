import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { searchPartituraIndex } from "@/lib/partitura-search"
import { getCifraclubChords } from "@/lib/cifraclub-scraper"
import { fetchLetra } from "@/lib/letras-scraper"
import { chordToTab, parseChordSymbol } from "@/lib/cavaquinho-tab"

export const maxDuration = 60

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
    /youtube\.com\/shorts\/([^?&#]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

// Checkpoint 1: valida que o acorde existe no dicionário
function validarAcorde(chord: string): boolean {
  return parseChordSymbol(chord) !== null
}

// Checkpoint 2: converte acorde validado em tab, verifica frets 0-12
function acordeParaTab(chord: string): number[] | null {
  const parsed = parseChordSymbol(chord)
  if (!parsed) return null
  const tab = chordToTab(chord)
  if (tab.some((f) => f < 0 || f > 12)) return null
  return tab
}

export async function POST(req: NextRequest) {
  try {
    const { url, force } = await req.json()
    if (!url) return NextResponse.json({ error: "URL obrigatória" }, { status: 400 })

    const youtubeId = extractYoutubeId(url)
    if (!youtubeId) return NextResponse.json({ error: "URL do YouTube inválida" }, { status: 400 })

    // Cache hit
    const existing = await prisma.estudo.findUnique({ where: { youtubeId } })
    if (existing) {
      if (!force) return NextResponse.json({ id: existing.id, cached: true })
      await prisma.estudo.delete({ where: { id: existing.id } })
    }

    // oEmbed: título + artista
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://youtu.be/${youtubeId}&format=json`
    )
    if (!oembedRes.ok) return NextResponse.json({ error: "Vídeo não encontrado" }, { status: 404 })
    const oembed = await oembedRes.json()
    const titulo = oembed.title as string
    const artista = (oembed.author_name as string).replace(/ - Topic$/, "")

    console.log(`[generate] título: "${titulo}" | artista: "${artista}"`)

    // Buscar em paralelo: cifraclub + partitura index + letra
    const [cifraResult, indexMatch, letraResult] = await Promise.all([
      getCifraclubChords(artista, titulo),
      searchPartituraIndex(titulo, artista),
      fetchLetra(artista, titulo),
    ])

    // CHECKPOINT 1: precisa ter cifra em texto
    if (!cifraResult) {
      console.log(`[generate] cifraclub: não encontrado`)
      return NextResponse.json(
        { error: "Cifra não encontrada no Cifra Club para esta música." },
        { status: 422 }
      )
    }

    console.log(`[generate] cifraclub OK: ${cifraResult.chords.length} acordes, tom=${cifraResult.tom}`)

    // CHECKPOINT 2: valida cada acorde contra o dicionário
    const acordesValidos = cifraResult.chords.filter((cwl) => {
      const ok = validarAcorde(cwl.chord)
      if (!ok) console.log(`[generate] acorde descartado (não reconhecido): "${cwl.chord}"`)
      return ok
    })

    if (acordesValidos.length < 3) {
      return NextResponse.json(
        {
          error: `Acordes insuficientes após validação: ${acordesValidos.length} válidos de ${cifraResult.chords.length} extraídos.`,
        },
        { status: 422 }
      )
    }

    console.log(`[generate] ${acordesValidos.length}/${cifraResult.chords.length} acordes válidos`)

    // CHECKPOINT 3: converte para tab e verifica frets
    const medidas = acordesValidos
      .map((cwl, i) => {
        const tab = acordeParaTab(cwl.chord)
        if (!tab) {
          console.log(`[generate] tab inválida para "${cwl.chord}", descartando`)
          return null
        }

        // Usa letra do cifraclub se disponível, senão usa letra do lrclib
        const letra = cwl.lyric || ""

        return {
          numero: i + 1,
          letra,
          acordes: [
            {
              batida: 1,
              acorde: cwl.chord,
              duration: "w",
              notas: [],
              tab,
            },
          ],
        }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)

    if (medidas.length < 3) {
      return NextResponse.json(
        { error: "Medidas insuficientes após validação de tablatura." },
        { status: 422 }
      )
    }

    const tabData = {
      tom: cifraResult.tom,
      bpm: cifraResult.bpm,
      compasso: "4/4",
      fonte: cifraResult.pageUrl,
      partituraUrl: indexMatch?.postUrl ?? null,
      medidas,
    }

    const estudo = await prisma.estudo.create({
      data: {
        youtubeId,
        titulo,
        artista,
        tom: cifraResult.tom,
        bpm: cifraResult.bpm,
        compasso: "4/4",
        tabData,
      },
    })

    console.log(`[generate] salvo: id=${estudo.id}, medidas=${medidas.length}`)

    return NextResponse.json({
      id: estudo.id,
      cached: false,
      source: "cifraclub",
      medidas: medidas.length,
      partituraUrl: indexMatch?.postUrl ?? null,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[generate] erro:", msg)
    return NextResponse.json({ error: "Erro ao gerar", detail: msg }, { status: 500 })
  }
}
