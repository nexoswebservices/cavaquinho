"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface GerandoStatusProps {
  id: string
  status: string
  createdAt: string
  erro?: string | null
}

const TRAVADO_APOS_MS = 90_000
const POLL_MS = 2000

export function GerandoStatus({ id, status: statusInicial, createdAt, erro: erroInicial }: GerandoStatusProps) {
  const router = useRouter()
  const [status, setStatus] = useState(statusInicial)
  const [erro, setErro] = useState(erroInicial ?? null)
  const [travado, setTravado] = useState(
    statusInicial === "pendente" && Date.now() - new Date(createdAt).getTime() > TRAVADO_APOS_MS
  )
  const disparouProcess = useRef(false)

  function iniciarProcessamento() {
    disparouProcess.current = true
    setTravado(false)
    fetch(`/api/musicas/${id}/process`, { method: "POST" }).catch(() => {
      // Falha de rede ao disparar: o polling abaixo ainda vai detectar
      // se ficou parado e oferecer "tentar novamente".
    })
  }

  useEffect(() => {
    if (status === "pendente" && !disparouProcess.current && !travado) {
      iniciarProcessamento()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (status === "pronto" || status === "falhou") return

    const interval = setInterval(async () => {
      if (Date.now() - new Date(createdAt).getTime() > TRAVADO_APOS_MS) {
        setTravado(true)
      }

      try {
        const res = await fetch(`/api/musicas/${id}`)
        if (!res.ok) return
        const data = await res.json()
        setStatus(data.status)
        setErro(data.erro ?? null)

        if (data.status === "pronto") {
          router.refresh()
        }
      } catch {
        // tenta de novo no próximo tick
      }
    }, POLL_MS)

    return () => clearInterval(interval)
  }, [id, status, createdAt, router])

  if (status === "falhou") {
    return (
      <div className="bg-[#120d24] border border-red-500/20 rounded-2xl p-8 text-center space-y-4">
        <p className="text-red-400 text-sm">{erro ?? "Não conseguimos gerar essa música."}</p>
        <button
          onClick={() => {
            setStatus("processando")
            setErro(null)
            iniciarProcessamento()
          }}
          className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-8 text-center space-y-4">
      <span className="inline-flex items-center gap-2 text-violet-300 text-sm">
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
        </svg>
        Buscando a partitura oficial e gerando a tab…
      </span>
      <p className="text-slate-500 text-xs">Isso pode levar até um minuto na primeira vez.</p>

      {travado && (
        <div className="pt-2">
          <p className="text-amber-400 text-xs mb-2">Está demorando mais que o esperado.</p>
          <button
            onClick={iniciarProcessamento}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  )
}
