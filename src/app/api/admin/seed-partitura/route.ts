import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Endpoint temporário para inserir partituras no índice.
// DELETE este arquivo após uso.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret")
  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { artista, postTitulo, postUrl } = await req.json()
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
