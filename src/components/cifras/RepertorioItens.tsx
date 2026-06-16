"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export interface RepertorioItemData {
  cifraId: string
  titulo: string
  artista: string | null
  tom: string | null
}

export function RepertorioItens({
  repertorioId,
  itens,
}: {
  repertorioId: string
  itens: RepertorioItemData[]
}) {
  const router = useRouter()
  const [list, setList] = useState(itens)
  const [busy, setBusy] = useState(false)

  async function persistOrder(newList: RepertorioItemData[]) {
    setBusy(true)
    try {
      await fetch(`/api/repertorios/${repertorioId}/itens`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cifraIds: newList.map((i) => i.cifraId) }),
      })
    } finally {
      setBusy(false)
    }
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= list.length) return
    const newList = [...list]
    ;[newList[index], newList[target]] = [newList[target], newList[index]]
    setList(newList)
    persistOrder(newList)
  }

  async function remove(cifraId: string) {
    setBusy(true)
    try {
      await fetch(`/api/repertorios/${repertorioId}/itens`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cifraId }),
      })
      setList((prev) => prev.filter((i) => i.cifraId !== cifraId))
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      {list.map((item, i) => (
        <div
          key={item.cifraId}
          className="flex items-center gap-3 bg-[#120d24] border border-white/5 rounded-xl p-3"
        >
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => move(i, -1)}
              disabled={busy || i === 0}
              className="text-slate-500 hover:text-white disabled:opacity-30 transition-colors text-xs leading-none"
              aria-label="Mover para cima"
            >
              ▲
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={busy || i === list.length - 1}
              className="text-slate-500 hover:text-white disabled:opacity-30 transition-colors text-xs leading-none"
              aria-label="Mover para baixo"
            >
              ▼
            </button>
          </div>

          <Link href={`/cifras/${item.cifraId}`} className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{item.titulo}</p>
            {item.artista && <p className="text-sm text-slate-400 truncate">{item.artista}</p>}
          </Link>

          {item.tom && (
            <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
              {item.tom}
            </span>
          )}

          <button
            onClick={() => remove(item.cifraId)}
            disabled={busy}
            className="text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-50 flex-shrink-0"
            aria-label="Remover"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
