import type { NoteData } from "@/components/partitura/PartituraView"

export interface LicaoPartitura {
  id: string
  titulo: string
  descricao: string
  conteudo: string
  exemplos: NoteData[]
  dicas: string[]
}

export const LICOES_PARTITURA: LicaoPartitura[] = [
  {
    id: "pentagrama",
    titulo: "O Pentagrama",
    descricao: "A base da notação musical: 5 linhas e 4 espaços",
    conteudo: `O **pentagrama** é formado por 5 linhas horizontais e 4 espaços entre elas. As notas são escritas sobre as linhas ou nos espaços.

**Clave de Sol** — usada para instrumentos agudos como o cavaquinho. O símbolo da clave indica que a 2ª linha (de baixo para cima) é a nota **Sol**.

**Leitura:** Sempre de baixo para cima. A nota mais grave fica embaixo, a mais aguda em cima.

**Linhas suplementares:** Notas abaixo ou acima do pentagrama usam pequenas linhas extras. O Dó central (C4) fica na 1ª linha suplementar inferior.`,
    exemplos: [
      { note: "E", octave: 4, duration: "q" },
      { note: "G", octave: 4, duration: "q" },
      { note: "B", octave: 4, duration: "q" },
      { note: "D", octave: 5, duration: "q" },
      { note: "F", octave: 5, duration: "q" },
    ],
    dicas: [
      "As notas nas LINHAS do pentagrama (de baixo para cima): Mi, Sol, Si, Ré, Fá",
      "As notas nos ESPAÇOS: Fá, Lá, Dó, Mi",
      "Use a frase \"Mi Sol Brilha De Fato\" para memorizar as linhas",
    ],
  },
  {
    id: "notas",
    titulo: "Notas no Pentagrama",
    descricao: "Posição de cada nota e o range do cavaquinho",
    conteudo: `As 7 notas musicais se repetem em oitavas: **Dó (C), Ré (D), Mi (E), Fá (F), Sol (G), Lá (A), Si (B)**.

**Range do cavaquinho:** Ré3 (D3) até aproximadamente Ré6 (D6), cobrindo cerca de 3 oitavas.

**Cordas soltas do cavaquinho (afinação padrão):**
- 4ª corda: Ré (D4)
- 3ª corda: Sol (G4)
- 2ª corda: Si (B4)
- 1ª corda: Ré (D5)

Cada traste sobe 1 semitom. O traste 12 dá a mesma nota uma oitava acima.`,
    exemplos: [
      { note: "C", octave: 4, duration: "q" },
      { note: "D", octave: 4, duration: "q" },
      { note: "E", octave: 4, duration: "q" },
      { note: "F", octave: 4, duration: "q" },
      { note: "G", octave: 4, duration: "q" },
      { note: "A", octave: 4, duration: "q" },
      { note: "B", octave: 4, duration: "q" },
    ],
    dicas: [
      "Dó central (C4) fica logo abaixo do pentagrama, na 1ª linha suplementar",
      "As cordas soltas do cavaquinho são D4, G4, B4, D5 — todas dentro do pentagrama",
      "Pratique identificando as notas das cordas soltas no pentagrama",
    ],
  },
  {
    id: "ritmo",
    titulo: "Figuras Rítmicas",
    descricao: "Duração das notas: semibreve, mínima, semínima, colcheia",
    conteudo: `Cada figura musical tem uma duração diferente, medida em **tempos**:

| Figura | Nome | Tempos (em 4/4) | Código |
|--------|------|-----------------|--------|
| 𝅝 | Semibreve | 4 tempos | w |
| 𝅗𝅥 | Mínima | 2 tempos | h |
| ♩ | Semínima | 1 tempo | q |
| ♪ | Colcheia | ½ tempo | 8 |
| 𝅘𝅥𝅯 | Semicolcheia | ¼ tempo | 16 |

**No samba e pagode:** O ritmo básico usa semínimas e colcheias com síncope (antecipação do tempo forte).`,
    exemplos: [
      { note: "C", octave: 4, duration: "w" },
      { note: "D", octave: 4, duration: "h" },
      { note: "E", octave: 4, duration: "q" },
      { note: "F", octave: 4, duration: "8" },
      { note: "G", octave: 4, duration: "8" },
    ],
    dicas: [
      "A semibreve dura um compasso inteiro (4 tempos em 4/4)",
      "Duas colcheias = uma semínima",
      "No cavaquinho, a levada do samba usa muito colcheias sincopadas",
    ],
  },
  {
    id: "compassos",
    titulo: "Compassos e Fórmulas",
    descricao: "4/4, 3/4, 2/4, 6/8 — organizando os tempos",
    conteudo: `O **compasso** organiza os tempos em grupos regulares. A **fórmula de compasso** aparece no início da partitura:

| Fórmula | Significado | Uso comum |
|---------|-------------|-----------|
| 4/4 | 4 semínimas por compasso | Samba, pagode, pop |
| 3/4 | 3 semínimas por compasso | Valsa |
| 2/4 | 2 semínimas por compasso | Marcha, samba |
| 6/8 | 6 colcheias por compasso | Baião, xote |

**Barras de compasso:** Linhas verticais que separam os compassos. Barra dupla indica fim de seção. Barra final indica fim da música.`,
    exemplos: [
      { note: "C", octave: 4, duration: "q" },
      { note: "E", octave: 4, duration: "q" },
      { note: "G", octave: 4, duration: "q" },
      { note: "C", octave: 5, duration: "q" },
    ],
    dicas: [
      "No samba, o compasso mais usado é 2/4",
      "No pagode moderno, usa-se bastante 4/4",
      "Conte em voz alta: '1-2-3-4' para manter o tempo",
    ],
  },
  {
    id: "acidentes",
    titulo: "Acidentes e Armaduras",
    descricao: "Sustenido, bemol, bequadro e armaduras de clave",
    conteudo: `**Acidentes** alteram a altura das notas:

| Símbolo | Nome | Efeito |
|---------|------|--------|
| ♯ | Sustenido | Sobe ½ tom |
| ♭ | Bemol | Desce ½ tom |
| ♮ | Bequadro | Cancela acidente anterior |

**Armadura de clave:** Conjunto de sustenidos ou bemóis no início da partitura que valem para toda a música.

Exemplo: Tom de Sol maior (G) → 1 sustenido (F#). Todo Fá na música vira Fá#, a menos que tenha um bequadro.

**No cavaquinho:** Cada traste = 1 semitom. Então sustenido = 1 traste acima, bemol = 1 traste abaixo.`,
    exemplos: [
      { note: "C", octave: 4, duration: "q" },
      { note: "C", octave: 4, duration: "q", accidental: "#" },
      { note: "D", octave: 4, duration: "q" },
      { note: "D", octave: 4, duration: "q", accidental: "b" },
    ],
    dicas: [
      "F# e Bb são os acidentes mais comuns no samba",
      "A armadura evita escrever o mesmo acidente repetidamente",
      "No cavaquinho, 1 traste = 1 semitom = 1 acidente",
    ],
  },
  {
    id: "cavaquinho",
    titulo: "Leitura no Cavaquinho",
    descricao: "Mapeamento partitura → braço → tablatura",
    conteudo: `Agora vamos conectar tudo: ler uma nota no pentagrama e encontrá-la no braço do cavaquinho.

**Mapeamento cordas soltas → pentagrama:**
- 4ª corda (Ré D4): na linha abaixo do pentagrama
- 3ª corda (Sol G4): na 2ª linha
- 2ª corda (Si B4): na 3ª linha
- 1ª corda (Ré D5): na 4ª linha

**Tablatura equivalente:** A tablatura mostra o número do traste em cada corda. É a "tradução" da partitura para o braço do instrumento.

**Exercício:** Para cada nota no pentagrama, encontre a posição no braço (corda + traste) e toque.`,
    exemplos: [
      { note: "D", octave: 4, duration: "q" },
      { note: "G", octave: 4, duration: "q" },
      { note: "B", octave: 4, duration: "q" },
      { note: "D", octave: 5, duration: "q" },
    ],
    dicas: [
      "Comece pelas cordas soltas: D4, G4, B4, D5",
      "Depois adicione os primeiros trastes de cada corda",
      "Use a tablatura como guia até memorizar as posições",
    ],
  },
]

