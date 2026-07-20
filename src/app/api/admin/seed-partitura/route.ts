import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Endpoint temporário para inserir partituras no índice.
// DELETE este arquivo após uso.
export async function POST(req: NextRequest) {
  const { artista, postTitulo, postUrl, secret } = await req.json()
  if (secret !== "cavaquinho-seed-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!artista || !postTitulo || !postUrl) {
    return NextResponse.json({ error: "artista, postTitulo, postUrl obrigatórios" }, { status: 400 })
  }

  const existing = await prisma.partituraIndex.findUnique({ where: { postUrl } })
  if (existing) {
    return NextResponse.json({ ok: true, action: "already_exists", id: existing.id })
  }

  const entry = await prisma.partituraIndex.create({
    data: { artista, postTitulo, postUrl },
  })

  return NextResponse.json({ ok: true, action: "created", id: entry.id })
}
