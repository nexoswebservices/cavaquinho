"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { YoutubeEmbed } from "./YoutubeEmbed"
import { PlayerControls } from "./PlayerControls"
import { MedidaCard } from "./MedidaCard"

interface AcordeMedida {
  batida: number
  acorde: string
  duration: string
  notas: string[]
  tab: number[]
}

interface Medida {
  numero: number
  letra: string
  acordes: AcordeMedida[]
}

interface Estudo {
  id: string
  titulo: string
  artista: string
  youtubeId: string
  tom: string
  bpm: number
  compasso: string
  introSecs: number
  tabData: { medidas: Medida[] }
}

interface MusicaPlayerProps {
  estudo: Estudo
  isSaved: boolean
}

export function MusicaPlayer({ estudo, isSaved: initialSaved }: MusicaPlayerProps) {
  const ytPlayerRef = useRef<YT.Player | null>(null)
  const medidaRefs = useRef<(HTMLDivElement | null)[]>([])
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [speed, setSpeed] = useState(1)
  const [introSecs, setIntroSecs] = useState(estudo.introSecs)
  const [view, setView] = useState<"both" | "tab">("both")
  const [currentMeasure, setCurrentMeasure] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [saved, setSaved] = useState(initialSaved)

  const medidas: Medida[] = estudo.tabData?.medidas ?? []
  const beatsPerMeasure = estudo.compasso === "3/4" ? 3 : 4

  // Sync polling
  const startPolling = useCallback(() => {
    if (pollingRef.current) return
    pollingRef.current = setInterval(() => {
      const player = ytPlayerRef.current
      if (!player) return
      const t = player.getCurrentTime?.() ?? 0
      const beat = (t - introSecs) * (estudo.bpm / 60)
      const measure = Math.max(0, Math.floor(beat / beatsPerMeasure))
      setCurrentMeasure(measure)
    }, 100)
  }, [introSecs, estudo.bpm, beatsPerMeasure])

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  // Auto-scroll to active measure
  useEffect(() => {
    if (currentMeasure >= 0 && medidaRefs.current[currentMeasure]) {
      medidaRefs.current[currentMeasure]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    }
  }, [currentMeasure])

  // Restart polling when introSecs changes
  useEffect(() => {
    if (isPlaying) {
      stopPolling()
      startPolling()
    }
  }, [introSecs, isPlaying, startPolling, stopPolling])

  function handleSpeedChange(s: number) {
    setSpeed(s)
    ytPlayerRef.current?.setPlaybackRate(s)
  }

  function handleIntroSecsChange(v: number) {
    setIntroSecs(v)
    // Debounce save to DB
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current)
    saveDebounceRef.current = setTimeout(() => {
      fetch(`/api/musicas/${estudo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ introSecs: v }),
      })
    }, 1000)
  }

  function handlePlayerReady(player: YT.Player) {
    ytPlayerRef.current = player
  }

  function handleStateChange(state: number) {
    // YT.PlayerState: PLAYING=1, PAUSED=2, ENDED=0
    if (state === 1) {
      setIsPlaying(true)
      startPolling()
    } else {
      setIsPlaying(false)
      stopPolling()
    }
  }

  async function toggleSave() {
    const method = saved ? "DELETE" : "POST"
    const res = await fetch(`/api/musicas/${estudo.id}/salvar`, { method })
    if (res.ok) setSaved(!saved)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white leading-tight">{estudo.titulo}</h1>
          <p className="text-slate-400 text-sm">{estudo.artista}</p>
        </div>
        <button
          onClick={toggleSave}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-sm transition-colors ${
            saved
              ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
              : "bg-[#120d24] border-white/10 text-slate-400 hover:border-violet-500/30 hover:text-violet-300"
          }`}
        >
          {saved ? "♥ Salvo" : "♡ Salvar"}
        </button>
      </div>

      {/* Video + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <YoutubeEmbed
          youtubeId={estudo.youtubeId}
          onReady={handlePlayerReady}
          onStateChange={handleStateChange}
        />
        <PlayerControls
          speed={speed}
          onSpeedChange={handleSpeedChange}
          introSecs={introSecs}
          onIntroSecsChange={handleIntroSecsChange}
          view={view}
          onViewChange={setView}
          bpm={estudo.bpm}
          tom={estudo.tom}
        />
      </div>

      {/* Measures scroll */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
          {medidas.length} medidas
          {isPlaying && currentMeasure >= 0 && (
            <span className="ml-2 text-violet-400">· M{currentMeasure + 1}</span>
          )}
        </p>
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
          {medidas.map((m, i) => (
            <div
              key={m.numero}
              ref={(el) => { medidaRefs.current[i] = el }}
            >
              <MedidaCard
                numero={m.numero}
                letra={m.letra}
                acordes={m.acordes}
                isActive={i === currentMeasure}
                view={view}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