interface QuizNote {
  note: string
  octave: number
  name: string
  accidental?: "#" | "b"
}

export const QUIZ_NOTAS: Record<string, QuizNote[]> = {
  iniciante: [
    { note: "C", octave: 4, name: "Dó" },
    { note: "D", octave: 4, name: "Ré" },
    { note: "E", octave: 4, name: "Mi" },
    { note: "F", octave: 4, name: "Fá" },
    { note: "G", octave: 4, name: "Sol" },
    { note: "A", octave: 4, name: "Lá" },
    { note: "B", octave: 4, name: "Si" },
  ],
  intermediario: [
    { note: "C", octave: 4, name: "Dó" },
    { note: "C", octave: 4, name: "Dó#", accidental: "#" as const },
    { note: "D", octave: 4, name: "Ré" },
    { note: "E", octave: 4, name: "Mi" },
    { note: "E", octave: 4, name: "Mib", accidental: "b" as const },
    { note: "F", octave: 4, name: "Fá" },
    { note: "F", octave: 4, name: "Fá#", accidental: "#" as const },
    { note: "G", octave: 4, name: "Sol" },
    { note: "A", octave: 4, name: "Lá" },
    { note: "A", octave: 4, name: "Láb", accidental: "b" as const },
    { note: "B", octave: 4, name: "Si" },
    { note: "B", octave: 4, name: "Sib", accidental: "b" as const },
  ],
  avancado: [
    { note: "C", octave: 3, name: "Dó3" },
    { note: "D", octave: 3, name: "Ré3" },
    { note: "E", octave: 3, name: "Mi3" },
    { note: "C", octave: 5, name: "Dó5" },
    { note: "D", octave: 5, name: "Ré5" },
    { note: "E", octave: 5, name: "Mi5" },
    { note: "F", octave: 5, name: "Fá5" },
    { note: "G", octave: 5, name: "Sol5" },
    { note: "F", octave: 4, name: "Fá#4", accidental: "#" as const },
    { note: "G", octave: 4, name: "Sol#4", accidental: "#" as const },
    { note: "A", octave: 4, name: "Láb4", accidental: "b" as const },
    { note: "B", octave: 4, name: "Sib4", accidental: "b" as const },
  ],
}
