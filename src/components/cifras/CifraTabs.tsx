"use client"

import { useState } from "react"
import { ChordSheet } from "./ChordSheet"
import { CifraAnalise } from "./CifraAnalise"
import { CifraControls } from "./CifraControls"
import { transposeContent, getTransposedKey } from "@/lib/transpose"

interface CifraTabsProps {
  conteudo: string
  tom?: string | null
  titulo?: string
}

export function CifraTabs({ conteudo, tom, titulo }: CifraTabsProps) {
  const [tab, setTab] = useState<"cifra" | "analise">("cifra")
  const [transposeSemitones, setTransposeSemitones] = useState(0)
  const [fontSize, setFontSize] = useState(14)
  const [autoScroll, setAutoScroll] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(3)

  const originalKey = tom ?? "C"
  const currentKey = getTransposedKey(originalKey, transposeSemitones)

  return (
    <div>
      {/* Controls */}
      <CifraControls
        originalKey={originalKey}
        transposeSemitones={transposeSemitones}
        onTranspose={setTransposeSemitones}
        fontSize={fontSize}
        onFontSize={setFontSize}
        autoScroll={autoScroll}
        onAutoScroll={setAutoScroll}
        scrollSpeed={scrollSpeed}
        onScrollSpeed={setScrollSpeed}
      />

      {/* Tabs */}
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
        <ChordSheet
          conteudo={conteudo}
          transposeSemitones={transposeSemitones}
          fontSize={fontSize}
        />
      ) : (
        <CifraAnalise
          conteudo={transposeSemitones !== 0 ? transposeContent(conteudo, transposeSemitones, originalKey) : conteudo}
          tom={currentKey}
          titulo={titulo}
        />
      )}
    </div>
  )
}
