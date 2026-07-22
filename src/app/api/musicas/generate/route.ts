import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { extractArtistaPrincipal } from "@/lib/cifraclub-scraper"

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

// Fica rápida de propósito: só garante o cache-hit e cria a linha "pendente".
// Quem faz o trabalho pesado (buscar partitura, rodar Vision, cair pra cifra
// se preciso) é /api/musicas/[id]/process, chamado pelo cliente logo depois
// — assim cada etapa cabe no limite de execução do plano Hobby da Vercel.
export async function POST(req: NextRequest) {
  try {
    const { url, force } = await req.json()
    if (!url) return NextResponse.json({ error: "URL obrigatória" }, { status: 400 })

    const youtubeId = extractYoutubeId(url)
    if (!youtubeId) return NextResponse.json({ error: "URL do YouTube inválida" }, { status: 400 })

    const existing = await prisma.estudo.findUnique({ where: { youtubeId } })
    if (existing) {
      if (!force) return NextResponse.json({ id: existing.id, status: existing.status })
      await prisma.estudo.delete({ where: { id: existing.id } })
    }

    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://youtu.be/${youtubeId}&format=json`
    )
    if (!oembedRes.ok) return NextResponse.json({ error: "Vídeo não encontrado" }, { status: 404 })
    const oembed = await oembedRes.json()
    const titulo = oembed.title as string
    const canal = (oembed.author_name as string).replace(/ - Topic$/, "")
    // O canal do YouTube costuma ser quem postou o vídeo, não quem gravou a
    // música (covers, coletâneas, reposts). Preferimos o artista extraído do
    // próprio título do vídeo; o canal só entra como fallback.
    const artista = extractArtistaPrincipal(titulo) ?? canal

    const estudo = await prisma.estudo.create({
      data: {
        youtubeId,
        titulo,
        artista,
        tom: "C",
        bpm: 90,
        compasso: "4/4",
        status: "pendente",
      },
    })

    return NextResponse.json({ id: estudo.id, status: estudo.status })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[generate] erro:", msg)
    return NextResponse.json({ error: "Erro ao gerar", detail: msg }, { status: 500 })
  }
}
