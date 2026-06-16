import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

async function getOwnedRepertorio(repertorioId: string, userId: string) {
  return prisma.repertorio.findFirst({ where: { id: repertorioId, userId } })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const repertorio = await getOwnedRepertorio(params.id, session.user.id)
  if (!repertorio) {
    return NextResponse.json({ error: "Repertório não encontrado" }, { status: 404 })
  }

  const { cifraId } = await req.json()
  if (!cifraId) {
    return NextResponse.json({ error: "cifraId é obrigatório" }, { status: 400 })
  }

  const count = await prisma.repertorioItem.count({ where: { repertorioId: params.id } })

  const item = await prisma.repertorioItem.upsert({
    where: { repertorioId_cifraId: { repertorioId: params.id, cifraId } },
    create: { repertorioId: params.id, cifraId, ordem: count },
    update: {},
  })

  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const repertorio = await getOwnedRepertorio(params.id, session.user.id)
  if (!repertorio) {
    return NextResponse.json({ error: "Repertório não encontrado" }, { status: 404 })
  }

  const { cifraId } = await req.json()
  if (!cifraId) {
    return NextResponse.json({ error: "cifraId é obrigatório" }, { status: 400 })
  }

  await prisma.repertorioItem.deleteMany({ where: { repertorioId: params.id, cifraId } })

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const repertorio = await getOwnedRepertorio(params.id, session.user.id)
  if (!repertorio) {
    return NextResponse.json({ error: "Repertório não encontrado" }, { status: 404 })
  }

  const { cifraIds } = await req.json()
  if (!Array.isArray(cifraIds)) {
    return NextResponse.json({ error: "cifraIds deve ser um array" }, { status: 400 })
  }

  await prisma.$transaction(
    cifraIds.map((cifraId: string, ordem: number) =>
      prisma.repertorioItem.update({
        where: { repertorioId_cifraId: { repertorioId: params.id, cifraId } },
        data: { ordem },
      })
    )
  )

  return NextResponse.json({ ok: true })
}
