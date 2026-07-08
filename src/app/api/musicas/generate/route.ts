import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/db"
import { searchPartituraIndex } from "@/lib/partitura-search"
import { fetchPartituraImageUrls, extractTabFromPartituraImage } from "@/lib/partitura-vision"

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

async function generateViaClaudeText(titulo: string, artista: string): Promise<Record<string, unknown>> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    system: `Você é um especialista em música brasileira (samba, pagode, MPB) e em cifras para cavaquinho (afinação D-G-B-D, trastes 0-12).
Responda SOMENTE com JSON válido, sem markdown, sem texto extra.`,
    messages: [
      {
        role: "user",
        content: `Gere a cifra estruturada completa para "${titulo}" de ${artista}.

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
- tab: 4 números [D4, G4, B4, D5], frets 0-12. Use shapes reais do cavaquinho.
- duration: "w"=whole(4 beats), "h"=half(2 beats), "q"=quarter(1 beat)
- notas: use sempre sharps (C#, D#, F#, G#, A#), nunca bemóis
- Inclua a música COMPLETA com todas estrofes e refrões
- BPM típico: samba 80-120, pagode 70-100, bossa nova 100-140
- Máximo 80 medidas. Se a música for longa, agrupe mais acordes por medida.`,
      },
    ],
  })

  const raw = (message.content[0] as { type: string; text: string }).text.trim()
  const jsonStr = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim()
  return JSON.parse(jsonStr)
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: "URL obrigatória" }, { status: 400 })

    const youtubeId = extractYoutubeId(url)
    if (!youtubeId) return NextResponse.json({ error: "URL do YouTube inválida" }, { status: 400 })

    // Cache check
    const existing = await prisma.estudo.findUnique({ where: { youtubeId } })
    if (existing) return NextResponse.json({ id: existing.id, cached: true })

    // Get title + artist via oEmbed
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://youtu.be/${youtubeId}&format=json`
    )
    if (!oembedRes.ok) return NextResponse.json({ error: "Vídeo não encontrado" }, { status: 404 })
    const oembed = await oembedRes.json()
    const titulo = oembed.title as string
    const artista = (oembed.author_name as string).replace(/ - Topic$/, "")

    // Tentativa 1: buscar partitura no índice → Claude Vision
    let tabData: Record<string, unknown> | null = null
    let source: "partitura" | "claude" = "claude"

    const indexMatch = await searchPartituraIndex(titulo, artista)
    if (indexMatch) {
      const imageUrls = await fetchPartituraImageUrls(indexMatch.postUrl)
      if (imageUrls.length > 0) {
        tabData = await extractTabFromPartituraImage(imageUrls[0], titulo, artista)
        if (tabData) source = "partitura"
      }
    }

    // Tentativa 2 (fallback): Claude gera por texto
    if (!tabData) {
      tabData = await generateViaClaudeText(titulo, artista)
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

    return NextResponse.json({ id: estudo.id, cached: false, source })
  } catch (err) {
    console.error("generate error:", err)
    return NextResponse.json({ error: "Erro ao gerar tab" }, { status: 500 })
  }
}
