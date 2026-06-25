import type { NoteData } from "@/components/partitura/PartituraView"
import type { TabNote } from "@/components/partitura/TablaturaView"

export interface Frase {
  id: string
  nome: string
  escala: string
  nivel: string
  notas: NoteData[]
  tab: TabNote[]
  descricao: string
  musicasExemplo: string[]
  dica: string
}

export const FRASES: Frase[] = [
  {
    id: "pent-asc-1",
    nome: "Subida Pentatônica",
    escala: "pent-maior",
    nivel: "Iniciante",
    notas: [
      { note: "C", octave: 4, duration: "8" },
      { note: "D", octave: 4, duration: "8" },
      { note: "E", octave: 4, duration: "8" },
      { note: "G", octave: 4, duration: "8" },
      { note: "A", octave: 4, duration: "q" },
    ],
    tab: [
      { string: 4, fret: 10 },
      { string: 4, fret: 12 },
      { string: 3, fret: 9 },
      { string: 3, fret: 12 },
      { string: 2, fret: 10 },
    ],
    descricao: "Subida simples pela pentatônica maior. Boa para iniciar frases e preencher espaços.",
    musicasExemplo: ["Trem das Onze — Adoniran Barbosa"],
    dica: "Toque com o polegar nas cordas graves e indicador nas agudas.",
  },
  {
    id: "pent-desc-1",
    nome: "Descida Pentatônica",
    escala: "pent-maior",
    nivel: "Iniciante",
    notas: [
      { note: "A", octave: 4, duration: "8" },
      { note: "G", octave: 4, duration: "8" },
      { note: "E", octave: 4, duration: "8" },
      { note: "D", octave: 4, duration: "8" },
      { note: "C", octave: 4, duration: "q" },
    ],
    tab: [
      { string: 2, fret: 10 },
      { string: 3, fret: 12 },
      { string: 3, fret: 9 },
      { string: 4, fret: 12 },
      { string: 4, fret: 10 },
    ],
    descricao: "Descida pela pentatônica maior. Resolve na tônica, boa para fechar frases.",
    musicasExemplo: ["Deixa a Vida Me Levar — Zeca Pagodinho"],
    dica: "Acentue a última nota (tônica) para dar sensação de chegada.",
  },
  {
    id: "blues-lick-1",
    nome: "Lick Blues Básico",
    escala: "blues",
    nivel: "Iniciante",
    notas: [
      { note: "C", octave: 4, duration: "8" },
      { note: "D#", octave: 4, duration: "8", accidental: "b" },
      { note: "F", octave: 4, duration: "8" },
      { note: "F#", octave: 4, duration: "16", accidental: "#" },
      { note: "G", octave: 4, duration: "16" },
      { note: "C", octave: 5, duration: "q" },
    ],
    tab: [
      { string: 4, fret: 10 },
      { string: 3, fret: 8 },
      { string: 3, fret: 10 },
      { string: 3, fret: 11 },
      { string: 3, fret: 12 },
      { string: 2, fret: 13 },
    ],
    descricao: "Lick clássico usando a blue note (F# no tom de C). O bend na blue note é o segredo.",
    musicasExemplo: ["Samba de Uma Nota Só — Tom Jobim"],
    dica: "A blue note (b5) deve ser tocada rapidamente, como passagem — não pare nela.",
  },
  {
    id: "samba-fill-1",
    nome: "Preenchimento de Samba",
    escala: "pent-maior",
    nivel: "Intermediário",
    notas: [
      { note: "G", octave: 4, duration: "16" },
      { note: "A", octave: 4, duration: "16" },
      { note: "C", octave: 5, duration: "8" },
      { note: "A", octave: 4, duration: "16" },
      { note: "G", octave: 4, duration: "16" },
      { note: "E", octave: 4, duration: "q" },
    ],
    tab: [
      { string: 3, fret: 12 },
      { string: 2, fret: 10 },
      { string: 2, fret: 13 },
      { string: 2, fret: 10 },
      { string: 3, fret: 12 },
      { string: 3, fret: 9 },
    ],
    descricao: "Fill típico de samba: sobe rápido e desce resolvendo. Usado entre versos.",
    musicasExemplo: ["Exaltação à Mangueira — Enredo"],
    dica: "Toque as semicolcheias com palheta alternada (baixo-cima).",
  },
  {
    id: "dorica-1",
    nome: "Frase Dórica",
    escala: "dorica",
    nivel: "Intermediário",
    notas: [
      { note: "D", octave: 4, duration: "8" },
      { note: "F", octave: 4, duration: "8" },
      { note: "G", octave: 4, duration: "8" },
      { note: "A", octave: 4, duration: "8" },
      { note: "B", octave: 4, duration: "8" },
      { note: "A", octave: 4, duration: "q" },
    ],
    tab: [
      { string: 4, fret: 12 },
      { string: 3, fret: 10 },
      { string: 3, fret: 12 },
      { string: 2, fret: 10 },
      { string: 2, fret: 12 },
      { string: 2, fret: 10 },
    ],
    descricao: "Frase sobre Dm7 usando a escala dórica. A 6ª maior (B) diferencia do menor natural.",
    musicasExemplo: ["Chega de Saudade — Tom Jobim"],
    dica: "Destaque o Si natural — é ele que dá a cor dórica sobre o acorde menor.",
  },
  {
    id: "mixo-1",
    nome: "Frase Mixolídia",
    escala: "mixolidia",
    nivel: "Intermediário",
    notas: [
      { note: "G", octave: 4, duration: "8" },
      { note: "A", octave: 4, duration: "8" },
      { note: "B", octave: 4, duration: "8" },
      { note: "D", octave: 5, duration: "8" },
      { note: "C", octave: 5, duration: "8" },
      { note: "F", octave: 4, duration: "8" },
      { note: "G", octave: 4, duration: "q" },
    ],
    tab: [
      { string: 3, fret: 12 },
      { string: 2, fret: 10 },
      { string: 2, fret: 12 },
      { string: 1, fret: 12 },
      { string: 2, fret: 13 },
      { string: 3, fret: 10 },
      { string: 3, fret: 12 },
    ],
    descricao: "Sobre G7 usando mixolídio. O Fá natural (b7) é a marca do modo sobre dominantes.",
    musicasExemplo: ["Eu Só Quero um Xodó — Dominguinhos"],
    dica: "Funciona sobre qualquer acorde dominante (V7). Transponha para a tonalidade da música.",
  },
  {
    id: "crom-pass",
    nome: "Passagem Cromática",
    escala: "blues",
    nivel: "Avançado",
    notas: [
      { note: "E", octave: 4, duration: "16" },
      { note: "F", octave: 4, duration: "16" },
      { note: "F#", octave: 4, duration: "16", accidental: "#" },
      { note: "G", octave: 4, duration: "16" },
      { note: "A", octave: 4, duration: "8" },
      { note: "G", octave: 4, duration: "8" },
      { note: "C", octave: 4, duration: "q" },
    ],
    tab: [
      { string: 3, fret: 9 },
      { string: 3, fret: 10 },
      { string: 3, fret: 11 },
      { string: 3, fret: 12 },
      { string: 2, fret: 10 },
      { string: 3, fret: 12 },
      { string: 4, fret: 10 },
    ],
    descricao: "Subida cromática de E até G seguida de resolução. Conecta notas da escala com cromatismos.",
    musicasExemplo: ["Carinhoso — Pixinguinha"],
    dica: "Cromatismos devem ser rápidos — são notas de passagem, não de repouso.",
  },
  {
    id: "harm-menor-1",
    nome: "Frase Menor Harmônica",
    escala: "harm-menor",
    nivel: "Avançado",
    notas: [
      { note: "A", octave: 4, duration: "8" },
      { note: "B", octave: 4, duration: "8" },
      { note: "C", octave: 5, duration: "8" },
      { note: "G#", octave: 4, duration: "8", accidental: "#" },
      { note: "A", octave: 4, duration: "q" },
    ],
    tab: [
      { string: 2, fret: 10 },
      { string: 2, fret: 12 },
      { string: 2, fret: 13 },
      { string: 2, fret: 11 },
      { string: 2, fret: 10 },
    ],
    descricao: "Sobe pela menor harmônica e desce com a 7ª maior (G#) resolvendo na tônica. Sonoridade cigana/choro.",
    musicasExemplo: ["Noites Cariocas — Jacob do Bandolim"],
    dica: "O intervalo G#→A (sensível→tônica) é o coração desta escala — faça-o soar.",
  },
]

export const FRASE_NIVEIS = ["Iniciante", "Intermediário", "Avançado"]
