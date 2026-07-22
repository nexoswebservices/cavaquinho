"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface EstudoCard {
  id: string
  titulo: string
  artista: string
  tom: string
  bpm: number
  youtubeId: string
  status: string
}

interface MusicasListProps {
  estudos: EstudoCard[]
  allSaved?: boolean
}

function MusicaCard({ e, allSaved }: { e: EstudoCard; allSaved: boolean }) {
  const router = useRouter()
  const [saved, setSaved] = useState(allSaved)
  const [busy, setBusy] = useState(false)

  async function toggleSave(ev: React.MouseEvent) {
    ev.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      const method = saved ? "DELETE" : "POST"
      const res = await fetch(`/api/musicas/${e.id}/salvar`, { method })
      if (res.ok) setSaved(!saved)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(ev: React.MouseEvent) {
    ev.preventDefault()
    if (!confirm(`Excluir "${e.titulo}"?`)) return
    setBusy(true)
    await fetch(`/api/musicas/${e.id}`, { method: "DELETE" })
    router.refresh()
  }

  async function handleRegen(ev: React.MouseEvent) {
    ev.preventDefault()
    if (!confirm(`Excluir e regenerar "${e.titulo}"? O estudo atual será apagado.`)) return
    setBusy(true)
    await fetch(`/api/musicas/${e.id}`, { method: "DELETE" })
    router.push(`/musicas?regen=https://youtu.be/${e.youtubeId}`)
  }

  return (
    <div className="group bg-[#120d24] border border-white/5 hover:border-violet-500/30 rounded-xl overflow-hidden transition-all">
      {/* Clickable area → player */}
      <Link href={`/musicas/${e.id}`} className="block p-4">
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

      {/* Action buttons */}
      {e.status !== "pronto" ? (
        <div className="border-t border-white/5 px-3 py-1.5 flex items-center gap-1.5 text-xs">
          {e.status === "falhou" ? (
            <span className="text-red-400">Falhou ao gerar</span>
          ) : (
            <span className="flex items-center gap-1.5 text-violet-300">
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
              Gerando…
            </span>
          )}
        </div>
      ) : (
      <div className="border-t border-white/5 px-3 py-1.5 flex items-center gap-1">
        <button
          onClick={toggleSave}
          disabled={busy}
          title={saved ? "Remover dos favoritos" : "Favoritar"}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors disabled:opacity-40 ${
            saved
              ? "text-violet-300 bg-violet-600/20 hover:bg-violet-600/30"
              : "text-slate-500 hover:text-violet-300 hover:bg-violet-600/10"
          }`}
        >
          {saved ? "♥" : "♡"} <span className="hidden sm:inline">{saved ? "Salva" : "Salvar"}</span>
        </button>
        <button
          onClick={handleRegen}
          disabled={busy}
          title="Regenerar (apaga e gera novamente)"
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-500 hover:text-amber-300 hover:bg-amber-500/10 transition-colors disabled:opacity-40"
        >
          🔄 <span className="hidden sm:inline">Regenerar</span>
        </button>
        <button
          onClick={handleDelete}
          disabled={busy}
          title="Excluir"
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40 ml-auto"
        >
          🗑 <span className="hidden sm:inline">Excluir</span>
        </button>
      </div>
      )}
    </div>
  )
}

export function MusicasList({ estudos, allSaved = false }: MusicasListProps) {
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
        <MusicaCard key={e.id} e={e} allSaved={allSaved} />
      ))}
    </div>
  )
}
