export interface ArpejoPattern {
  id: string
  nome: string
  descricao: string
  sequence: number[] // índices das notas do acorde
  durations: string[] // VexFlow durations
  dica: string
}

export const ARPEJO_PATTERNS: ArpejoPattern[] = [
  {
    id: "asc",
    nome: "Ascendente",
    descricao: "Toca as notas do acorde de baixo para cima. O padrão mais fundamental.",
    sequence: [0, 1, 2],
    durations: ["8", "8", "8"],
    dica: "Mantenha os dedos posicionados no shape do acorde enquanto arpeja.",
  },
  {
    id: "desc",
    nome: "Descendente",
    descricao: "Toca as notas do acorde de cima para baixo. Cria sensação de resolução.",
    sequence: [2, 1, 0],
    durations: ["8", "8", "8"],
    dica: "Use o polegar para as cordas graves e indicador/médio para as agudas.",
  },
  {
    id: "alt",
    nome: "Alternado",
    descricao: "Sobe e desce pelo acorde. Cria movimento contínuo, muito usado no samba.",
    sequence: [0, 1, 2, 1],
    durations: ["8", "8", "8", "8"],
    dica: "Acentue levemente a primeira e terceira nota para dar balanço.",
  },
  {
    id: "sweep-up",
    nome: "Sweep Up",
    descricao: "Varredura ascendente com a oitava. Efeito dramático usado em introduções.",
    sequence: [0, 1, 2, 3],
    durations: ["16", "16", "16", "8"],
    dica: "Faça um movimento contínuo com a palheta, sem pausas entre as notas.",
  },
  {
    id: "sweep-down",
    nome: "Sweep Down",
    descricao: "Varredura descendente da oitava à fundamental. Fecha frases com impacto.",
    sequence: [3, 2, 1, 0],
    durations: ["16", "16", "16", "8"],
    dica: "Comece rápido e desacelere levemente na última nota.",
  },
  {
    id: "broken",
    nome: "Quebrado",
    descricao: "Pula entre notas não adjacentes. Cria interesse melódico e é a base de muitos solos.",
    sequence: [0, 2, 1, 2],
    durations: ["8", "8", "8", "8"],
    dica: "Treine lento até memorizar o salto entre as notas.",
  },
  {
    id: "samba",
    nome: "Samba",
    descricao: "Padrão rítmico do cavaquinho no samba: baixo-acorde com síncope característica.",
    sequence: [0, 2, 1, 0, 2, 1],
    durations: ["8", "16", "16", "8", "16", "16"],
    dica: "O segredo está na mão direita: acentue o tempo forte e mantenha o swing.",
  },
  {
    id: "pagode",
    nome: "Pagode",
    descricao: "Variação do padrão de samba com antecipação. O groove típico do pagode moderno.",
    sequence: [0, 1, 2, 0, 2, 1, 0],
    durations: ["8", "16", "16", "8", "8", "16", "16"],
    dica: "Ouça pagodes clássicos e tente reproduzir a levada antes de ler a tablatura.",
  },
]

export const CHORD_TYPES_ARPEJO = [
  { id: "maj", label: "Maior", suffix: "", intervals: [0, 4, 7] },
  { id: "min", label: "Menor", suffix: "m", intervals: [0, 3, 7] },
  { id: "7", label: "7", suffix: "7", intervals: [0, 4, 7, 10] },
  { id: "m7", label: "m7", suffix: "m7", intervals: [0, 3, 7, 10] },
  { id: "maj7", label: "7M", suffix: "7M", intervals: [0, 4, 7, 11] },
  { id: "dim", label: "Dim", suffix: "º", intervals: [0, 3, 6] },
  { id: "aug", label: "Aum", suffix: "+", intervals: [0, 4, 8] },
  { id: "m7b5", label: "m7(b5)", suffix: "m7(b5)", intervals: [0, 3, 6, 10] },
]
