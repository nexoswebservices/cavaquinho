"use client"

import { useState } from "react"
import Link from "next/link"

interface RepertorioOption {
  id: string
  nome: string
  emoji: string
}

export function AddToRepertorioButton({
  cifraId,
  repertorios,
}: {
  cifraId: string
  repertorios: RepertorioOption[]
}) {
  const [open, setOpen] = useState(false)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function addTo(repertorioId: string) {
    setLoadingId(repertorioId)
    try {
      await fetch(`/api/repertorios/${repertorioId}/itens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cifraId }),
      })
      setAdded((prev) => new Set(prev).add(repertorioId))
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm bg-[#120d24] border border-white/5 text-slate-300 hover:border-white/20 px-3 py-1.5 rounded-xl transition-colors"
      >
        + Repertório
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-[#120d24] border border-violet-500/20 rounded-xl shadow-xl p-2 z-10">
          {repertorios.length === 0 ? (
            <p className="text-xs text-slate-500 px-2 py-2">Você ainda não tem repertórios.</p>
          ) : (
            repertorios.map((r) => (
              <button
                key={r.id}
                onClick={() => addTo(r.id)}
                disabled={loadingId === r.id}
                className="w-full flex items-center gap-2 text-left text-sm text-slate-300 hover:bg-white/5 rounded-lg px-2 py-2 transition-colors disabled:opacity-50"
              >
                <span>{r.emoji}</span>
                <span className="flex-1 truncate">{r.nome}</span>
                {added.has(r.id) && <span className="text-emerald-400 text-xs">✓</span>}
              </button>
            ))
          )}
          <Link
            href="/cifras/repertorios"
            className="block text-center text-xs text-violet-300 hover:text-violet-200 mt-1 pt-2 border-t border-white/5"
          >
            Gerenciar repertórios
          </Link>
        </div>
      )}
    </div>
  )
}
