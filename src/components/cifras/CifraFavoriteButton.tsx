"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function CifraFavoriteButton({
  cifraId,
  initialFavorito,
}: {
  cifraId: string
  initialFavorito: boolean
}) {
  const router = useRouter()
  const [favorito, setFavorito] = useState(initialFavorito)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      await fetch(`/api/cifras/${cifraId}/favorito`, { method: favorito ? "DELETE" : "POST" })
      setFavorito(!favorito)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xl leading-none px-3 py-1.5 rounded-xl border transition-colors disabled:opacity-50 ${
        favorito
          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
          : "bg-[#120d24] border-white/5 text-slate-500 hover:text-amber-400 hover:border-amber-500/30"
      }`}
      aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      {favorito ? "★" : "☆"}
    </button>
  )
}
