"use client"

import { useState, useRef, useCallback, useEffect } from "react"

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

// Cavaquinho D-G-B-D
const CAVAQUINHO_STRINGS = [
  { note: "D", octave: 4, freq: 293.66, label: "1ª corda (Ré)" },
  { note: "B", octave: 3, freq: 246.94, label: "2ª corda (Si)" },
  { note: "G", octave: 3, freq: 196.00, label: "3ª corda (Sol)" },
  { note: "D", octave: 3, freq: 146.83, label: "4ª corda (Ré)" },
]

function freqToNote(freq: number): { note: string; octave: number; cents: number } {
  const midi = 69 + 12 * Math.log2(freq / 440)
  const midiRound = Math.round(midi)
  const cents = Math.round((midi - midiRound) * 100)
  const noteIdx = ((midiRound % 12) + 12) % 12
  const octave = Math.floor(midiRound / 12) - 1
  return { note: NOTE_NAMES[noteIdx], octave, cents }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function autoCorrelate(input: any, sampleRate: number): number {
  let size = input.length
  let rms = 0
  for (let i = 0; i < size; i++) rms += input[i] * input[i]
  rms = Math.sqrt(rms / size)
  if (rms < 0.01) return -1

  let r1 = 0
  let r2 = size - 1
  const threshold = 0.2
  for (let i = 0; i < size / 2; i++) {
    if (Math.abs(input[i]) < threshold) { r1 = i; break }
  }
  for (let i = 1; i < size / 2; i++) {
    if (Math.abs(input[size - i]) < threshold) { r2 = size - i; break }
  }

  const buf = input.slice(r1, r2)
  size = buf.length

  const c = new Float32Array(size)
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size - i; j++) {
      c[i] += buf[j] * buf[j + i]
    }
  }

  let d = 0
  while (c[d] > c[d + 1]) d++

  let maxVal = -1
  let maxPos = -1
  for (let i = d; i < size; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i]
      maxPos = i
    }
  }

  let T0 = maxPos
  const x1 = c[T0 - 1]
  const x2 = c[T0]
  const x3 = c[T0 + 1]
  const a = (x1 + x3 - 2 * x2) / 2
  const b = (x3 - x1) / 2
  if (a) T0 = T0 - b / (2 * a)

  return sampleRate / T0
}

export function Afinador() {
  const [listening, setListening] = useState(false)
  const [frequency, setFrequency] = useState(0)
  const [detectedNote, setDetectedNote] = useState("")
  const [detectedOctave, setDetectedOctave] = useState(0)
  const [cents, setCents] = useState(0)
  const [targetString, setTargetString] = useState(0)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const bufRef = useRef<Float32Array<ArrayBuffer> | null>(null)

  const detect = useCallback(() => {
    const analyser = analyserRef.current
    const buf = bufRef.current
    const ctx = audioCtxRef.current
    if (!analyser || !buf || !ctx) return
    analyser.getFloatTimeDomainData(buf)
    const freq = autoCorrelate(buf, ctx.sampleRate)

    if (freq > 0 && freq < 2000) {
      setFrequency(Math.round(freq * 10) / 10)
      const { note, octave, cents: c } = freqToNote(freq)
      setDetectedNote(note)
      setDetectedOctave(octave)
      setCents(c)
    }

    rafRef.current = requestAnimationFrame(detect)
  }, [])

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = new AudioContext()
      audioCtxRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 4096
      source.connect(analyser)
      analyserRef.current = analyser

      bufRef.current = new Float32Array(analyser.fftSize)
      setListening(true)
      detect()
    } catch {
      alert("Não foi possível acessar o microfone.")
    }
  }, [detect])

  const stopListening = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
    analyserRef.current = null
    setListening(false)
    setFrequency(0)
    setDetectedNote("")
    setCents(0)
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      if (audioCtxRef.current) audioCtxRef.current.close()
    }
  }, [])

  const target = CAVAQUINHO_STRINGS[targetString]
  const isInTune = listening && detectedNote === target.note && Math.abs(cents) <= 5

  const centsColor = Math.abs(cents) <= 5
    ? "text-emerald-400"
    : Math.abs(cents) <= 15
      ? "text-amber-400"
      : "text-rose-400"

  const needleRotation = Math.max(-45, Math.min(45, cents * 0.9))

  return (
    <div className="space-y-4">
      {/* Cordas do cavaquinho */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Corda</p>
        <div className="grid grid-cols-4 gap-1.5">
          {CAVAQUINHO_STRINGS.map((s, i) => (
            <button
              key={i}
              onClick={() => setTargetString(i)}
              className={`py-2 rounded-xl text-center transition-colors ${
                targetString === i
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <p className="text-sm font-bold font-mono">{s.note}{s.octave}</p>
              <p className="text-[10px] opacity-60">{s.freq.toFixed(0)}Hz</p>
            </button>
          ))}
        </div>
      </div>

      {/* Indicador visual */}
      <div className="bg-[#0a0714] border border-white/5 rounded-xl p-5">
        {/* Gauge */}
        <div className="relative flex justify-center mb-4">
          <svg viewBox="0 0 200 110" className="w-full max-w-[220px]">
            {/* Arco de fundo */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#1e1b4b"
              strokeWidth={8}
              strokeLinecap="round"
            />
            {/* Zona verde central */}
            <path
              d="M 93 24 A 80 80 0 0 1 107 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth={8}
              strokeLinecap="round"
            />
            {/* Marcas */}
            <text x="15" y="108" fontSize="10" fill="#64748b">-50</text>
            <text x="92" y="16" fontSize="10" fill="#22c55e" textAnchor="middle">0</text>
            <text x="175" y="108" fontSize="10" fill="#64748b">+50</text>

            {/* Agulha */}
            {listening && detectedNote && (
              <line
                x1="100"
                y1="100"
                x2={100 + 70 * Math.sin((needleRotation * Math.PI) / 180)}
                y2={100 - 70 * Math.cos((needleRotation * Math.PI) / 180)}
                stroke={isInTune ? "#22c55e" : Math.abs(cents) <= 15 ? "#eab308" : "#ef4444"}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            )}
            <circle cx="100" cy="100" r="4" fill="#a78bfa" />
          </svg>
        </div>

        {/* Nota detectada */}
        <div className="text-center">
          {listening && detectedNote ? (
            <>
              <p className={`text-4xl font-bold font-mono ${isInTune ? "text-emerald-400" : "text-white"}`}>
                {detectedNote}{detectedOctave}
              </p>
              <p className={`text-lg font-mono ${centsColor}`}>
                {cents > 0 ? "+" : ""}{cents} cents
              </p>
              <p className="text-xs text-slate-500 mt-1">{frequency} Hz</p>
              {isInTune && (
                <p className="text-emerald-400 text-sm font-semibold mt-2">Afinado!</p>
              )}
            </>
          ) : (
            <p className="text-slate-500 text-sm">
              {listening ? "Toque uma corda..." : "Clique em Iniciar para afinar"}
            </p>
          )}
        </div>
      </div>

      {/* Target info */}
      <div className="text-center text-xs text-slate-500">
        Alvo: <span className="text-violet-300 font-mono font-bold">{target.note}{target.octave}</span>
        {" "}({target.freq.toFixed(1)} Hz) — {target.label}
      </div>

      {/* Start/Stop */}
      <button
        onClick={listening ? stopListening : startListening}
        className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
          listening
            ? "bg-rose-600 hover:bg-rose-500 text-white"
            : "bg-violet-600 hover:bg-violet-500 text-white"
        }`}
      >
        {listening ? "PARAR" : "INICIAR"}
      </button>
    </div>
  )
}
