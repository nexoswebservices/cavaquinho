const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

const SAMPLE_MAP: Record<string, { file: string; midi: number }> = {
  A3:   { file: "A3.wav",   midi: 57 },
  "A#3": { file: "A%233.wav", midi: 58 },
  B3:   { file: "B3.wav",   midi: 59 },
  B4:   { file: "B4.wav",   midi: 71 },
  "C#4": { file: "C%234.wav", midi: 61 },
  "C#5": { file: "C%235.wav", midi: 73 },
  D3:   { file: "D3.wav",   midi: 50 },
  D4:   { file: "D4.wav",   midi: 62 },
  D5:   { file: "D5.wav",   midi: 74 },
  E3:   { file: "E3.wav",   midi: 52 },
  E4:   { file: "E4.wav",   midi: 64 },
  E5:   { file: "E5.wav",   midi: 76 },
  "F#3": { file: "F%233.wav", midi: 54 },
  "F#4": { file: "F%234.wav", midi: 66 },
  "F#5": { file: "F%235.wav", midi: 78 },
  G3:   { file: "G3.wav",   midi: 55 },
  "G#3": { file: "G%233.wav", midi: 56 },
}

function noteToMidi(note: string, octave: number): number {
  const n = CHROMATIC.indexOf(note)
  if (n === -1) return 60
  return (octave + 1) * 12 + n
}

function findNearestSample(midi: number): { key: string; midi: number } {
  let best = ""
  let bestDist = Infinity
  for (const [key, info] of Object.entries(SAMPLE_MAP)) {
    const dist = Math.abs(info.midi - midi)
    if (dist < bestDist) {
      bestDist = dist
      best = key
    }
  }
  return { key: best, midi: SAMPLE_MAP[best].midi }
}

let audioCtx: AudioContext | null = null
const buffers: Record<string, AudioBuffer> = {}
let loading = false
let loaded = false

export function isReady(): boolean {
  return loaded
}

export async function initSampler(): Promise<void> {
  if (loaded || loading) return
  loading = true

  audioCtx = new AudioContext()

  const entries = Object.entries(SAMPLE_MAP)
  await Promise.all(
    entries.map(async ([key, info]) => {
      const url = `/samples/cavaquinho/${info.file}`
      const resp = await fetch(url)
      const arrayBuf = await resp.arrayBuffer()
      buffers[key] = await audioCtx!.decodeAudioData(arrayBuf)
    })
  )

  loaded = true
  loading = false
}

export function playNote(note: string, octave: number): void {
  if (!audioCtx || !loaded) return

  const targetMidi = noteToMidi(note, octave)
  const nearest = findNearestSample(targetMidi)
  const buffer = buffers[nearest.key]
  if (!buffer) return

  const source = audioCtx.createBufferSource()
  source.buffer = buffer

  const semitoneDiff = targetMidi - nearest.midi
  source.playbackRate.value = Math.pow(2, semitoneDiff / 12)

  const gain = audioCtx.createGain()
  gain.gain.value = 0.7
  source.connect(gain)
  gain.connect(audioCtx.destination)

  source.start()
}

export function playChord(notes: [string, number][]): void {
  for (const [note, octave] of notes) {
    playNote(note, octave)
  }
}

let arpejoTimer: number | null = null

export function playArpejo(
  notes: [string, number][],
  bpm: number,
  pattern: number[],
): void {
  if (!audioCtx || !loaded) return
  stopArpejo()

  const interval = (60 / bpm) * 1000
  let i = 0

  const tick = () => {
    const idx = pattern[i % pattern.length]
    const note = notes[Math.min(idx, notes.length - 1)]
    if (note) playNote(note[0], note[1])
    i++
    if (i < pattern.length) {
      arpejoTimer = window.setTimeout(tick, interval)
    }
  }

  tick()
}

export function stopArpejo(): void {
  if (arpejoTimer !== null) {
    clearTimeout(arpejoTimer)
    arpejoTimer = null
  }
}

let backingTimer: number | null = null
let backingPlaying = false

export function playBackingTrack(
  chords: [string, number][][],
  bpm: number,
  beatsPerChord: number,
): { stop: () => void } {
  if (!audioCtx || !loaded) return { stop: () => {} }
  stopBackingTrack()
  backingPlaying = true

  const beatInterval = (60 / bpm) * 1000
  let chordIdx = 0
  let beat = 0

  const tick = () => {
    if (!backingPlaying) return
    if (beat === 0) {
      const chord = chords[chordIdx % chords.length]
      playChord(chord)
    }
    beat++
    if (beat >= beatsPerChord) {
      beat = 0
      chordIdx++
      if (chordIdx >= chords.length) chordIdx = 0
    }
    backingTimer = window.setTimeout(tick, beatInterval)
  }

  tick()
  return { stop: stopBackingTrack }
}

export function stopBackingTrack(): void {
  backingPlaying = false
  if (backingTimer !== null) {
    clearTimeout(backingTimer)
    backingTimer = null
  }
}

export function stopAll(): void {
  stopArpejo()
  stopBackingTrack()
  if (audioCtx) {
    audioCtx.close()
    audioCtx = null
    loaded = false
    loading = false
    Object.keys(buffers).forEach((k) => delete buffers[k])
  }
}
