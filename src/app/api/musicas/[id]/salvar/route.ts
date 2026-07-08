import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  await prisma.estudoSalvo.upsert({
    where: { userId_estudoId: { userId: session.user.id, estudoId: params.id } },
    create: { userId: session.user.id, estudoId: params.id },
    update: {},
  })
  return NextResponse.json({ saved: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  await prisma.estudoSalvo.deleteMany({
    where: { userId: session.user.id, estudoId: params.id },
  })
  return NextResponse.json({ saved: false })
}
