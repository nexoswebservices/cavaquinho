"use client"

import { useState } from "react"
import { ChordSheet } from "./ChordSheet"
import { CifraAnalise } from "./CifraAnalise"

interface CifraTabsProps {
  conteudo: string
  tom?: string | null
  titulo?: string
}

export function CifraTabs({ conteudo, tom, titulo }: CifraTabsProps) {
  const [tab, setTab] = useState<"cifra" | "analise">("cifra")

  return (
    <div>
      <div className="flex gap-1 mb-5 border-b border-white/5 pb-px">
        <button
          onClick={() => setTab("cifra")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === "cifra"
              ? "border-violet-500 text-violet-300"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Cifra
        </button>
        <button
          onClick={() => setTab("analise")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === "analise"
              ? "border-violet-500 text-violet-300"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Análise Harmônica
        </button>
      </div>

      {tab === "cifra" ? (
        <ChordSheet conteudo={conteudo} />
      ) : (
        <CifraAnalise conteudo={conteudo} tom={tom} titulo={titulo} />
      )}
    </div>
  )
}
