import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const repertorios = await prisma.repertorio.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { itens: true } } },
  })

  return NextResponse.json(repertorios)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { nome, descricao, cor, emoji } = await req.json()
  if (!nome) {
    return NextResponse.json({ error: "nome é obrigatório" }, { status: 400 })
  }

  const repertorio = await prisma.repertorio.create({
    data: {
      userId: session.user.id,
      nome,
      descricao: descricao ?? null,
      cor: cor ?? "violet",
      emoji: emoji ?? "🎵",
    },
  })

  return NextResponse.json(repertorio)
}
