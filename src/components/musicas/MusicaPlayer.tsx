"use client"
import { useRef, useState, useCallback, useEffect } from "react"
import { YoutubeEmbed } from "./YoutubeEmbed"
import { PlayerControls } from "./PlayerControls"
import { PartituraCompleta } from "./PartituraCompleta"

interface AcordeMedida {
  batida: number
  acorde: string
  duration: string
  notas: string[]
  tab: number[]
}

interface NotaEvento {
  duration: string
  nota?: string
  octave?: number
  string?: number
  fret?: number
}

// Medida "de cifra" (CifraClub/fallback): 1 shape de acorde batido por medida.
// Medida "de partitura": sequência de notas reais (eventos), lidas de verdade
// — nunca as duas coisas juntas na mesma música (uma música inteira é gerada
// por UMA fonte só).
type Medida =
  | { numero: number; letra: string; acordes: AcordeMedida[] }
  | { numero: number; letra: string; acordeReferencia?: string; eventos: NotaEvento[] }

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
}

export function MusicaPlayer({ estudo }: MusicaPlayerProps) {
  const ytPlayerRef = useRef<YT.Player | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [speed, setSpeed] = useState(1)
  const [introSecs, setIntroSecs] = useState(estudo.introSecs)
  const [view, setView] = useState<"both" | "tab">("both")
  const [currentMeasure, setCurrentMeasure] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)

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

  // Scroll handled inside PartituraCompleta

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white leading-tight">{estudo.titulo}</h1>
        <p className="text-slate-400 text-sm">{estudo.artista}</p>
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

      {/* Partitura contínua */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
          {medidas.length} {medidas.length === 1 ? "medida" : "medidas"}
          {isPlaying && currentMeasure >= 0 && (
            <span className="ml-2 text-violet-400">· M{currentMeasure + 1}</span>
          )}
        </p>
        <PartituraCompleta
          medidas={medidas}
          activeMeasure={currentMeasure}
          view={view}
          compasso={estudo.compasso}
        />
      </div>

    </div>
  )
}
