"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function DeleteRepertorioButton({ repertorioId }: { repertorioId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("Excluir este repertório?")) return
    setLoading(true)
    try {
      await fetch(`/api/repertorios/${repertorioId}`, { method: "DELETE" })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-slate-500 hover:text-rose-400 text-sm transition-colors disabled:opacity-50"
      aria-label="Excluir repertório"
    >
      ✕
    </button>
  )
}
