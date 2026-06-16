import { notFound } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { RepertorioItens } from "@/components/cifras/RepertorioItens"

export const dynamic = "force-dynamic"

export default async function RepertorioPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  const repertorio = await prisma.repertorio.findFirst({
    where: { id: params.id, userId: session!.user!.id },
    include: {
      itens: {
        orderBy: { ordem: "asc" },
        include: { cifra: { select: { id: true, titulo: true, artista: true, tom: true } } },
      },
    },
  })
  if (!repertorio) notFound()

  const itens = repertorio.itens.map((i) => ({
    cifraId: i.cifra.id,
    titulo: i.cifra.titulo,
    artista: i.cifra.artista,
    tom: i.cifra.tom,
  }))

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/cifras" className="hover:text-slate-300 transition-colors">
          Cifras
        </Link>
        <span>/</span>
        <Link href="/cifras/repertorios" className="hover:text-slate-300 transition-colors">
          Repertórios
        </Link>
        <span>/</span>
        <span className="text-slate-300 truncate">{repertorio.nome}</span>
      </div>

      <div className="flex items-start gap-3 mb-6">
        <span className="text-3xl">{repertorio.emoji}</span>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{repertorio.nome}</h1>
          {repertorio.descricao && <p className="text-slate-400">{repertorio.descricao}</p>}
        </div>
      </div>

      {itens.length === 0 ? (
        <p className="text-slate-500 text-sm">
          Nenhuma música neste repertório ainda. Adicione músicas a partir da página de cada cifra.
        </p>
      ) : (
        <RepertorioItens repertorioId={repertorio.id} itens={itens} />
      )}
    </div>
  )
}
