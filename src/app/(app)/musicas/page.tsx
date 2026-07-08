import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { GerarMusica } from "@/components/musicas/GerarMusica"
import { MusicasList } from "@/components/musicas/MusicasList"

export const dynamic = "force-dynamic"

export default async function MusicasPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  const [estudos, salvos] = await Promise.all([
    prisma.estudo.findMany({
      select: { id: true, titulo: true, artista: true, tom: true, bpm: true, youtubeId: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    userId
      ? prisma.estudoSalvo.findMany({
          where: { userId },
          select: { estudo: { select: { id: true, titulo: true, artista: true, tom: true, bpm: true, youtubeId: true } } },
          orderBy: { createdAt: "desc" },
        })
      : [],
  ])

  const savedEstudos = salvos.map((s) => s.estudo)
  const savedIds = new Set(savedEstudos.map((e) => e.id))
  const publicEstudos = estudos.filter((e) => !savedIds.has(e.id))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Músicas</h1>
        <p className="text-slate-400">
          Cole um link do YouTube — a IA gera partitura, tablatura e letra sincronizadas com o vídeo.
        </p>
      </div>

      <div className="mb-8">
        <GerarMusica />
      </div>

      {savedEstudos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
            Minhas salvas
          </h2>
          <MusicasList estudos={savedEstudos} />
        </div>
      )}

      {publicEstudos.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
            {savedEstudos.length > 0 ? "Outras músicas" : "Músicas geradas"}
          </h2>
          <MusicasList estudos={publicEstudos} />
        </div>
      )}
    </div>
  )
}
