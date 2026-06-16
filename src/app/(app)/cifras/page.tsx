import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { CifraList } from "@/components/cifras/CifraList"

export const dynamic = "force-dynamic"

export default async function CifrasPage() {
  const session = await getServerSession(authOptions)

  const [cifras, favoritos] = await Promise.all([
    prisma.cifra.findMany({
      select: { id: true, titulo: true, artista: true, tom: true },
      orderBy: { titulo: "asc" },
    }),
    prisma.cifraFavorito.findMany({
      where: { userId: session!.user!.id },
      select: { cifraId: true },
    }),
  ])

  const favoritoSet = new Set(favoritos.map((f) => f.cifraId))
  const items = cifras.map((c) => ({ ...c, favorito: favoritoSet.has(c.id) }))

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Cifras</h1>
          <p className="text-slate-400">Letras e acordes para tocar no cavaquinho.</p>
        </div>
        <Link
          href="/cifras/repertorios"
          className="text-sm bg-[#120d24] border border-violet-500/20 text-violet-300 hover:border-violet-400/40 px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
        >
          Meus repertórios
        </Link>
      </div>

      <CifraList cifras={items} />
    </div>
  )
}
