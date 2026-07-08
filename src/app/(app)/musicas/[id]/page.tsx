import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { MusicaPlayer } from "@/components/musicas/MusicaPlayer"

export const dynamic = "force-dynamic"

export default async function MusicaPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  const estudo = await prisma.estudo.findUnique({ where: { id: params.id } })
  if (!estudo) notFound()

  const saved = userId
    ? !!(await prisma.estudoSalvo.findUnique({
        where: { userId_estudoId: { userId, estudoId: estudo.id } },
      }))
    : false

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/musicas" className="hover:text-slate-300 transition-colors">
          Músicas
        </Link>
        <span>/</span>
        <span className="text-slate-300 truncate">{estudo.titulo}</span>
      </div>

      <MusicaPlayer
        estudo={{
          id: estudo.id,
          titulo: estudo.titulo,
          artista: estudo.artista,
          youtubeId: estudo.youtubeId,
          tom: estudo.tom,
          bpm: estudo.bpm,
          compasso: estudo.compasso,
          introSecs: estudo.introSecs,
          tabData: estudo.tabData as { medidas: never[] },
        }}
        isSaved={saved}
      />
    </div>
  )
}
