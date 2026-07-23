// Serializa o formato de dados já validado do pipeline (Medida "de cifra" ou
// "de partitura", ver src/lib/tab-checkpoints.ts) em MusicXML, pra ser
// renderizado pelo OpenSheetMusicDisplay — motor de layout automático que
// substitui o posicionamento manual em PartituraCompleta.tsx (armadura de
// clave, feixes, espaçamento e símbolos de cifra passam a ser resolvidos
// pela própria lib, não calculados à mão).
import { parseChordSymbol, notaParaCordaTraste } from "./cavaquinho-tab"
import type { Medida, MedidaEventos } from "./tab-checkpoints"

type MedidaAny = Medida | MedidaEventos

// Cavaquinho: corda 1 = D5 (mais aguda) .. corda 4 = D4 (mais grave) — mesma
// convenção de notaParaCordaTraste/nandinho-numeric-tab. Linha 1 do
// staff-details é a linha de BAIXO da pauta, então a corda mais grave (D4)
// fica na linha 1 e a mais aguda (D5) na linha 4 (topo).
const TAB_TUNING: { line: number; step: string; alter?: number; octave: number }[] = [
  { line: 1, step: "D", octave: 4 },
  { line: 2, step: "G", octave: 4 },
  { line: 3, step: "B", octave: 4 },
  { line: 4, step: "D", octave: 5 },
]

// Quantidade de fifths (círculo das quintas) por tom — positivo = sustenidos,
// negativo = bemóis. Cobre os tons que aparecem no repertório de samba/choro
// (CifraClub/nandinhocavaco); tom não reconhecido cai em dó maior (0).
const FIFTHS_BY_KEY: Record<string, number> = {
  C: 0, Am: 0,
  G: 1, Em: 1,
  D: 2, Bm: 2,
  A: 3, "F#m": 3,
  E: 4, "C#m": 4,
  B: 5, "G#m": 5,
  "F#": 6, "D#m": 6,
  "C#": 7, "A#m": 7,
  F: -1, Dm: -1,
  Bb: -2, Gm: -2,
  Eb: -3, Cm: -3,
  Ab: -4, Fm: -4,
  Db: -5, Bbm: -5,
  Gb: -6, Ebm: -6,
  Cb: -7, Abm: -7,
}

const DURATION_DIVISIONS: Record<string, number> = { w: 16, h: 8, q: 4, "8": 2, "16": 1 }
const DURATION_TYPE: Record<string, string> = { w: "whole", h: "half", q: "quarter", "8": "eighth", "16": "16th" }
const DIVISIONS = 4

// Tons que usam bemol na armadura de clave — fora daqui assume sustenido.
// As fontes de nota (nandinho-numeric-tab, notaParaCordaTraste) só emitem
// nomes com sustenido (ex "A#"); sem isso toda nota acidental aparecia como
// sustenido não importa o tom, o que o usuário reportou como "símbolos
// errados" (ex: Dm deveria mostrar Bb, não A#).
const FLAT_KEYS = new Set([
  "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb",
  "Dm", "Gm", "Cm", "Fm", "Bbm", "Ebm", "Abm",
])
const SHARP_TO_FLAT: Record<string, string> = { "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb" }

function spellForKey(nota: string, tom: string): string {
  if (!SHARP_TO_FLAT[nota]) return nota
  return FLAT_KEYS.has(tom) ? SHARP_TO_FLAT[nota] : nota
}

