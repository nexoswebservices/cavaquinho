import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  await prisma.cifraFavorito.upsert({
    where: { userId_cifraId: { userId: session.user.id, cifraId: params.id } },
    create: { userId: session.user.id, cifraId: params.id },
    update: {},
  })

  return NextResponse.json({ favorito: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  await prisma.cifraFavorito.deleteMany({
    where: { userId: session.user.id, cifraId: params.id },
  })

  return NextResponse.json({ favorito: false })
}
