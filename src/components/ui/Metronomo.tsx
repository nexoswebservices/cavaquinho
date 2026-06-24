"use client"

import { useState, useRef, useCallback, useEffect } from "react"

const TIME_SIGNATURES = [
  { label: "4/4", beats: 4 },
  { label: "3/4", beats: 3 },
  { label: "2/4", beats: 2 },
  { label: "6/8", beats: 6 },
]

const MIN_BPM = 40
const MAX_BPM = 220

export function Metronomo() {
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [timeSigIdx, setTimeSigIdx] = useState(0)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [volume, setVolume] = useState(70)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number | null>(null)
  const nextBeatTimeRef = useRef(0)
  const beatRef = useRef(0)
  const playingRef = useRef(false)
  const volumeRef = useRef(volume)
  volumeRef.current = volume

  const timeSig = TIME_SIGNATURES[timeSigIdx]

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }, [])

  const playClick = useCallback((time: number, isAccent: boolean) => {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    const vol = volumeRef.current / 100
    osc.frequency.value = isAccent ? 1000 : 700
    gain.gain.value = (isAccent ? 0.5 : 0.3) * vol

    osc.start(time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08)
    osc.stop(time + 0.08)
  }, [getAudioCtx])

  const scheduler = useCallback(() => {
    const ctx = getAudioCtx()
    const lookahead = 0.1
    const scheduleInterval = 25

    while (nextBeatTimeRef.current < ctx.currentTime + lookahead) {
      const isAccent = beatRef.current === 0
      playClick(nextBeatTimeRef.current, isAccent)

      const beatNum = beatRef.current
      const beatTime = nextBeatTimeRef.current
      const delay = (beatTime - ctx.currentTime) * 1000
      setTimeout(() => {
        if (playingRef.current) {
          setCurrentBeat(beatNum)
        }
      }, Math.max(0, delay))

      const secondsPerBeat = 60.0 / bpm
      nextBeatTimeRef.current += secondsPerBeat
      beatRef.current = (beatRef.current + 1) % timeSig.beats
    }

    if (playingRef.current) {
      timerRef.current = window.setTimeout(scheduler, scheduleInterval)
    }
  }, [bpm, timeSig.beats, playClick, getAudioCtx])

  const start = useCallback(() => {
    const ctx = getAudioCtx()
    if (ctx.state === "suspended") ctx.resume()

    beatRef.current = 0
    nextBeatTimeRef.current = ctx.currentTime + 0.05
    playingRef.current = true
    setPlaying(true)
    setCurrentBeat(0)
    scheduler()
  }, [getAudioCtx, scheduler])

  const stop = useCallback(() => {
    playingRef.current = false
    setPlaying(false)
    setCurrentBeat(0)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Restart scheduler when bpm or time sig changes during playback
  useEffect(() => {
    if (playing) {
      stop()
      setTimeout(() => start(), 50)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm, timeSigIdx])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playingRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Tap tempo
  const tapsRef = useRef<number[]>([])
  const handleTap = useCallback(() => {
    const now = Date.now()
    const taps = tapsRef.current

    if (taps.length > 0 && now - taps[taps.length - 1] > 2000) {
      taps.length = 0
    }

    taps.push(now)
    if (taps.length > 5) taps.shift()

    if (taps.length >= 2) {
      const intervals = []
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1])
      }
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const newBpm = Math.round(60000 / avgMs)
      setBpm(Math.max(MIN_BPM, Math.min(MAX_BPM, newBpm)))
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Panel */}
      {open && (
        <div className="bg-[#120d24] border border-violet-500/30 rounded-2xl p-5 shadow-2xl shadow-violet-900/30 w-72">
          {/* BPM display */}
          <div className="text-center mb-4">
            <p className="text-xs text-slate-500 mb-1">BPM</p>
            <p className="text-3xl font-bold font-mono text-white">{bpm}</p>
          </div>

          {/* BPM controls */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setBpm((b) => Math.max(MIN_BPM, b - 5))}
              className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white text-lg font-bold transition-colors"
            >
              −
            </button>
            <input
              type="range"
              min={MIN_BPM}
              max={MAX_BPM}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-violet-500"
            />
            <button
              onClick={() => setBpm((b) => Math.min(MAX_BPM, b + 5))}
              className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>

          {/* Tap tempo */}
          <button
            onClick={handleTap}
            className="w-full py-2 rounded-xl text-xs font-medium bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors mb-4"
          >
            Tap Tempo
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-slate-500">🔈</span>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-violet-500"
            />
            <span className="text-xs text-slate-500 w-7 text-right">{volume}%</span>
          </div>

          {/* Time signature */}
          <div className="flex gap-1.5 mb-5">
            {TIME_SIGNATURES.map((ts, i) => (
              <button
                key={ts.label}
                onClick={() => setTimeSigIdx(i)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  timeSigIdx === i
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {ts.label}
              </button>
            ))}
          </div>

          {/* Beat indicators */}
          {playing && (
            <div className="flex justify-center gap-2 mb-4">
              {Array.from({ length: timeSig.beats }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentBeat === i
                      ? i === 0
                        ? "bg-violet-400 scale-125"
                        : "bg-amber-400 scale-110"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Start/Stop */}
          <button
            onClick={playing ? stop : start}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
              playing
                ? "bg-rose-600 hover:bg-rose-500 text-white"
                : "bg-violet-600 hover:bg-violet-500 text-white"
            }`}
          >
            {playing ? "PARAR" : "INICIAR"}
          </button>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
          playing
            ? "bg-violet-600 text-white shadow-violet-600/40 animate-pulse"
            : open
              ? "bg-violet-600 text-white shadow-violet-600/30"
              : "bg-[#120d24] border border-violet-500/30 text-violet-300 hover:bg-violet-600/20 shadow-black/30"
        }`}
        title="Metrônomo"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 1.5L6 22.5h12L12 1.5zM11 6l1.5-2L14 6l-1 10h-1L11 6zm1 12a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
        </svg>
      </button>
    </div>
  )
}
