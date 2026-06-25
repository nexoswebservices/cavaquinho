export interface Escala {
  id: string
  nome: string
  tipo: string
  intervalos: number[]
  descricao: string
  usoComum: string
  acordesCompativeis: string[]
}

export const ESCALAS: Escala[] = [
  {
    id: "pent-maior",
    nome: "Pentatônica Maior",
    tipo: "Pentatônica",
    intervalos: [0, 2, 4, 7, 9],
    descricao: "5 notas essenciais da escala maior. Sonoridade alegre e aberta, base de inúmeros solos de samba e pagode.",
    usoComum: "Samba, Pagode, MPB",
    acordesCompativeis: ["I", "IV", "V"],
  },
  {
    id: "pent-menor",
    nome: "Pentatônica Menor",
    tipo: "Pentatônica",
    intervalos: [0, 3, 5, 7, 10],
    descricao: "Versão menor da pentatônica. Sonoridade melancólica, muito usada em blues e solos expressivos.",
    usoComum: "Blues, Rock, Samba dramático",
    acordesCompativeis: ["i", "iv", "v"],
  },
  {
    id: "blues",
    nome: "Blues",
    tipo: "Blues",
    intervalos: [0, 3, 5, 6, 7, 10],
    descricao: "Pentatônica menor + blue note (b5). A nota extra cria tensão e o 'sabor' característico do blues.",
    usoComum: "Blues, Samba-rock, Pagode",
    acordesCompativeis: ["I7", "IV7", "V7"],
  },
  {
    id: "jonica",
    nome: "Maior (Jônica)",
    tipo: "Modal",
    intervalos: [0, 2, 4, 5, 7, 9, 11],
    descricao: "A escala maior completa. Tom alegre e estável, referência para todos os modos.",
    usoComum: "Pop, MPB, Samba",
    acordesCompativeis: ["I", "Imaj7"],
  },
  {
    id: "dorica",
    nome: "Dórica",
    tipo: "Modal",
    intervalos: [0, 2, 3, 5, 7, 9, 10],
    descricao: "Menor com 6ª maior. Sonoridade menor sofisticada, muito usada no jazz e samba-jazz.",
    usoComum: "Jazz, Samba-jazz, Bossa Nova",
    acordesCompativeis: ["ii", "iim7"],
  },
  {
    id: "frigia",
    nome: "Frígia",
    tipo: "Modal",
    intervalos: [0, 1, 3, 5, 7, 8, 10],
    descricao: "Menor com b2. Sonoridade exótica e tensa, usada em passagens dramáticas.",
    usoComum: "Flamenco, Chorinho (passagens)",
    acordesCompativeis: ["iii"],
  },
  {
    id: "lidia",
    nome: "Lídia",
    tipo: "Modal",
    intervalos: [0, 2, 4, 6, 7, 9, 11],
    descricao: "Maior com #4. Sonoridade brilhante e etérea, usada em momentos de suspensão.",
    usoComum: "Bossa Nova, MPB",
    acordesCompativeis: ["IV", "IVmaj7"],
  },
  {
    id: "mixolidia",
    nome: "Mixolídia",
    tipo: "Modal",
    intervalos: [0, 2, 4, 5, 7, 9, 10],
    descricao: "Maior com b7. O modo do acorde dominante. Fundamental no samba, baião e forró.",
    usoComum: "Samba, Baião, Forró, Pagode",
    acordesCompativeis: ["V", "V7"],
  },
  {
    id: "eolica",
    nome: "Menor Natural (Eólica)",
    tipo: "Modal",
    intervalos: [0, 2, 3, 5, 7, 8, 10],
    descricao: "A escala menor natural. Sonoridade triste e introspectiva.",
    usoComum: "Samba dramático, Choro",
    acordesCompativeis: ["vi", "vim7"],
  },
  {
    id: "locria",
    nome: "Lócria",
    tipo: "Modal",
    intervalos: [0, 1, 3, 5, 6, 8, 10],
    descricao: "O modo mais instável, com b2 e b5. Raramente usado sozinho, aparece sobre acordes meio-diminutos.",
    usoComum: "Jazz (sobre m7b5)",
    acordesCompativeis: ["viiø"],
  },
  {
    id: "harm-menor",
    nome: "Menor Harmônica",
    tipo: "Menor",
    intervalos: [0, 2, 3, 5, 7, 8, 11],
    descricao: "Menor natural com 7ª maior. Cria o V7 no campo harmônico menor. Sonoridade oriental/cigana.",
    usoComum: "Choro, Samba clássico, Tango",
    acordesCompativeis: ["i", "V7"],
  },
  {
    id: "mel-menor",
    nome: "Menor Melódica",
    tipo: "Menor",
    intervalos: [0, 2, 3, 5, 7, 9, 11],
    descricao: "Menor com 6ª e 7ª maiores. Sonoridade sofisticada, base de escalas de jazz como alterada e lídia b7.",
    usoComum: "Jazz, Bossa Nova",
    acordesCompativeis: ["i", "imaj7"],
  },
]

export const ESCALA_TIPOS = ["Pentatônica", "Blues", "Modal", "Menor"]
