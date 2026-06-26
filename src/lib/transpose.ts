const CHROMATIC_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const CHROMATIC_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

const FLAT_KEYS = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb", "Dm", "Gm", "Cm", "Fm"])

const TO_SHARP: Record<string, string> = {
  Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#",
}

const CHORD_RE = /\b([A-G][#b]?)([ºø]?(?:m|maj|min|dim|aug|sus|add)?\d*[ºø+\-]?M?(?:[b#]\d+[+-]?)*(?:\([^)]*\))?(?:\/[#b+-]?\d+[+-]?[#b]?)*)(\/([A-G][#b]?))?\b/g

function noteIndex(note: string): number {
  const n = TO_SHARP[note] ?? note
  const idx = CHROMATIC_SHARP.indexOf(n)
  return idx === -1 ? 0 : idx
}

function shiftNote(note: string, semitones: number, useFlats: boolean): string {
  const idx = noteIndex(note)
  const newIdx = ((idx + semitones) % 12 + 12) % 12
  return useFlats ? CHROMATIC_FLAT[newIdx] : CHROMATIC_SHARP[newIdx]
}

export function transposeChord(chord: string, semitones: number, useFlats = false): string {
  if (semitones === 0) return chord

  return chord.replace(CHORD_RE, (_match, root: string, quality: string, bassSlash: string, bassNote: string) => {
    const newRoot = shiftNote(root, semitones, useFlats)
    let result = newRoot + (quality ?? "")
    if (bassNote) {
      const newBass = shiftNote(bassNote, semitones, useFlats)
      result += "/" + newBass
    }
    return result
  })
}

export function transposeLine(line: string, semitones: number, useFlats = false): string {
  if (semitones === 0) return line

  let result = ""
  let lastIdx = 0

  const re = new RegExp(CHORD_RE.source, "g")
  let m: RegExpExecArray | null

  while ((m = re.exec(line)) !== null) {
    result += line.slice(lastIdx, m.index)

    const original = m[0]
    const transposed = transposeChord(original, semitones, useFlats)

    const lenDiff = transposed.length - original.length
    result += transposed

    if (lenDiff < 0) {
      result += " ".repeat(-lenDiff)
    }

    lastIdx = m.index + original.length

    if (lenDiff > 0) {
      let spacesAfter = 0
      while (lastIdx + spacesAfter < line.length && line[lastIdx + spacesAfter] === " ") {
        spacesAfter++
      }
      const trimSpaces = Math.min(lenDiff, spacesAfter)
      lastIdx += trimSpaces
    }
  }

  result += line.slice(lastIdx)
  return result
}

export function transposeContent(content: string, semitones: number, originalKey?: string): string {
  if (semitones === 0) return content

  const targetKeyIdx = originalKey ? ((noteIndex(originalKey) + semitones) % 12 + 12) % 12 : -1
  const useFlats = originalKey
    ? FLAT_KEYS.has(CHROMATIC_FLAT[targetKeyIdx]) || FLAT_KEYS.has(CHROMATIC_SHARP[targetKeyIdx])
    : false

  return content
    .split("\n")
    .map((line) => transposeLine(line, semitones, useFlats))
    .join("\n")
}

export function getTransposedKey(originalKey: string, semitones: number): string {
  if (!originalKey || semitones === 0) return originalKey

  const isMinor = originalKey.endsWith("m") && !originalKey.endsWith("dim")
  const root = isMinor ? originalKey.slice(0, -1) : originalKey
  const idx = noteIndex(root)
  const newIdx = ((idx + semitones) % 12 + 12) % 12

  const useFlats = FLAT_KEYS.has(originalKey)
  const newRoot = useFlats ? CHROMATIC_FLAT[newIdx] : CHROMATIC_SHARP[newIdx]
  return newRoot + (isMinor ? "m" : "")
}
