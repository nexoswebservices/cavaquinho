import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { MusicaPlayer } from "@/components/musicas/MusicaPlayer"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const estudo = await import("@/lib/db").then(({ prisma }) =>
    prisma.estudo.findUnique({ where: { id: params.id }, select: { titulo: true, artista: true } })
  )
  if (!estudo) return {}
  return { title: `${estudo.titulo} — ${estudo.artista} | Cavaquinho` }
}

export default async function MusicaPage({ params }: { params: { id: string } }) {
  const estudo = await prisma.estudo.findUnique({ where: { id: params.id } })
  if (!estudo) notFound()

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
      />
    </div>
  )
}
