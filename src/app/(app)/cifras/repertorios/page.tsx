import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NovoRepertorioForm } from "@/components/cifras/NovoRepertorioForm"
import { DeleteRepertorioButton } from "@/components/cifras/DeleteRepertorioButton"

export const dynamic = "force-dynamic"

const COR_MAP: Record<string, string> = {
  violet: "from-violet-600/20 to-violet-800/10 border-violet-500/30",
  indigo: "from-indigo-600/20 to-indigo-800/10 border-indigo-500/30",
  rose: "from-rose-600/20 to-rose-800/10 border-rose-500/30",
  amber: "from-amber-600/20 to-amber-800/10 border-amber-500/30",
  emerald: "from-emerald-600/20 to-emerald-800/10 border-emerald-500/30",
  sky: "from-sky-600/20 to-sky-800/10 border-sky-500/30",
  orange: "from-orange-600/20 to-orange-800/10 border-orange-500/30",
}

export default async function RepertoriosPage() {
  const session = await getServerSession(authOptions)

  const repertorios = await prisma.repertorio.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { itens: true } } },
  })

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/cifras" className="hover:text-slate-300 transition-colors">
          Cifras
        </Link>
        <span>/</span>
        <span className="text-slate-300">Repertórios</span>
      </div>

      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Meus repertórios</h1>
          <p className="text-slate-400">Organize suas músicas em listas para tocar.</p>
        </div>
        <NovoRepertorioForm />
      </div>

      {repertorios.length === 0 ? (
        <p className="text-slate-500 text-sm">Você ainda não criou nenhum repertório.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {repertorios.map((r) => (
            <Link
              key={r.id}
              href={`/cifras/repertorios/${r.id}`}
              className={`relative bg-gradient-to-br ${
                COR_MAP[r.cor] ?? COR_MAP.violet
              } border rounded-2xl p-5 hover:brightness-110 transition-all`}
            >
              <div className="absolute top-3 right-3">
                <DeleteRepertorioButton repertorioId={r.id} />
              </div>
              <div className="text-3xl mb-2">{r.emoji}</div>
              <h2 className="text-white font-semibold mb-1 pr-4">{r.nome}</h2>
              {r.descricao && <p className="text-sm text-slate-400 mb-2 line-clamp-2">{r.descricao}</p>}
              <p className="text-xs text-slate-500">
                {r._count.itens} {r._count.itens === 1 ? "música" : "músicas"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
