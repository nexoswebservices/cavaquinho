"use client"

import Link from "next/link"

interface EstudoCard {
  id: string
  titulo: string
  artista: string
  tom: string
  bpm: number
  youtubeId: string
}

interface MusicasListProps {
  estudos: EstudoCard[]
}

export function MusicasList({ estudos }: MusicasListProps) {
  if (estudos.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-4xl mb-3">🎵</p>
        <p>Nenhuma música gerada ainda.</p>
        <p className="text-sm mt-1">Cole um link do YouTube acima para começar.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {estudos.map((e) => (
        <Link
          key={e.id}
          href={`/musicas/${e.id}`}
          className="group bg-[#120d24] border border-white/5 hover:border-violet-500/30 rounded-xl p-4 transition-all"
        >
          <div className="flex items-start gap-3">
            <img
              src={`https://img.youtube.com/vi/${e.youtubeId}/mqdefault.jpg`}
              alt={e.titulo}
              className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-white font-medium text-sm leading-tight truncate group-hover:text-violet-300 transition-colors">
                {e.titulo}
              </p>
              <p className="text-slate-400 text-xs mt-0.5 truncate">{e.artista}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-full">
                  {e.tom}
                </span>
                <span className="text-xs text-slate-500">{e.bpm} BPM</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
