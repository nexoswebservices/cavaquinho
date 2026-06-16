const CHORD_TOKEN =
  /^[A-G](#|b)?(maj|min|dim|aug|sus|add|m)?\d*(\([^)]*\))?(\/[A-G](#|b)?\d*)?[ºø+\-]*$/i
const TAB_LINE = /^[A-G]\|[-\d xh/]*\|?$/i
const SECTION_LINE = /^[[(].*[\])]$/

function isChordLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (TAB_LINE.test(trimmed)) return true
  const tokens = trimmed.split(/\s+/)
  return tokens.every((t) => CHORD_TOKEN.test(t))
}

export function ChordSheet({ conteudo }: { conteudo: string }) {
  const lines = conteudo.split("\n")

  return (
    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-x-auto bg-[#0a0714] border border-white/5 rounded-xl p-4">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return "\n"
        if (SECTION_LINE.test(trimmed)) {
          return (
            <span key={i} className="text-slate-500 italic">
              {line}
              {"\n"}
            </span>
          )
        }
        if (isChordLine(line)) {
          return (
            <span key={i} className="text-violet-300 font-bold">
              {line}
              {"\n"}
            </span>
          )
        }
        return (
          <span key={i} className="text-slate-300">
            {line}
            {"\n"}
          </span>
        )
      })}
    </pre>
  )
}
