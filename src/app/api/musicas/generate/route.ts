import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/db"
import { searchPartituraIndex } from "@/lib/partitura-search"
import { fetchPartituraImageUrls, extractTabFromPartituraImage } from "@/lib/partitura-vision"
import { fetchLetra } from "@/lib/letras-scraper"
import { chordToTab } from "@/lib/cavaquinho-tab"

export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

// Post-process tabData: recalculate tab[] for each acorde using formula
function applyFormulasTabs(tabData: Record<string, unknown>): Record<string, unknown> {
  const medidas = tabData.medidas as Array<Record<string, unknown>>
  if (!Array.isArray(medidas)) return tabData

  return {
    ...tabData,
    medidas: medidas.map((m) => {
      const acordes = m.acordes as Array<Record<string, unknown>> | undefined
      if (!Array.isArray(acordes)) return m
      return {
        ...m,
        acordes: acordes.map((a) => ({ ...a, tab: chordToTab(a.acorde as string) })),
      }
    }),
  }
}

async function generateViaClaudeText(
  titulo: string,
  artista: string,
  letra?: string
): Promise<Record<string, unknown>> {
  const letraBlock = letra
    ? `\n\nLetra oficial:\n---\n${letra}\n---\n\nMapeie cada trecho da letra acima nas medidas correspondentes.`
    : ""

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    system: `Você é um especialista em música brasileira (samba, pagode, MPB) e cifras para cavaquinho.
Responda SOMENTE com JSON válido, sem markdown, sem texto extra.`,
    messages: [
      {
        role: "user",
        content: `Gere a cifra estruturada completa de "${titulo}" por ${artista} para cavaquinho (afinação D-G-B-D).${letraBlock}

Retorne EXATAMENTE este JSON (sem markdown):
{
  "tom": "string (ex: C, Am, F, Dm)",
  "bpm": number,
  "compasso": "4/4",
  "medidas": [
    {
      "numero": 1,
      "letra": "texto da letra nesta medida (string vazia se intro instrumental)",
      "acordes": [
        {
          "batida": 1,
          "acorde": "Cm7",
          "duration": "h",
          "notas": ["C","Eb","G","Bb"],
          "tab": [5, 3, 1, 5]
        }
      ]
    }
  ]
}

Regras:
- tab: 4 números [D4, G4, B4, D5], frets 0-12
- duration: "w"=4 beats, "h"=2 beats, "q"=1 beat
- notas: sempre sharps (C#, D#, F#, G#, A#), nunca bemóis
- Inclua a música COMPLETA com todas estrofes e refrões
- BPM típico: samba 80-120, pagode 70-100, bossa nova 100-140
- Máximo 80 medidas`,
      },
    ],
  })

  const raw = (message.content[0] as { type: string; text: string }).text.trim()
  const jsonStr = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim()
  return JSON.parse(jsonStr)
}

export async function POST(req: NextRequest) {
  try {
    const { url, force } = await req.json()
    if (!url) return NextResponse.json({ error: "URL obrigatória" }, { status: 400 })

    const youtubeId = extractYoutubeId(url)
    if (!youtubeId) return NextResponse.json({ error: "URL do YouTube inválida" }, { status: 400 })

    // Cache hit — pular se force=true (regenerar)
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

    // Buscar letra em paralelo com busca de partitura
    const [letraResult, indexMatch] = await Promise.all([
      fetchLetra(artista, titulo),
      searchPartituraIndex(titulo, artista),
    ])

    let tabData: Record<string, unknown> | null = null
    let source: "partitura" | "claude" = "claude"

    // Tentativa 1: partitura do nandinhocavaco → Claude Vision (Opus, extrai chord names)
    if (indexMatch) {
      const imageUrls = await fetchPartituraImageUrls(indexMatch.postUrl)
      console.log(`[generate] partitura match: ${indexMatch.postUrl} | ${imageUrls.length} imagens`)
      for (const imageUrl of imageUrls.slice(0, 4)) {
        console.log(`[generate] tentando vision: ${imageUrl}`)
        const visionResult = await extractTabFromPartituraImage(imageUrl, titulo, artista)
        const medidas = visionResult ? (visionResult.medidas as unknown[]).length : 0
        console.log(`[generate] vision result: ${medidas} medidas`)
        if (visionResult && medidas >= 4) {
          tabData = applyFormulasTabs(visionResult)
          source = "partitura"
          break
        }
      }
      if (!tabData) {
        console.log(`[generate] vision falhou para todas as imagens, usando fallback Claude texto`)
      }
    }

    // Tentativa 2 (fallback): Claude gera por texto, usando letra real se disponível
    if (!tabData) {
      tabData = await generateViaClaudeText(titulo, artista, letraResult?.plainLyrics)
      // Fallback de texto usa chord voicings → recalcular tabs com formulas
      tabData = applyFormulasTabs(tabData)
    }

    const tabJson = JSON.parse(JSON.stringify(tabData))

    const estudo = await prisma.estudo.create({
      data: {
        youtubeId,
        titulo,
        artista,
        tom: (tabJson.tom as string) ?? "C",
        bpm: (tabJson.bpm as number) ?? 90,
        compasso: (tabJson.compasso as string) ?? "4/4",
        tabData: tabJson,
      },
    })

    return NextResponse.json({ id: estudo.id, cached: false, source, _debug: indexMatch?.postUrl ?? null })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("generate error:", msg)
    return NextResponse.json({ error: "Erro ao gerar tab", detail: msg }, { status: 500 })
  }
}
