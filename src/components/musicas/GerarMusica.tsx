"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function GerarMusica() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Auto-preencher e gerar se vier do botão Alterar (regenerar)
  useEffect(() => {
    const regen = searchParams.get("regen")
    if (regen) {
      setUrl(regen)
      handleGerarUrl(regen)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleGerarUrl(targetUrl: string) {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/musicas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      })
      const text = await res.text()
      let data: { id?: string; error?: string; detail?: string }
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`Resposta inválida do servidor: ${text.slice(0, 120)}`)
      }
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar")
      router.push(`/musicas/${data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro desconhecido")
      setLoading(false)
    }
  }

  async function handleGerar() {
    if (!url.trim()) return
    await handleGerarUrl(url.trim())
  }

  return (
    <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-1">Gerar tab a partir do YouTube</h2>
      <p className="text-slate-400 text-sm mb-4">
        Cole o link de qualquer vídeo do YouTube — a IA gera a partitura, tablatura e letra para cavaquinho.
      </p>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGerar()}
          placeholder="https://www.youtube.com/watch?v=..."
          className="flex-1 bg-[#0a0714] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50"
        />
        <button
          onClick={handleGerar}
          disabled={loading || !url.trim()}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
              Gerando...
            </span>
          ) : "Gerar Tab"}
        </button>
      </div>
      {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
    </div>
  )
}
