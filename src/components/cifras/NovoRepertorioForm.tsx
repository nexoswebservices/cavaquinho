"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const CORES: { id: string; dot: string }[] = [
  { id: "violet", dot: "bg-violet-500" },
  { id: "indigo", dot: "bg-indigo-500" },
  { id: "rose", dot: "bg-rose-500" },
  { id: "amber", dot: "bg-amber-500" },
  { id: "emerald", dot: "bg-emerald-500" },
  { id: "sky", dot: "bg-sky-500" },
  { id: "orange", dot: "bg-orange-500" },
]

export function NovoRepertorioForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState("")
  const [emoji, setEmoji] = useState("🎵")
  const [cor, setCor] = useState("violet")
  const [descricao, setDescricao] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    setLoading(true)
    try {
      await fetch("/api/repertorios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, emoji, cor, descricao: descricao || undefined }),
      })
      setNome("")
      setDescricao("")
      setEmoji("🎵")
      setCor("violet")
      setOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors"
      >
        + Novo repertório
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-5 space-y-3">
      <div className="flex gap-3">
        <input
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          maxLength={4}
          className="w-16 bg-slate-900 border border-white/10 rounded-lg px-3 py-2.5 text-center text-white focus:outline-none focus:border-violet-500 transition-colors"
        />
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          placeholder="Nome do repertório"
          className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      <textarea
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Descrição (opcional)"
        rows={2}
        className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
      />

      <div className="flex items-center gap-2">
        {CORES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCor(c.id)}
            className={`w-6 h-6 rounded-full ${c.dot} border-2 transition-colors ${
              cor === c.id ? "border-white" : "border-transparent"
            }`}
            aria-label={c.id}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {loading ? "Criando..." : "Criar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
