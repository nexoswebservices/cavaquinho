import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const records = await prisma.userProgress.findMany({
    where: { userId: session.user.id, completed: true },
    select: { moduleId: true, lessonId: true },
  })

  const map: Record<string, boolean> = {}
  for (const r of records) {
    map[`${r.moduleId}:${r.lessonId}`] = true
  }

  return NextResponse.json(map)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { moduleId, lessonId, completed } = await req.json()
  if (!moduleId || !lessonId) {
    return NextResponse.json({ error: "moduleId e lessonId são obrigatórios" }, { status: 400 })
  }

  const record = await prisma.userProgress.upsert({
    where: {
      userId_moduleId_lessonId: {
        userId: session.user.id,
        moduleId,
        lessonId,
      },
    },
    create: {
      userId: session.user.id,
      moduleId,
      lessonId,
      completed: completed ?? true,
      completedAt: completed !== false ? new Date() : null,
    },
    update: {
      completed: completed ?? true,
      completedAt: completed !== false ? new Date() : null,
    },
  })

  return NextResponse.json(record)
}