const STEP_INFO: Record<string, { step: string; alter: number }> = {
  C: { step: "C", alter: 0 }, "C#": { step: "C", alter: 1 }, Db: { step: "D", alter: -1 },
  D: { step: "D", alter: 0 }, "D#": { step: "D", alter: 1 }, Eb: { step: "E", alter: -1 },
  E: { step: "E", alter: 0 },
  F: { step: "F", alter: 0 }, "F#": { step: "F", alter: 1 }, Gb: { step: "G", alter: -1 },
  G: { step: "G", alter: 0 }, "G#": { step: "G", alter: 1 }, Ab: { step: "A", alter: -1 },
  A: { step: "A", alter: 0 }, "A#": { step: "A", alter: 1 }, Bb: { step: "B", alter: -1 },
  B: { step: "B", alter: 0 },
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function pitchXml(nota: string, octave: number): string {
  const info = STEP_INFO[nota] ?? { step: nota[0] ?? "C", alter: 0 }
  const alterXml = info.alter !== 0 ? `<alter>${info.alter}</alter>` : ""
  return `<pitch><step>${info.step}</step>${alterXml}<octave>${octave}</octave></pitch>`
}

function harmonyXml(simbolo: string): string {
  // root-step/root-alter a partir do próprio símbolo (primeira letra + acidente),
  // não do rootIdx numérico — preserva a grafia original da cifra (ex: "Bb", não "A#").
  const m = simbolo.match(/^([A-G])([b#]?)/)
  const step = m ? m[1] : "C"
  const alter = m?.[2] === "#" ? 1 : m?.[2] === "b" ? -1 : 0
  const alterXml = alter !== 0 ? `<root-alter>${alter}</root-alter>` : ""
  const kind = harmonyKind(simbolo)
  return `<harmony><root><root-step>${step}</root-step>${alterXml}</root><kind>${kind}</kind></harmony>`
}

// MusicXML <kind> só precisa ser plausível pro OSMD desenhar o símbolo (ele
// reusa o texto original via <kind text="...">), não afeta o áudio nem a
// validação — validarAcorde (tab-checkpoints.ts) já garantiu que o símbolo é
// reconhecido antes de chegar aqui.
function harmonyKind(simbolo: string): string {
  const parsed = parseChordSymbol(simbolo)
  const quality = parsed?.quality ?? "major"
  const map: Record<string, string> = {
    major: "major", minor: "minor", dom7: "dominant", maj7: "major-seventh",
    min7: "minor-seventh", dim: "diminished", halfdim: "half-diminished",
    aug: "augmented", sus2: "suspended-second", sus4: "suspended-fourth",
  }
  return map[quality] ?? "major"
}

interface EventoNormalizado {
  duration: string
  nota: string
  octave: number
  string?: number
  fret?: number
}

function eventosDaMedida(m: MedidaAny): EventoNormalizado[] {
  if ("eventos" in m) {
    return m.eventos
      .filter((e): e is typeof e & { nota: string; octave: number } => typeof e.nota === "string" && typeof e.octave === "number")
      .map((e) => ({ duration: e.duration, nota: e.nota, octave: e.octave, string: e.string, fret: e.fret }))
  }
  return m.acordes.map((a) => {
    const nota = a.notas[0] ?? "C"
    const pos = notaParaCordaTraste(nota, 4) ?? undefined
    return { duration: a.duration, nota, octave: 4, string: pos?.string, fret: pos?.fret }
  })
}

function acordeReferenciaDaMedida(m: MedidaAny): string | undefined {
  if ("eventos" in m) return m.acordeReferencia
  return m.acordes[0]?.acorde
}

// Sequência, na mesma ordem em que o OSMD desenha (por compasso, esquerda pra
// direita), das cifras de referência que realmente viram <harmony> no XML —
// usado pra casar cada símbolo de cifra renderizado (via DOM, ver
// PartituraCompleta.tsx) com o compasso/acorde correspondente, pro clique
// abrir o BracoCavaquinho certo.
export function medidaChordSequence(medidas: MedidaAny[]): string[] {
  return medidas
    .map(acordeReferenciaDaMedida)
    .filter((a): a is string => !!a && !!parseChordSymbol(a))
}

// Converte as medidas já validadas (parser de tablatura numérica ou
// Vision-OMR, nunca dados inventados) num MusicXML partwise pronto pro OSMD
// renderizar. Por padrão gera 2 pautas (notação + TAB de 4 cordas); com
// `somenteTab` gera só a pauta de TAB (usado pela view "tab" da UI).
export function medidasToMusicXML(
  medidas: MedidaAny[],
  meta: { tom: string; compasso: string; somenteTab?: boolean }
): string {
  const fifths = FIFTHS_BY_KEY[meta.tom] ?? 0
  const [beatsStr, beatTypeStr] = meta.compasso.split("/")
  const beats = Number(beatsStr) || 4
  const beatType = Number(beatTypeStr) || 4
  const dualStaff = !meta.somenteTab

  const measuresXml = medidas.map((m, mi) => {
    const eventos = eventosDaMedida(m).map((e) => ({ ...e, nota: spellForKey(e.nota, meta.tom) }))
    const acordeRef = acordeReferenciaDaMedida(m)

    const tabClef = dualStaff
      ? `<clef number="2"><sign>TAB</sign><line>5</line></clef>`
      : `<clef><sign>TAB</sign><line>5</line></clef>`
    const tabStaffDetails = dualStaff ? ` number="2"` : ""

    const attributesXml =
      mi === 0
        ? `<attributes>
            <divisions>${DIVISIONS}</divisions>
            <key><fifths>${fifths}</fifths></key>
            <time><beats>${beats}</beats><beat-type>${beatType}</beat-type></time>
            ${dualStaff ? "<staves>2</staves>" : ""}
            ${dualStaff ? `<clef number="1"><sign>G</sign><line>2</line></clef>` : ""}
            ${tabClef}
            <staff-details${tabStaffDetails}>
              <staff-lines>4</staff-lines>
              ${TAB_TUNING.map((t) => `<staff-tuning line="${t.line}"><tuning-step>${t.step}</tuning-step><tuning-octave>${t.octave}</tuning-octave></staff-tuning>`).join("\n              ")}
            </staff-details>
          </attributes>`
        : ""

    const harmony = acordeRef && parseChordSymbol(acordeRef) ? harmonyXml(acordeRef) : ""

    const staffDuration = (e: EventoNormalizado) => DURATION_DIVISIONS[e.duration] ?? DURATION_DIVISIONS.q
    const totalDivisions = eventos.reduce((sum, e) => sum + staffDuration(e), 0)

    // Letra da música anexada na 1ª nota do compasso como <lyric> de verdade
    // — o OSMD já alinha isso automaticamente por nota, sem precisar de uma
    // linha HTML separada tentando casar largura com o layout automático.
    const letra = "letra" in m ? m.letra : undefined

    function notaXml(e: EventoNormalizado, staff: number, lyric?: string): string {
      const type = DURATION_TYPE[e.duration] ?? "quarter"
      const dur = staffDuration(e)
      // Corda 1=D5 (aguda)..4=D4 (grave), mesma convenção de notaParaCordaTraste —
      // e o <string> do MusicXML também numera 1 = corda mais aguda, então é
      // identidade, sem conversão.
      const technical =
        e.string && e.fret !== undefined
          ? `<notations><technical><string>${e.string}</string><fret>${e.fret}</fret></technical></notations>`
          : ""
      const staffXml = dualStaff ? `<staff>${staff}</staff>` : ""
      const lyricXml = lyric ? `<lyric><syllable>single</syllable><text>${escapeXml(lyric)}</text></lyric>` : ""
      return `<note>${pitchXml(e.nota, e.octave)}<duration>${dur}</duration><type>${type}</type>${staffXml}${technical}${lyricXml}</note>`
    }

    if (!dualStaff) {
      const notes = eventos.map((e, i) => notaXml(e, 1, i === 0 ? letra : undefined)).join("\n")
      return `<measure number="${mi + 1}">${attributesXml}${harmony}${notes}</measure>`
    }

    const staff1Notes = eventos.map((e, i) => notaXml(e, 1, i === 0 ? letra : undefined)).join("\n")
    const backup = totalDivisions > 0 ? `<backup><duration>${totalDivisions}</duration></backup>` : ""
    const staff2Notes = eventos.map((e) => notaXml(e, 2)).join("\n")

    return `<measure number="${mi + 1}">
      ${attributesXml}
      ${harmony}
      ${staff1Notes}
      ${backup}
      ${staff2Notes}
    </measure>`
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1"><part-name>Cavaquinho</part-name></score-part>
  </part-list>
  <part id="P1">
    ${measuresXml.join("\n")}
  </part>
</score-partwise>`
}
