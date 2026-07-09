import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const estudo = await prisma.estudo.findUnique({ where: { id: params.id } })
  if (!estudo) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(estudo)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const estudo = await prisma.estudo.update({
    where: { id: params.id },
    data: { introSecs: body.introSecs },
  })
  return NextResponse.json({ introSecs: estudo.introSecs })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.estudo.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
