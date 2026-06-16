"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export interface CifraListItem {
  id: string
  titulo: string
  artista: string | null
  tom: string | null
  favorito: boolean
}

function CifraRow({
  cifra,
  pending,
  onToggleFavorito,
}: {
  cifra: CifraListItem
  pending: boolean
  onToggleFavorito: (id: string, current: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-xl border bg-[#120d24] border-white/5 hover:border-white/20 transition-all duration-150">
      <Link href={`/cifras/${cifra.id}`} className="flex-1 min-w-0">
        <p className="font-medium text-sm text-white truncate">{cifra.titulo}</p>
        {cifra.artista && <p className="text-xs text-slate-500 truncate">{cifra.artista}</p>}
      </Link>
      <div className="flex items-center gap-2 flex-shrink-0">
        {cifra.tom && (
          <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-medium">
            {cifra.tom}
          </span>
        )}
        <button
          onClick={() => onToggleFavorito(cifra.id, cifra.favorito)}
          disabled={pending}
          className={`text-lg leading-none transition-colors disabled:opacity-50 ${
            cifra.favorito ? "text-amber-400" : "text-slate-600 hover:text-amber-400"
          }`}
          aria-label={cifra.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          {cifra.favorito ? "★" : "☆"}
        </button>
      </div>
    </div>
  )
}

export function CifraList({ cifras }: { cifras: CifraListItem[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [pendingId, setPendingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cifras
    return cifras.filter(
      (c) => c.titulo.toLowerCase().includes(q) || (c.artista ?? "").toLowerCase().includes(q)
    )
  }, [cifras, query])

  const favoritas = filtered.filter((c) => c.favorito)
  const outras = filtered.filter((c) => !c.favorito)

  async function toggleFavorito(id: string, current: boolean) {
    setPendingId(id)
    try {
      await fetch(`/api/cifras/${id}/favorito`, { method: current ? "DELETE" : "POST" })
      router.refresh()
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título ou artista..."
          className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      {favoritas.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-400 mb-3">⭐ Favoritas</p>
          <div className="space-y-2">
            {favoritas.map((c) => (
              <CifraRow key={c.id} cifra={c} pending={pendingId === c.id} onToggleFavorito={toggleFavorito} />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-slate-400 mb-3">
          {filtered.length} música{filtered.length !== 1 ? "s" : ""}
        </p>
        <div className="space-y-2">
          {outras.map((c) => (
            <CifraRow key={c.id} cifra={c} pending={pendingId === c.id} onToggleFavorito={toggleFavorito} />
          ))}
        </div>
      </div>
    </div>
  )
}
