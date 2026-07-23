"use client"

import { useEffect, useRef, useMemo, useState, useCallback } from "react"
import { BracoCavaquinho } from "@/components/progressoes/BracoCavaquinho"
import { initSampler, playChord } from "@/lib/sampler"
import { chordToNotes } from "@/lib/cavaquinho-tab"
import { medidasToMusicXML, medidaChordSequence } from "@/lib/medidas-to-musicxml"
import type { Medida, MedidaEventos } from "@/lib/tab-checkpoints"

type MedidaAny = Medida | MedidaEventos

const TO_SHARP: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" }

interface PartituraCompletaProps {
  medidas: MedidaAny[]
  activeMeasure: number
  view: "both" | "tab"
  compasso: string
  tom: string
}

interface ChordRect {
  acorde: string
  left: number
  top: number
  width: number
  height: number
}

// Padrão de símbolo de cifra tal como o OSMD desenha (raiz + sufixo curto de
// qualidade) — usado só pra RECONHECER qual <text> desenhado é uma cifra
// (distinguindo de letra de música e número de compasso, que usam a mesma
// classe "vf-text"), não pra decidir o conteúdo. Ancorado (^...$) porque uma
// letra de música pode começar com A-G (ex "Enfim") mas nunca casa o sufixo
// inteiro de um acorde.
const CHORD_TEXT_RE = /^[A-G][#b]?(m7b5|maj7|sus2|sus4|dim|aug|m7|M7|°|ø|\+|m|7|9|11|13)?$/

// Renderiza a partitura via OpenSheetMusicDisplay (layout automático — clave,
// feixes, espaçamento e enarmonia por tom resolvidos pela própria lib a
// partir do MusicXML gerado por medidasToMusicXML) em vez do posicionamento
// manual com VexFlow que essa peça tinha antes.
export function PartituraCompleta({ medidas, activeMeasure, view, compasso, tom }: PartituraCompletaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const osmdRef = useRef<any>(null)
  const [selectedChord, setSelectedChord] = useState<number | null>(null)
  const [chordRects, setChordRects] = useState<ChordRect[]>([])

  const xml = useMemo(() => {
    if (medidas.length === 0) return null
    return medidasToMusicXML(medidas, { tom, compasso, somenteTab: view === "tab" })
  }, [medidas, tom, compasso, view])

  const chordSeq = useMemo(() => medidaChordSequence(medidas), [medidas])

  // Casa os <text> de cifra desenhados pelo OSMD (classe "vf-text", junto com
  // letra de música e número de compasso — filtrados por CHORD_TEXT_RE) com a
  // sequência de cifras que pedimos, na mesma ordem (compasso a compasso). Se
  // o OSMD mudar essa classe internamente no futuro, o pior caso é o clique
  // parar de funcionar (a cifra continua visível, só não abre o
  // BracoCavaquinho).
  const computeChordRects = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const svgTexts = Array.from(container.querySelectorAll("svg g.vf-text text"))
      .filter((t) => CHORD_TEXT_RE.test(t.textContent ?? ""))
    const matched: ChordRect[] = chordSeq
      .map((acorde, i) => {
        const el = svgTexts[i]
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { acorde, left: r.left - containerRect.left, top: r.top - containerRect.top, width: r.width, height: r.height }
      })
      .filter((c): c is ChordRect => c !== null)
    setChordRects(matched)
  }, [chordSeq])

  useEffect(() => {
    if (!xml || !containerRef.current) return
    let cancelled = false

    async function render() {
      const { OpenSheetMusicDisplay } = await import("opensheetmusicdisplay")
      const container = containerRef.current
      if (cancelled || !container) return
      container.innerHTML = ""

      const osmd = new OpenSheetMusicDisplay(container, {
        autoResize: true,
        backend: "svg",
        drawTitle: false,
        drawPartNames: false,
      })
      await osmd.load(xml as string)
      if (cancelled) return
      osmd.render()
      osmd.cursor.show()
      osmdRef.current = osmd

      computeChordRects()
    }

    render()
    return () => {
      cancelled = true
      osmdRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xml])

  // Recalcula as posições das cifras se a janela redimensionar (autoResize
  // do OSMD reflui o layout, o que muda a posição de cada símbolo).
  useEffect(() => {
    function onResize() { computeChordRects() }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [computeChordRects])

  // Sincronia: move o cursor nativo do OSMD até o compasso ativo, em vez do
  // overlay de % calculado à mão que a versão anterior usava.
  useEffect(() => {
    const osmd = osmdRef.current
    if (!osmd || !osmd.cursor) return
    if (activeMeasure < 0) { osmd.cursor.hide(); return }
    osmd.cursor.show()
    osmd.cursor.reset()
    for (let i = 0; i < activeMeasure; i++) osmd.cursor.nextMeasure()
  }, [activeMeasure])

  // Close popup when clicking outside
  useEffect(() => {
    if (selectedChord === null) return
    function handleClick() { setSelectedChord(null) }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [selectedChord])

  async function handlePlayChord(notas: string[]) {
    await initSampler()
    const pairs: [string, number][] = notas.map((n) => [TO_SHARP[n] ?? n, 4])
    playChord(pairs)
  }

  return (
    <div className="rounded-xl border border-white/5 bg-[#070b11] p-2">
      <div className="relative">
        <div ref={containerRef} className="w-full bg-white rounded overflow-x-auto select-none" style={{ userSelect: "none" }} />

        {/* Cifras clicáveis sobrepostas nas posições reais desenhadas pelo
            OSMD — abre o mesmo popup de braço/tocar que já existia. */}
        {chordRects.map((cr, i) => {
          const isOpen = selectedChord === i
          const notas = chordToNotes(cr.acorde)
          return (
            <div key={i} className="absolute" style={{ left: cr.left, top: cr.top, width: cr.width, height: cr.height }}>
              {isOpen && (
                <div
                  className="absolute bottom-full left-0 mb-1 z-50 bg-[#0d0920] border border-violet-500/40 rounded-xl p-3 shadow-2xl shadow-black/70"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-xs text-violet-300 font-mono text-center mb-2">{cr.acorde}</p>
                  <BracoCavaquinho chordNotes={notas} voicingIndex={0} />
                  <button
                    onClick={() => handlePlayChord(notas)}
                    className="mt-2 w-full text-[10px] text-violet-400 hover:text-violet-200 py-1 rounded bg-violet-600/20 hover:bg-violet-600/30 transition-colors"
                  >
                    ▶ tocar
                  </button>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedChord(isOpen ? null : i)
                }}
                className="w-full h-full cursor-pointer"
                title={cr.acorde}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
