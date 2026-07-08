import { prisma } from "@/lib/db"
import { GerarMusica } from "@/components/musicas/GerarMusica"
import { MusicasList } from "@/components/musicas/MusicasList"

export const dynamic = "force-dynamic"

export default async function MusicasPage() {
  const estudos = await prisma.estudo.findMany({
    select: { id: true, titulo: true, artista: true, tom: true, bpm: true, youtubeId: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

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

      {estudos.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">
            Músicas geradas
          </h2>
          <MusicasList estudos={estudos} />
        </div>
      )}
    </div>
  )
}
