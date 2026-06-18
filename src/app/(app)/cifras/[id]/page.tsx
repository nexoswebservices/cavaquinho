import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { CifraTabs } from "@/components/cifras/CifraTabs"
import { CifraFavoriteButton } from "@/components/cifras/CifraFavoriteButton"
import { AddToRepertorioButton } from "@/components/cifras/AddToRepertorioButton"

export const dynamic = "force-dynamic"

export default async function CifraPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  const cifra = await prisma.cifra.findUnique({ where: { id: params.id } })
  if (!cifra) notFound()

  const [favorito, repertorios] = await Promise.all([
    userId
      ? prisma.cifraFavorito.findUnique({
          where: { userId_cifraId: { userId, cifraId: cifra.id } },
        })
      : null,
    userId
      ? prisma.repertorio.findMany({
          where: { userId },
          orderBy: { createdAt: "asc" },
          select: { id: true, nome: true, emoji: true },
        })
      : [],
  ])

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/cifras" className="hover:text-slate-300 transition-colors">
          Cifras
        </Link>
        <span>/</span>
        <span className="text-slate-300 truncate">{cifra.titulo}</span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{cifra.titulo}</h1>
          {cifra.artista && <p className="text-slate-400">{cifra.artista}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {cifra.tom && (
            <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 px-3 py-1.5 rounded-full font-medium">
              Tom: {cifra.tom}
            </span>
          )}
          {userId ? (
            <>
              <CifraFavoriteButton cifraId={cifra.id} initialFavorito={!!favorito} />
              <AddToRepertorioButton cifraId={cifra.id} repertorios={repertorios} />
            </>
          ) : (
            <Link
              href="/login"
              className="text-xs bg-[#120d24] border border-white/5 text-slate-400 hover:text-violet-300 hover:border-violet-500/30 px-3 py-1.5 rounded-xl transition-colors"
            >
              Entrar para favoritar
            </Link>
          )}
        </div>
      </div>

      <CifraTabs conteudo={cifra.conteudo} tom={cifra.tom} titulo={cifra.titulo} />
    </div>
  )
}
