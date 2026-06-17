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
    <div className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors group">
      <Link href={`/cifras/${cifra.id}`} className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-200 group-hover:text-white truncate">
          {cifra.titulo}
        </p>
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

function normalizeArtist(artista: string | null): string {
  if (!artista || !artista.trim()) return "Sem artista"
  return artista.trim()
}

export function CifraList({ cifras }: { cifras: CifraListItem[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [pendingId, setPendingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cifras
    return cifras.filter(
      (c) =>
        c.titulo.toLowerCase().includes(q) ||
        (c.artista ?? "").toLowerCase().includes(q)
    )
  }, [cifras, query])

  const favoritas = filtered.filter((c) => c.favorito)

  const grouped = useMemo(() => {
    const nonFav = filtered.filter((c) => !c.favorito)
    const map = new Map<string, CifraListItem[]>()

    for (const c of nonFav) {
      const artist = normalizeArtist(c.artista)
      const list = map.get(artist) ?? []
      list.push(c)
      map.set(artist, list)
    }

    const sorted = Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], "pt-BR", { sensitivity: "base" })
    )

    for (const [, songs] of sorted) {
      songs.sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR", { sensitivity: "base" }))
    }

    return sorted
  }, [filtered])

  const totalResults = filtered.length

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
      {/* Busca */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por música ou artista..."
            className="w-full bg-[#120d24] border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            🔍
          </span>
        </div>
        {query && (
          <p className="text-xs text-slate-500 mt-2">
            {totalResults} resultado{totalResults !== 1 ? "s" : ""} para &quot;{query}&quot;
          </p>
        )}
      </div>

      {/* Favoritas */}
      {favoritas.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-400">★</span>
            <h2 className="text-sm font-semibold text-white">
              Favoritas
            </h2>
            <span className="text-xs text-slate-500">({favoritas.length})</span>
          </div>
          <div className="bg-[#120d24] border border-amber-500/10 rounded-2xl p-2">
            {favoritas.map((c) => (
              <CifraRow
                key={c.id}
                cifra={c}
                pending={pendingId === c.id}
                onToggleFavorito={toggleFavorito}
              />
            ))}
          </div>
        </div>
      )}

      {/* Por artista */}
      <div className="space-y-6">
        {grouped.map(([artist, songs]) => (
          <div key={artist}>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-sm font-semibold text-violet-300">{artist}</h2>
              <span className="text-xs text-slate-600">({songs.length})</span>
            </div>
            <div className="bg-[#120d24] border border-white/5 rounded-2xl p-2">
              {songs.map((c) => (
                <CifraRow
                  key={c.id}
                  cifra={c}
                  pending={pendingId === c.id}
                  onToggleFavorito={toggleFavorito}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {totalResults === 0 && (
        <p className="text-slate-500 text-sm text-center py-8">
          Nenhuma cifra encontrada.
        </p>
      )}
    </div>
  )
}
