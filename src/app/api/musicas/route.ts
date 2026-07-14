import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const estudos = await prisma.estudo.findMany({
    select: { id: true, titulo: true, artista: true, tom: true, bpm: true, youtubeId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return NextResponse.json(estudos)
}
