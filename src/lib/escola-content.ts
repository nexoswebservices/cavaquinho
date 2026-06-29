import type { Module } from "@/types"

export const MODULES: Module[] = [
  {
    id: "escalas",
    title: "Escalas",
    description: "A base de toda música: aprenda a construir e tocar escalas maiores, menores e pentatônicas.",
    icon: "🎵",
    color: "violet",
    lessons: [
      {
        id: "esc-1",
        title: "O que são Escalas?",
        description: "Entenda o conceito fundamental de escalas e por que elas são o alicerce da música.",
        duration: "8 min",
        content: `
## O que são Escalas?

Uma **escala musical** é uma sequência ordenada de notas com intervalos específicos entre elas. Pense nelas como o alfabeto da música — com essas "letras" você constrói melodias, acordes e toda a harmonia de uma música.

### As 7 notas da música ocidental

No sistema musical ocidental temos 7 notas naturais:

> **Dó — Ré — Mi — Fá — Sol — Lá — Si**

Ou no sistema anglossaxão (muito usado em cifras):
> **C — D — E — F — G — A — B**

### O que são Tons e Semitons?

O intervalo entre as notas não é sempre igual. Existem dois tamanhos básicos:

- **Tom (T)** = 2 semitons — distância maior
- **Semitom (st)** = 1 semitom — distância mínima

No cavaquinho, um semitom = 1 traste. Dois trastes = 1 tom.

### Por que estudar escalas?

1. Saber quais notas "combinam" em cada tonalidade
2. Construir solos e improvisos
3. Entender quais acordes pertencem a uma música
4. Transpor músicas para outros tons

> **Dica prática:** Toda vez que você toca uma música "no tom de C", você está usando as notas da escala de Dó maior.
        `,
        tips: [
          "Memorize as notas: C D E F G A B C",
          "No cavaquinho: 1 traste = 1 semitom, 2 trastes = 1 tom",
          "Prática diária de 10 minutos já faz diferença",
        ],
      },
      {
        id: "esc-2",
        title: "Escala Maior (Jônica)",
        description: "A escala mais importante da música: a fórmula T-T-st-T-T-T-st e como aplicá-la.",
        duration: "12 min",
        content: `
## Escala Maior (Jônica)

A escala maior é a mais usada na música popular, sertanejo, pagode e MPB. Ela transmite uma sensação **alegre e brilhante**.

### A fórmula mágica

Toda escala maior segue a mesma fórmula de intervalos:

\`\`\`
T - T - st - T - T - T - st
\`\`\`

Onde **T** = Tom e **st** = Semitom.

### Escala de Dó Maior (C Major) — a mais fácil

Usando a fórmula a partir do Dó:

| Nota | Intervalo | Grau |
|------|-----------|------|
| C    | —         | I    |
| D    | Tom       | II   |
| E    | Tom       | III  |
| F    | Semitom   | IV   |
| G    | Tom       | V    |
| A    | Tom       | VI   |
| B    | Tom       | VII  |
| C    | Semitom   | I    |

> A escala de Dó maior é especial: **não tem nenhuma nota com sustenido ou bemol**. Por isso é o ponto de partida ideal.

### Construindo outras escalas maiores

Para construir a escala de **G maior** (Sol):
G - A - B - C - D - E - F# - G

Note o **F#** (fá sustenido) — necessário para manter a fórmula T-T-st-T-T-T-st.

### No cavaquinho (C Maior — afinação D-G-B-D)

\`\`\`
D |---0---2---3---
B |---0---1---3---
G |---0---2-------
D |---0---2---3---
\`\`\`
        `,
        tips: [
          "Memorize a fórmula: T-T-st-T-T-T-st",
          "C maior não tem sustenidos — comece por ela",
          "Cante as notas enquanto toca para fixar",
        ],
        chords: ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
      },
      {
        id: "esc-3",
        title: "Escala Menor Natural",
        description: "A escala da emoção: entenda a escala menor e sua relação com a maior.",
        duration: "12 min",
        content: `
## Escala Menor Natural (Eólia)

Se a escala maior é alegre e luminosa, a **escala menor natural** é introspectiva, melancólica e expressiva. É muito usada em samba-canção, bolero e baladas.

### A fórmula da escala menor natural

\`\`\`
T - st - T - T - st - T - T
\`\`\`

### Escala de Lá Menor (A Minor)

A escala de Lá menor é a **relativa menor** de Dó maior — usa exatamente as mesmas notas, mas começa no Lá:

> **A - B - C - D - E - F - G - A**

### Relativa Menor

Toda escala maior tem uma relativa menor que usa as mesmas notas. Para encontrá-la, conte **6 graus** (ou desça 3 semitons) da tônica maior:

- C maior → **A menor** (Am)
- G maior → **E menor** (Em)
- F maior → **D menor** (Dm)

### Diferença entre Maior e Menor

| Aspecto | Maior | Menor |
|---------|-------|-------|
| Fórmula | T-T-st-T-T-T-st | T-st-T-T-st-T-T |
| 3° grau | E (Mi) | Eb (Mib) |
| Sensação | Alegre | Melancólico |
| Exemplo | "Happy Birthday" | "Summertime" |

> A diferença principal está no **3° grau**: na escala menor ele é abaixado meio tom, dando o caráter triste.
        `,
        tips: [
          "Am usa as mesmas notas que C — é a relativa menor",
          "O 3° grau abaixado é o que dá o 'tom triste'",
          "Samba-canção clássico explora muito a tonalidade menor",
        ],
        chords: ["Am", "Bdim", "C", "Dm", "Em", "F", "G"],
      },
      {
        id: "esc-4",
        title: "Pentatônica Maior",
        description: "5 notas que funcionam em quase tudo — a escala mais versátil da música popular.",
        duration: "10 min",
        content: `
## Escala Pentatônica Maior

"Penta" = 5, "tônica" = tons. A **pentatônica maior** usa apenas 5 notas da escala maior, removendo os semitons mais tensos (IV e VII grau).

### Como construir

Pegue a escala maior e **remova o 4° e o 7° graus**:

| Escala Maior | Pentatônica Maior |
|-------------|-------------------|
| C D E **F** G A **B** C | C D E G A C |

### Por que ela funciona em tudo?

Ao remover os graus mais "tensos", sobram apenas as notas mais consonantes. Isso torna difícil errar — qualquer nota da pentatônica soa bem sobre os acordes da tonalidade.

### Onde é usada?

- Solos de blues e rock
- Melodias de música folclórica mundial
- Riffs de pagode e samba
- Melodias de música infantil (Brilha Brilha Estrelinha usa pentatônica!)

### No cavaquinho (C Pentatônica Maior — afinação D-G-B-D)

\`\`\`
D |---0---3---5---
B |---0---1---3---
G |---0---2---5---
D |---0---2---3---
\`\`\`
        `,
        tips: [
          "Remova o 4° e 7° grau da maior para ter a pentatônica",
          "É quase impossível errar com ela — muito usada em improvisos",
          "Experimenta tocar sobre as músicas que você já conhece",
        ],
      },
      {
        id: "esc-5",
        title: "Pentatônica Menor",
        description: "A escala dos solos: fundamento do blues, pagode e rock brasileiro.",
        duration: "10 min",
        content: `
## Escala Pentatônica Menor

A **pentatônica menor** é a escala mais tocada no mundo. Está no blues, no rock, no funk e em bastante coisa no pagode e no samba.

### Como construir

Pegue a escala menor natural e **remova o 2° e o 6° graus**:

| Menor Natural | Pentatônica Menor |
|--------------|-------------------|
| A B C D E **F** G A | A C D E G A |

### Relação com a Pentatônica Maior

A pentatônica menor de **A** e a pentatônica maior de **C** usam as mesmas notas — são relativas entre si, igual acontece com as escalas maiores e menores.

### No cavaquinho (Am Pentatônica — 5ª posição)

\`\`\`
D |---5---8---
B |---5---8---
G |---5---7---
D |---5---7---
\`\`\`

Esse padrão se repete em qualquer tom — só mude a posição inicial!

### Aplicando no pagode

Muitos riffs de cavaco e violão 7 cordas usam a pentatônica menor para criar aquele "swing" característico do pagode carioca. Experimente improvisar sobre "Não Foi a Toa" (Belo, Tom: C) usando a Am pentatônica.
        `,
        tips: [
          "Am pentatônica = C pentatônica maior (mesmas notas)",
          "O 'box position' na 5ª posição é o mais usado em solos",
          "Pratique descendo e subindo a caixa com swing",
        ],
      },
      {
        id: "esc-6",
        title: "Modos Gregos — Introdução",
        description: "Expanda seu vocabulário musical com os 7 modos — do Jônico ao Lócrio.",
        duration: "15 min",
        content: `
## Modos Gregos

Os **modos gregos** são 7 escalas derivadas da escala maior, cada uma começando em um grau diferente. São muito usados no jazz, MPB sofisticada e pelo cavaco e violão de 7 cordas no choro.

### Os 7 modos

| Modo | Grau | Fórmula | Caráter |
|------|------|---------|---------|
| Jônico | I | T-T-st-T-T-T-st | Alegre (= escala maior) |
| **Dórico** | II | T-st-T-T-T-st-T | **Suave, melancólico-funk** |
| Frígio | III | st-T-T-T-st-T-T | Misterioso, flamenco |
| Lídio | IV | T-T-T-st-T-T-st | Etéreo, flutuante |
| Mixolídio | V | T-T-st-T-T-st-T | Bluesy, dominante |
| Eólio | VI | T-st-T-T-st-T-T | Triste (= escala menor) |
| Lócrio | VII | st-T-T-st-T-T-T | Tenso, instável |

### Por que o Dórico é o mais importante para pagode?

O **modo Dórico** tem um caráter único: é menor mas com um 6° grau maior, dando uma leveza especial. Está presente em muitas músicas do funk carioca e samba moderno.

Exemplo: A Dórico = A B C D E **F#** G A

Compare com A menor natural: A B C D E F G A

A única diferença é o **F#** — esse detalhe muda completamente o clima.

### Como decorar os modos

Uma forma fácil: todos os modos de **C maior** usam as mesmas notas (C D E F G A B), mas começam em notas diferentes:

- D Dórico = D E F G A B C D
- E Frígio = E F G A B C D E
- G Mixolídio = G A B C D E F G

> Não tente memorizar tudo de uma vez. Foque no **Dórico e no Mixolídio** — os mais usados na música popular brasileira.

### Dórico no Cavaquinho (A Dórico)

Notas: A B C D E F# G

**Tablatura (afinação D-G-B-D):**

\`\`\`
4ª corda (D): |--0--2--3--5--7--
3ª corda (G): |--0--2--4--5--7--
2ª corda (B): |--0--1--3--5--7--
1ª corda (D): |--0--2--3--5--7--
\`\`\`

**Frase Dórica típica do pagode:**
A → C → D → E → F# → E → D → A

O F# é a nota que diferencia o Dórico do menor natural — enfatize-a!

### Mixolídio no Cavaquinho (G Mixolídio)

Notas: G A B C D E F

**Tablatura:**

\`\`\`
4ª corda (D): |--5--7--8--10--
3ª corda (G): |--0--2--4--5--7--
2ª corda (B): |--0--1--3--5--
1ª corda (D): |--0--2--3--5--
\`\`\`

**Frase Mixolídia típica (sobre G7):**
G → A → B → D → E → F → E → D → G

O Fá natural (b7) é a marca do Mixolídio — dá o "tempero blues" sobre o V7.

### Aplicação Prática

- **Dórico sobre ii (Dm7):** Use D Dórico para solar sobre Dm7 em progressões ii-V-I
- **Mixolídio sobre V (G7):** Use G Mixolídio para solar sobre G7 antes de resolver no I
- **No pagode:** O Dórico funciona em músicas com groove funk; o Mixolídio em sambas com dominante prolongado
        `,
        tips: [
          "Foque em Dórico (funk/samba moderno) e Mixolídio (blues/MPB)",
          "Todos os modos de C maior têm as mesmas notas — só muda a tônica",
          "Dórico = menor com 6° grau maior — dá aquele swing especial",
          "Mixolídio = maior com 7° grau abaixado — o modo do V7",
        ],
      },
    ],
  },
  {
    id: "acordes",
    title: "Acordes",
    description: "De tríades simples a acordes estendidos: construa a base harmônica do pagode e do samba.",
    icon: "🎶",
    color: "indigo",
    lessons: [
      {
        id: "ac-1",
        title: "Tríades — Maior e Menor",
        description: "Todo acorde começa aqui: aprenda a construir tríades maiores e menores.",
        duration: "10 min",
        content: `
## Tríades: Maior e Menor

Um **acorde** é formado por pelo menos 3 notas tocadas simultaneamente. A forma mais básica é a **tríade**, composta pelo 1°, 3° e 5° grau de uma escala.

### Tríade Maior

Formada por:
- **Tônica (1°)** + **Terça Maior (3°)** + **Quinta Justa (5°)**
- Intervalo: 4 semitons + 3 semitons

Exemplo — **C maior (C)**:
> C + E + G

### Tríade Menor

Formada por:
- **Tônica (1°)** + **Terça Menor (♭3°)** + **Quinta Justa (5°)**
- Intervalo: 3 semitons + 4 semitons

Exemplo — **A menor (Am)**:
> A + C + E

### A diferença entre maior e menor

| | Tônica | 3° grau | 5° grau |
|-|--------|---------|---------|
| C (maior) | C | E | G |
| Cm (menor) | C | E♭ | G |

**Apenas o 3° grau muda** — abaixado meio tom para criar o caráter menor.

### Tríades do campo harmônico de C maior

| Grau | Acorde | Tipo |
|------|--------|------|
| I    | C      | Maior |
| II   | Dm     | Menor |
| III  | Em     | Menor |
| IV   | F      | Maior |
| V    | G      | Maior |
| VI   | Am     | Menor |
| VII  | Bdim   | Diminuto |
        `,
        tips: [
          "Maior = 4 + 3 semitons | Menor = 3 + 4 semitons",
          "A única diferença é o 3° grau — abaixe meio tom para minor",
          "Memorize: I, IV, V = maiores | II, III, VI = menores no campo de C",
        ],
        chords: ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
      },
      {
        id: "ac-2",
        title: "Tétrades e Acordes com 7ª",
        description: "Adicione a 7ª para criar acordes mais ricos: maj7, m7 e dominante 7.",
        duration: "12 min",
        content: `
## Tétrades: Acordes com Sétima

Adicionar a **7ª nota** à tríade cria as tétrades — acordes mais ricos e sofisticados, fundamentais no jazz, samba e bossa nova.

### Os 3 tipos principais

#### 1. Dominante 7 (X7)
Tríade maior + 7ª menor
> C7 = C + E + G + B♭

Caráter: **tensão, resolve para o I grau**. Muito usado no pagode no V grau.

#### 2. Menor 7 (Xm7)
Tríade menor + 7ª menor
> Am7 = A + C + E + G

Caráter: **suave, jazzy, relaxado**.

#### 3. Maior com 7ª Maior (Xmaj7 ou XM7)
Tríade maior + 7ª maior
> Cmaj7 = C + E + G + B

Caráter: **romântico, bossa nova, sofisticado**.

### Tabela resumo

| Sigla | Notas (em C) | Caráter |
|-------|-------------|---------|
| C7    | C E G B♭    | Tensão (dominante) |
| Cm7   | C E♭ G B♭   | Suave, jazzy |
| Cmaj7 | C E G B     | Romântico |
| Cm(maj7) | C E♭ G B | Misterioso |

### No campo de C maior com sétimas

| Grau | Acorde | Tipo |
|------|--------|------|
| I    | Cmaj7  | Maior 7ª maior |
| II   | Dm7    | Menor 7ª |
| III  | Em7    | Menor 7ª |
| IV   | Fmaj7  | Maior 7ª maior |
| V    | **G7** | **Dominante 7** |
| VI   | Am7    | Menor 7ª |
| VII  | Bm7♭5  | Semi-diminuto |
        `,
        tips: [
          "G7 → C: a resolução mais comum da música ocidental",
          "maj7 = bossa nova/jazz | 7 = pagode/samba | m7 = jazzy",
          "Pratique tocar Dm7 → G7 → Cmaj7 para sentir o movimento II-V-I",
        ],
        chords: ["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7b5"],
      },
      {
        id: "ac-3",
        title: "Acordes Diminutos e Aumentados",
        description: "Acordes de passagem e tensão: diminuto (°) e aumentado (+).",
        duration: "10 min",
        content: `
## Acordes Diminutos e Aumentados

Além das tríades maiores e menores, existem dois tipos especiais de muita tensão e expressividade.

### Acorde Diminuto (°)

Formado por duas terças menores empilhadas:
- Tônica + ♭3 + ♭5

> Bdim = B + D + F

**Caráter:** Muita tensão, instabilidade. Muito usado como **acorde de passagem** no samba e choro.

#### Bdim no campo de C
O VII grau (B diminuto) resolve naturalmente para o I grau (C):
> Bdim → C (passagem chromática)

#### Diminuto como passagem
Uma progressão clássica no pagode:
> C → C#dim → Dm → G7 → C

O C#dim cria uma linha de baixo cromática: C → C# → D.

### Acorde Aumentado (+)

Formado por duas terças maiores empilhadas:
- Tônica + 3 + #5

> C+ = C + E + G#

**Caráter:** Suspenso, misterioso. Funciona muito bem como substituto do dominante V7.

> G+ pode substituir G7 antes de resolver em C

### Simetria do diminuto

O acorde diminuto 7 (Xdim7) tem uma propriedade interessante: suas 4 notas são equidistantes (3 semitons cada). Por isso, ele pode ser "transportado" de 3 em 3 semitons sem mudar as notas!

> Cdim7 = Ebdim7 = Gbdim7 = Adim7
        `,
        tips: [
          "Diminuto: use como passagem cromática entre acordes",
          "C → C#dim → Dm é uma progressão clássica do pagode",
          "Aumentado (+): substituto tenso do dominante antes de resolver",
        ],
      },
      {
        id: "ac-4",
        title: "Acordes Estendidos (9ª, 11ª, 13ª)",
        description: "Adicione cor e sofisticação com extensões — o vocabulário da bossa nova e do jazz.",
        duration: "15 min",
        content: `
## Acordes Estendidos

As **extensões** são notas além da oitava adicionadas ao acorde: 9ª (2ª), 11ª (4ª) e 13ª (6ª). Muito usadas na bossa nova, MPB sofisticada e progressões de cavaco avançado.

### 9ª (Nona)

A **9ª** é a mesma nota que a 2ª, mas uma oitava acima.

| Acorde | Notas |
|--------|-------|
| G9     | G B D F A |
| Cadd9  | C E G D |
| Am9    | A C E G B |

> **Dica:** No cavaquinho, o acorde Cadd9 (C com 9ª adicionada) é muito mais rico que o C simples e não muito mais difícil de tocar.

### 11ª (Décima Primeira)

A **11ª justa** sobre um acorde maior cria dissonância. Por isso, no jazz usa-se mais a **11ª aumentada (#11)** — chamada de acorde **Lídio**.

> Cmaj7(#11) = C E G B F# — clima etéreo, cinematográfico

### 13ª (Décima Terceira)

A **13ª** é a mesma que a 6ª. Muito usada em acordes dominantes:

> G13 = G B D F A E — resolve ricamente para C

### Como usar na prática (pagode/samba)

Progressão sofisticada no tom de C:
\`\`\`
Dm9 → G13 → Cmaj9
\`\`\`

Essa sequência II9 - V13 - Imaj9 é o "II-V-I estendido" — coração do samba sofisticado e da bossa nova.

### Regra prática

Não é necessário tocar todas as notas. No cavaquinho (4 cordas), geralmente omitimos a **5ª justa** (ela não adiciona cor) e mantemos:
- Tônica (no baixo)
- 3ª (define maior/menor)
- 7ª (define o tipo)
- Extensão desejada (9, 11 ou 13)
        `,
        tips: [
          "Omita a 5ª para encaixar extensões no cavaquinho",
          "Cadd9 é mais bonito que C simples e quase igual de tocar",
          "G13 → Cmaj9: o II-V-I estendido é o coração da bossa nova",
        ],
      },
      {
        id: "ac-5",
        title: "Inversões e Baixo Alterado",
        description: "Mova o baixo para criar linhas melódicas e suavizar as progressões.",
        duration: "12 min",
        content: `
## Inversões de Acordes

Uma **inversão** ocorre quando tocamos um acorde com uma nota diferente da tônica no baixo. Isso cria linhas de baixo melódicas e suaviza as progressões.

### Notação: C/E, G/B, F/A

A notação X/Y significa "acorde X com nota Y no baixo":

| Acorde | Notas | Posição |
|--------|-------|---------|
| C      | C E G | Posição fundamental (C no baixo) |
| C/E    | E C G | 1ª inversão (3ª no baixo) |
| C/G    | G C E | 2ª inversão (5ª no baixo) |

### Linha de baixo descendente clássica

Um dos movimentos mais belos da música popular:

\`\`\`
C → C/B → Am → Am/G → F → G7 → C
\`\`\`

O baixo desce: **C - B - A - G - F - G - C** — uma progressão usada em dezenas de músicas.

### No pagode e samba

A linha do **7 cordas** no samba muitas vezes toca inversões para criar o "bordão" característico:

> G7/F → Cmaj7/E → Dm/C — movimento de baixo cromático descendente

### Acorde sobre baixo estranho

Pode-se usar qualquer nota no baixo, mesmo fora do acorde:

> D/F# — acorde D (Ré maior) com F# (fá sustenido) no baixo
> Funciona como dominante substituindo o A7 na progressão do campo de D.

### Dica de harmonização

Ao harmonizar uma melodia descendente, as inversões evitam que o baixo "salte" muito, criando um movimento mais suave e musical.
        `,
        tips: [
          "C/E, C/G são inversões — nota após a barra vai pro baixo",
          "Linha descendente C→C/B→Am→Am/G→F é atemporal",
          "O 7 cordas usa inversões constantemente no contraponto do samba",
        ],
      },
      {
        id: "ac-6",
        title: "Campo Harmônico e Numerais Romanos",
        description: "O mapa de qualquer tonalidade: como usar números romanos para analisar e transpor.",
        duration: "15 min",
        content: `
## Campo Harmônico

O **campo harmônico** é o conjunto de acordes que pertencem a uma determinada tonalidade. Dominar esse conceito permite analisar qualquer música e transpor para qualquer tom.

### Campo Harmônico de C Maior

| Grau | Numeral | Acorde | Tipo |
|------|---------|--------|------|
| 1°   | I       | C      | Maior |
| 2°   | ii      | Dm     | Menor |
| 3°   | iii     | Em     | Menor |
| 4°   | IV      | F      | Maior |
| 5°   | V       | G      | Maior |
| 6°   | vi      | Am     | Menor |
| 7°   | vii°    | Bdim   | Diminuto |

> **Convenção:** Maiúsculo = Maior, minúsculo = menor

### Por que usar numerais romanos?

A progressão **I - IV - V** em C é: **C - F - G**

Em G é: **G - C - D**

Em D é: **D - G - A**

**A mesma análise funciona em qualquer tom!** Por isso cifras e músicos referenciam progressões com numerais.

### Progressões mais comuns do pagode

| Progressão | Numerais | Exemplo em C |
|-----------|---------|-------------|
| Básica    | I-IV-V-I | C-F-G-C |
| Pagode clássico | I-vi-IV-V | C-Am-F-G |
| II-V-I | ii-V-I | Dm-G-C |
| Andaluza | i-VII-VI-V | Am-G-F-E |

### Aplicação prática

Quando alguém diz "a música é I-vi-IV-V no tom de D", você sabe imediatamente:
> D - Bm - G - A

Esse é o campo harmônico em ação. Analise suas músicas favoritas usando numerais romanos!
        `,
        tips: [
          "I, IV, V = maiores | ii, iii, vi = menores | vii° = diminuto",
          "Cifras de pagode costumam usar I-vi-IV-V e ii-V-I",
          "Transposição fica trivial quando você pensa em numerais, não notas",
        ],
        chords: ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
      },
      {
        id: "ac-7",
        title: "Acordes Sus e Alterados",
        description: "Sus4, sus2, 7(#5), 7(b13), 7(b9), 7(#9) — tensões que colorem o samba.",
        duration: "12 min",
        content: `
## Acordes Sus e Alterados

Estes acordes adicionam **cor e movimento** à harmonia. São muito usados em passagens, preparações e momentos expressivos do samba e bossa nova.

### Acordes Suspensos (Sus)

Substituem a 3ª por outra nota, criando **ambiguidade** — nem maior, nem menor.

| Acorde | Fórmula | Exemplo | Efeito |
|---|---|---|---|
| **Xsus4** | 1 – 4 – 5 | Gsus4 = G C D | Suspensão, "pede resolução" |
| **Xsus2** | 1 – 2 – 5 | Gsus2 = G A D | Aberto, etéreo |

**Resolução clássica:** Gsus4 → G → C (suspende, resolve na 3ª, depois no tom)

No cavaquinho: o sus4 é muito usado antes do acorde dominante. Exemplo: Gsus4 → G7 → C

### Acordes Alterados do Dominante

O V7 é o acorde com **mais possibilidades de alteração**:

| Acorde | Fórmula | Efeito |
|---|---|---|
| **X7(#5)** | 1 – 3 – #5 – b7 | Quinta alterada na estrutura (sem 5ª natural) |
| **X7(b13)** | 1 – 3 – 5 – b7 – b13 | Quinta natural + b13 como tensão |
| **X7(b9)** | 1 – 3 – 5 – b7 – b9 | Tensão escura, dramática |
| **X7(#9)** | 1 – 3 – 5 – b7 – #9 | "Acorde Hendrix", tensão intensa |

### Diferença Prática: #5 vs b13

- **G7(#5)** = G B D# F → a 5ª foi **substituída** por D#
- **G7(b13)** = G B D F Eb → a 5ª D **continua** e Eb é tensão adicionada
- No cavaquinho (4 cordas): geralmente soa igual, mas o conceito importa para análise

### Aplicação no Pagode

- **Gsus4 → G7 → C**: preparação clássica antes da resolução
- **E7(b9) → Am**: tensão máxima antes do menor — som dramático do pagode
- **G7(#5) → C**: resolução com brilho extra — bossa nova

### No Cavaquinho

Shapes comuns (tom de C):
- Gsus4: monte G mas coloque o dedo na 4ª justa (C)
- G7(b9): adicione Ab na montagem do G7
- Sus → Dominante → Tônica: o movimento mais elegante da harmonia
        `,
        tips: [
          "Gsus4→G7→C: a resolução mais bonita — suspende, tenciona, resolve",
          "E7(b9)→Am: o drama do pagode em dois acordes",
          "No cavaquinho, #5 e b13 soam muito parecido — foque na resolução",
        ],
        chords: ["Gsus4", "G7", "E7", "Am"],
      },
    ],
  },
  {
    id: "cadencias",
    title: "Cadências",
    description: "Como os acordes se movem e resolvem: as cadências que constroem toda progressão harmônica.",
    icon: "🎼",
    color: "emerald",
    lessons: [
      {
        id: "cad-1",
        title: "O que é uma Cadência?",
        description: "Entenda o conceito de movimento harmônico e por que algumas progressões 'resolvem'.",
        duration: "8 min",
        content: `
## O que é uma Cadência?

Uma **cadência** é um movimento harmônico que cria uma sensação de repouso ou suspensão. Em termos simples: é a forma como os acordes se movem para "terminar" uma frase musical.

### Tensão e Resolução

A música funciona em ciclos de **tensão → resolução**. O acorde de tensão "quer" ir para algum lugar, e quando chega lá, sentimos repouso.

> Pense como uma conversa: a pergunta cria tensão, a resposta resolve.

### Por que o V7 resolve para o I?

O acorde V7 (dominante) contém um **trítono** — o intervalo mais tenso da música. Em C maior, G7 = G B D F:
- A nota **B** quer subir meio tom para **C**
- A nota **F** quer descer meio tom para **E**

Esse "puxão" em direções opostas é o que cria a tensão que resolve em C.

### Tipos de Cadência

| Tipo | Movimento | Sensação |
|------|-----------|----------|
| Autêntica | V → I | Conclusão forte |
| Plagal | IV → I | "Amém", suave |
| Meia cadência | ? → V | Suspensão (pergunta) |
| Interrompida | V → vi | Surpresa |
| Deceptiva | V → VI | Engana a expectativa |

### Cadências no pagode

No pagode carioca, a cadência mais comum é:
> **ii - V - I** (Dm - G7 - C no tom de C)

Essa sequência cria um movimento harmônico rico e fluido, muito característico do gênero.
        `,
        tips: [
          "Cadência = movimento de tensão → resolução",
          "V7 resolve para I por causa do trítono interno",
          "Treino: toque G7 e sinta o 'puxão' para C",
        ],
      },
      {
        id: "cad-2",
        title: "Cadência Autêntica (V→I)",
        description: "A mais forte de todas — o movimento V7 para I que estrutura a harmonia ocidental.",
        duration: "10 min",
        content: `
## Cadência Autêntica

A **cadência autêntica** é o movimento V → I (ou V7 → I). É a mais conclusiva e mais usada na música ocidental — você a encontra em toda canção popular, samba, pagode e MPB.

### Perfeita vs Imperfeita

| Tipo | Condição | Força |
|------|----------|-------|
| Perfeita | V7 → I com tônica no baixo e soprano | Máxima conclusão |
| Imperfeita | V → I (sem 7ª, ou inversão) | Conclusão moderada |

### Dominante com preparação

A cadência autêntica fica mais elaborada com a adição do II grau antes do V:

> **ii - V - I** → Dm7 - G7 - C

Essa progressão de dois movimentos de quarta ascendente (D→G→C) cria um momentum harmônico muito forte.

### Resoluções no campo de C maior

| V7 | Resolve para | Grau |
|----|-------------|------|
| G7 | C           | I    |
| D7 | G           | IV (campo de G) |
| A7 | Dm          | ii   |
| E7 | Am          | vi   |

As últimas duas são **dominantes secundários** — veremos mais em Harmonia.

### Aplicação em pagode

A progressão final de muitos sambas é:
\`\`\`
... Dm7 → G7 → C → C7 → F → Fm → C ...
\`\`\`

Note como G7 → C é a cadência autêntica principal, e C7 → F é uma segunda cadência dentro da música.
        `,
        tips: [
          "ii-V-I é a progressão mais importante do jazz e samba sofisticado",
          "G7→C é a cadência autêntica básica em C",
          "Cada acorde dominante 7 tem um 'alvo' natural de resolução",
        ],
      },
      {
        id: "cad-3",
        title: "Cadência Plagal (IV→I)",
        description: "O 'Amém' da harmonia: suave, religiosa e muito usada no pop e MPB.",
        duration: "8 min",
        content: `
## Cadência Plagal

A **cadência plagal** é o movimento **IV → I**. É mais suave e menos conclusiva que a autêntica. Conhecida como o "Amém" da harmonia por ser muito usada em música religiosa, mas está presente em todo o pop e MPB.

### IV → I em C

> F → C

Enquanto G7→C tem uma tensão forte, F→C tem uma sensação de **repouso calmo**, quase como um suspiro.

### Variantes da Plagal

#### Plagal menor (iv → I)
> Fm → C

O **IV menor** resolve para o I maior criando um efeito dramático e emotivo. Muito usado no pop e em sambas melancólicos.

Exemplo de progressão clássica:
\`\`\`
C → C7 → F → Fm → C
\`\`\`
O Fm (IV menor emprestado) cria aquele "aperto no coração" antes de resolver.

#### Dupla plagal (♭VII → IV → I)
> B♭ → F → C

Muito usada no rock e MPB — ex: "Let It Be" dos Beatles é construída sobre isso.

### No samba e pagode

A progressão I → IV → iv → I é extremamente comum:
\`\`\`
C → F → Fm → C
\`\`\`

O Fm (empréstimo modal) resolve de volta para C com aquele sabor característico do samba-canção.

### Ouvindo cadências

- Cadência autêntica (V→I): "Si-lêncio" — queda forte
- Cadência plagal (IV→I): "A-mém" — queda suave
- Meia cadência (→V): "Mas..." — fica no ar

Treine identificar qual tipo de cadência está sendo usada nas músicas que você ouve.
        `,
        tips: [
          "IV→I = 'Amém' — conclusão suave e acolhedora",
          "iv→I (IV menor) = efeito dramático e emotivo — muito samba-canção",
          "C→F→Fm→C é uma das progressões mais emocionais do samba",
        ],
      },
      {
        id: "cad-4",
        title: "Cadência Interrompida (V→vi)",
        description: "A surpresa harmônica: quando o V resolve para o vi ao invés do I esperado.",
        duration: "10 min",
        content: `
## Cadência Interrompida

A **cadência interrompida** (ou deceptiva) ocorre quando o ouvinte espera que o V7 resolva para o I, mas ele vai para outro acorde — geralmente o **vi** (relativo menor).

### V → vi em vez de V → I

> G7 → Am (em vez de G7 → C)

Por que funciona? O Am (lá menor) tem duas notas em comum com C (dó maior): C e E. Então a "resolução" acontece, mas de forma inesperada — daí o nome "interrompida" ou "enganosa".

### Por que usar?

1. **Criar surpresa** — evita a conclusão esperada
2. **Estender a música** — a frase ainda precisa resolver de verdade
3. **Criar emoção** — o vi (menor) tem caráter mais melancólico que o I

### Sequência clássica

\`\`\`
... IV → V → vi → IV → V → I ...
\`\`\`

A música "fica na promessa" duas vezes antes de resolver de verdade.

### No pagode

Muito usada em momentos emotivos. Exemplo em Am:

\`\`\`
E7 → Am (cadência autêntica em Am)
E7 → F  (cadência interrompida — surpresa)
\`\`\`

### Substitutos comuns do I

O V pode resolver para:
| Destino | Relação | Efeito |
|---------|---------|--------|
| I       | Resolução normal | Conclusão |
| vi      | Relativo menor | Surpresa melancólica |
| I/3     | Inversão do I | Suave, continua |
| IV      | Movimento retrógrado | Raramente, muito surpresa |
        `,
        tips: [
          "G7→Am em vez de G7→C: surpresa que emociona",
          "Cadência interrompida 'adia' a resolução final",
          "Am e C compartilham notas C e E — por isso a 'pseudo-resolução' funciona",
        ],
      },
      {
        id: "cad-5",
        title: "II-V-I: O Turnaround",
        description: "A progressão mais importante do jazz e samba: domine o II-V-I em qualquer tom.",
        duration: "15 min",
        content: `
## II-V-I: O Turnaround

O **II-V-I** é a progressão harmônica mais importante do jazz, samba sofisticado e bossa nova. É o coração de centenas de músicas e o ponto de partida para improvisação.

### A progressão em C

> **Dm7 → G7 → Cmaj7**

Cada movimento é uma **quarta ascendente** (ou quinta descendente):
- D → G: quarta acima
- G → C: quarta acima

### Por que é tão eficaz?

O movimento de quarta ascendente (Dm→G→C) cria um **momentum harmônico** muito forte. O V7 tem tensão máxima, o I resolve. É como armar um gatilho (ii) → puxar o gatilho (V) → o tiro (I).

### II-V-I em todos os tons

| Tom | II | V | I |
|-----|----|---|---|
| C   | Dm7 | G7 | Cmaj7 |
| G   | Am7 | D7 | Gmaj7 |
| F   | Gm7 | C7 | Fmaj7 |
| D   | Em7 | A7 | Dmaj7 |
| A   | Bm7 | E7 | Amaj7 |
| E   | F#m7 | B7 | Emaj7 |

### Variações usadas no pagode

#### Com cromatismo
\`\`\`
Dm7 → Db7 → Cmaj7
\`\`\`
O Db7 é substituto tritônico do G7 — mesmo efeito, som mais moderno.

#### Com dominante secundário
\`\`\`
A7 → Dm7 → G7 → Cmaj7
\`\`\`
O A7 prepara o Dm (II/II — dominante do dominante).

### Músicas que usam II-V-I

Praticamente todo samba e pagode usa II-V-I em algum ponto. Analise "Não Foi a Toa" (Belo, C maior) e encontre o Dm7-G7-C!

### Prática recomendada

1. Toque Dm7 → G7 → Cmaj7 lentamente
2. Tente nos tons G, F e D
3. Improvise sobre o II-V-I com a escala de C maior
        `,
        tips: [
          "II-V-I = Dm7-G7-Cmaj7 em C — memorize em todos os tons",
          "Cada movimento é uma quarta acima (ou quinta abaixo)",
          "Substituto tritônico: Db7 pode substituir G7 antes do C",
        ],
        chords: ["Dm7", "G7", "Cmaj7"],
      },
    ],
  },
  {
    id: "harmonia",
    title: "Harmonia",
    description: "Una tudo que aprendeu: campo harmônico, empréstimo modal e análise aplicada ao pagode.",
    icon: "🎹",
    color: "rose",
    lessons: [
      {
        id: "har-1",
        title: "Campo Harmônico Maior",
        description: "O mapa completo da tonalidade maior: todos os acordes e suas funções.",
        duration: "15 min",
        content: `
## Campo Harmônico Maior

O **campo harmônico** é o conjunto de todos os acordes naturais de uma tonalidade. Quando uma música está "no tom de C", ela usa preferencialmente os acordes do campo de C maior.

### Campo de C Maior (tétrades)

| Grau | Numeral | Acorde | Função |
|------|---------|--------|--------|
| I    | IMaj7   | Cmaj7  | Tônica |
| II   | iim7    | Dm7    | Subdominante |
| III  | iiim7   | Em7    | Tônica substituta |
| IV   | IVMaj7  | Fmaj7  | Subdominante |
| V    | V7      | G7     | Dominante |
| VI   | vim7    | Am7    | Tônica relativa |
| VII  | viiø    | Bm7♭5  | Dominante substituta |

### As 3 Funções Harmônicas

**1. Tônica (T):** Centro de repouso. I, iii, vi.
**2. Subdominante (S):** Tensão leve, preparação. II, IV.
**3. Dominante (D):** Tensão forte, pede resolução. V, vii°.

### Movimento funcional típico

A harmonia tende a fluir:
\`\`\`
T → S → D → T
(I → IV → V → I)
(I → ii → V7 → I)
\`\`\`

### Campo de G Maior

| Grau | Acorde |
|------|--------|
| I    | Gmaj7 |
| II   | Am7 |
| III  | Bm7 |
| IV   | Cmaj7 |
| V    | D7 |
| VI   | Em7 |
| VII  | F#m7♭5 |

### Dica de transposição

Para qualquer tom, a estrutura é sempre a mesma:
- I, IV = Maior 7
- II, III, VI = Menor 7
- V = Dominante 7
- VII = Meio-diminuto
        `,
        tips: [
          "T→S→D→T é o fluxo harmônico universal",
          "V7 é sempre o dominante — o acorde de maior tensão",
          "Em qualquer tom: I e IV = maj7, II III VI = m7, V = 7, VII = m7b5",
        ],
        chords: ["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7b5"],
      },
      {
        id: "har-2",
        title: "Campo Harmônico Menor",
        description: "A escala menor e seus três campos: natural, harmônico e melódico.",
        duration: "15 min",
        content: `
## Campo Harmônico Menor

O campo menor é mais complexo que o maior porque existem **três versões** da escala menor, cada uma com seu campo harmônico.

### As 3 Escalas Menores

| Tipo | Fórmula (em Am) | Característica |
|------|----------------|----------------|
| Natural | A B C D E F G | Mais usada no pop/rock |
| Harmônica | A B C D E F G# | V7 real (E7 em vez de Em) |
| Melódica | A B C D E F# G# (subindo) | Jazz, bossa nova |

### Campo de A Menor Natural

| Grau | Acorde | Função |
|------|--------|--------|
| i    | Am7    | Tônica menor |
| ii°  | Bm7♭5  | Semi-diminuta |
| III  | Cmaj7  | Tônica substituta |
| iv   | Dm7    | Subdominante |
| v    | Em7    | Dominante (fraca) |
| VI   | Fmaj7  | Subdominante |
| VII  | G7     | Dominante secundária |

### Campo de A Menor Harmônica

Ao elevar o 7° grau (G → G#), o **v menor** vira **V7 dominante**:

| Grau | Acorde |
|------|--------|
| i    | Am(maj7) |
| ii°  | Bm7♭5 |
| III+ | C+ (aumentado) |
| iv   | Dm7 |
| **V** | **E7** ← Dominante real! |
| VI   | Fmaj7 |
| vii° | G#dim7 |

> O **E7** resolve para Am com tensão máxima — isso é a escala menor harmônica em ação.

### Misturando campos

Na prática, músicos misturam os três campos livremente:

\`\`\`
Am → Dm → E7 → Am → F → G → Am
   (nat.)  (harm.)      (nat.) (nat.)
\`\`\`

Esse tipo de mistura é o que dá a riqueza harmônica ao samba-canção e à MPB.
        `,
        tips: [
          "Am harmônica: sobe o G para G# → cria o E7 dominante real",
          "Na prática: misture os campos livre para obter riqueza harmônica",
          "Am → Dm → E7 → Am é o movimento básico do tango e flamenco",
        ],
      },
      {
        id: "har-3",
        title: "Empréstimo Modal",
        description: "Pegue acordes de outros modos para adicionar cor e tensão à harmonia.",
        duration: "12 min",
        content: `
## Empréstimo Modal

O **empréstimo modal** ocorre quando usamos acordes de outro modo (geralmente do campo menor paralelo) dentro de uma progressão maior. Isso cria momentos de surpresa e profundidade emocional.

### O mais comum: IV menor (iv)

Em C maior, o **Fm** (fá menor) é emprestado do campo de C menor:

> C → Am → **Fm** → C

O Fm cria aquela sensação de "aperto" antes de resolver para C. É uma das progressões mais usadas no pop e MPB.

### Acordes emprestados do campo menor paralelo

| Campo de C menor | Uso como empréstimo |
|-----------------|---------------------|
| Fm              | Muito comum — iv menor |
| Ab              | ♭VI — clima épico |
| Bb              | ♭VII — rock e pagode moderno |
| Eb              | ♭III — dramático |
| Abmaj7          | ♭VImaj7 — bossa nova sofisticada |

### Exemplo prático: "Pode Chorar" (Alexandre Pires, Tom C)

A progressão usa empréstimo modal em momentos emotivos:
\`\`\`
C → G → Am → Em → F → C → Fm → C
                              ↑
                         IV menor emprestado
\`\`\`

### ♭VII → I: o movimento modal clássico

O acorde **♭VII** (Bb em C maior) é emprestado do C Mixolídio:
> Bb → C — "aterrissa" de cima para baixo

Muito usado no rock e em samba moderno para dar um clima potente antes da tônica.

### Como usar

1. Identifique o IV menor do seu tom (ex: em G, o iv menor é Cm)
2. Insira antes de uma cadência final
3. Experimente ♭VII → I para um efeito impactante

Empréstimo modal dá profundidade à harmonia sem sair do tom — é uma das ferramentas mais poderosas do compositor.
        `,
        tips: [
          "Fm em C maior (iv menor emprestado) = 'aperto no coração'",
          "Bb em C maior (♭VII) = aterrissagem épica, muito rock/pagode moderno",
          "Empréstimo modal ≠ modulação — você permanece no tom original",
        ],
      },
      {
        id: "har-4",
        title: "Dominantes Secundários",
        description: "Adicione drama e tensão direcionando qualquer acorde com seu próprio dominante.",
        duration: "12 min",
        content: `
## Dominantes Secundários

Um **dominante secundário** é um acorde dominante V7 que resolve para um acorde que não é o I. Basicamente, qualquer acorde do campo pode ter seu próprio V7 preparando a chegada.

### Conceito

Em C maior, o V7 de C é G7. Mas e se quisermos "preparar" o Am (vi) com tensão especial? Usamos o **V7 de vi** — que é E7.

> E7 → Am (V7/vi)

O E7 não pertence ao campo de C maior (o campo tem Em7), mas "empresta" a tensão do dominante para direcionar para Am.

### Dominantes secundários em C

| Alvo | Dominante Secundário | Movimento |
|------|---------------------|-----------|
| Dm (ii) | A7 | A7 → Dm |
| Em (iii) | B7 | B7 → Em |
| F (IV) | C7 | C7 → F |
| G (V) | D7 | D7 → G |
| Am (vi) | **E7** | **E7 → Am** |

> Nota: não usamos V7/I (seria apenas G7 → C, a cadência principal).

### O mais usado no pagode: E7 → Am

A sequência:
\`\`\`
C → E7 → Am → Dm → G7 → C
\`\`\`

O E7 cria uma tensão extra antes do Am, tornando o movimento muito mais expressivo. É ubíquo no pagode carioca.

### Cadeia de dominantes

Você pode criar uma cadeia de dominantes secundários:
\`\`\`
A7 → D7 → G7 → C
\`\`\`

Cada acorde prepara o próximo — cria um momentum avassalador que resolve no I.

### C7 → F: dentro do campo

Interessante: C7 (acorde de C com 7ª menor) é o V7/IV. Muito usado para "ir para o IV" com mais peso:

> C → C7 → F — o C7 direciona para F com mais tensão

Isso é chamado de **mixolídio temporário** — momentaneamente o C soa como dominante.
        `,
        tips: [
          "E7→Am é o dominante secundário mais usado no pagode",
          "C→C7→F: C7 é o V7/IV — direciona para F com mais drama",
          "Cadeia A7→D7→G7→C: momentum avassalador para o I",
        ],
      },
      {
        id: "har-5",
        title: "Progressões no Pagode e Samba",
        description: "Análise das progressões mais usadas no repertório: dos clássicos ao pagode moderno.",
        duration: "15 min",
        content: `
## Progressões no Pagode e Samba

Vamos analisar as progressões harmônicas mais usadas no gênero. Conhecer esses padrões permite tocar e criar músicas no estilo com mais facilidade.

### 1. A progressão clássica do samba (I-IV-V)

\`\`\`
C → F → G7 → C
(I → IV → V7 → I)
\`\`\`

Base de centenas de sambas. Simples, mas poderosa.

### 2. Com ii-V-I estendido

\`\`\`
C → Am → Dm → G7 → C
(I → vi → ii → V7 → I)
\`\`\`

O vi (Am) suaviza a entrada no ii (Dm), criando um fluxo mais fluido.

### 3. Com empréstimo modal e dominantes secundários

\`\`\`
C → E7 → Am → A7 → Dm → G7 → C → C7 → F → Fm → C
\`\`\`

Esta progressão usa:
- **E7** → dominante secundário (V7/vi)
- **A7** → dominante secundário (V7/ii)
- **C7** → dominante secundário (V7/IV)
- **Fm** → IV menor emprestado (empréstimo modal)

### 4. Progressão "Pagode de Botequim" (ton Am)

\`\`\`
Am → E7 → Am → Am7/G → F → E7
Am → Dm → E7 → Am
\`\`\`

Andamento menor com E7 como dominante. O Am7/G (inversão) cria linha de baixo descendente.

### 5. Análise: "Não Foi a Toa" - Belo (Tom C)

Progressão simplificada:
\`\`\`
Intro:  Cmaj7 → Am7 → Dm7 → G7
Verso:  C → E7 → Am → C7 → F → Fm → C → G7
Refrão: C → Am → Dm → G7 → C
\`\`\`

### 6. Progressão "Pagode Moderno" (Bom Gosto / Dilsinho)

\`\`\`
C → Am → F → G (I-vi-IV-V)
\`\`\`

O formato I-vi-IV-V popularizado no pop americano também domina o pagode dos anos 2000.

### O "Groove" Harmônico

No pagode, a harmonia raramente fica parada. O cavaquinho e o violão fazem variações rítmicas constantes, mas as progressões acima são a base estrutural de 80% das músicas do gênero.
        `,
        tips: [
          "I-vi-IV-V (C-Am-F-G) é a progressão do pagode moderno",
          "ii-V-I mais E7→Am mais C7→F = progressão completa do samba rico",
          "Analise as cifras do seu repertório — você vai reconhecer esses padrões",
        ],
        chords: ["C", "Am", "Dm", "G7", "E7", "F", "Fm"],
      },
      {
        id: "har-6",
        title: "Análise Harmônica Aplicada",
        description: "Coloque em prática: analise e transponha músicas do seu repertório.",
        duration: "20 min",
        content: `
## Análise Harmônica Aplicada

Chegamos ao ponto de integração: aplicar tudo que aprendemos para **analisar músicas reais** e **transpor para qualquer tom**.

### Metodologia de Análise

**Passo 1:** Identifique o tom da música (procure o acorde que "soa como casa")

**Passo 2:** Escreva os numerais romanos de cada acorde
- Verifique se o acorde pertence ao campo natural
- Se não pertencer: dominante secundário? empréstimo modal?

**Passo 3:** Identifique as cadências (V-I, ii-V-I, IV-I)

**Passo 4:** Anote padrões repetidos — geralmente 2-4 acordes que se repetem

### Análise: "Eu Sou o Samba" - Alexandre Pires (Tom C#)

\`\`\`
Verso: C# → G#7 → C#m → A# → D# → G#7
       (I)   (V7)   (vi)  (♭VII) (II?) (V7)
\`\`\`

Nota: O A# e o D# são empréstimos modais — campo de C# misturado com elementos do paralelo menor.

### Análise: "A Voz do Morro" - Diogo Nogueira (Tom A)

\`\`\`
A → D → E7 → A (I-IV-V7-I básico do samba)
A → C#7 → F#m → B7 → E7 → A (com dominantes secundários)
\`\`\`

### Transposição Rápida

Com os numerais em mãos, transpor é trivial:

| Numeral | Tom C | Tom G | Tom D | Tom A |
|---------|-------|-------|-------|-------|
| I       | C     | G     | D     | A     |
| ii      | Dm    | Am    | Em    | Bm    |
| IV      | F     | C     | G     | D     |
| V7      | G7    | D7    | A7    | E7    |
| vi      | Am    | Em    | Bm    | F#m   |

### Exercício Final

1. Escolha uma cifra do seu repertório
2. Escreva os numerais romanos de cada acorde
3. Transpõe a música para 3 tons diferentes
4. Identifique pelo menos uma cadência e um dominante secundário

### Próximos Passos

Com o domínio do campo harmônico, cadências, empréstimo modal e dominantes secundários, você tem as ferramentas para:
- Analisar qualquer música
- Criar harmonizações originais
- Improvisar com consciência
- Transpor instantaneamente

**Continue praticando com as cifras da biblioteca — teoria sem prática é apenas teoria!**
        `,
        tips: [
          "Numerais romanos primeiro, notas depois — assim você transpõe em qualquer tom",
          "80% das músicas usam só 3-4 progressões que você já conhece",
          "Analise 1 música por semana — em 3 meses você lê harmonia naturalmente",
        ],
      },
      {
        id: "har-7",
        title: "Dominante Substituto (SubV)",
        description: "Substituição por trítono: cromatismo sofisticado no samba e bossa nova.",
        duration: "12 min",
        content: `
## Dominante Substituto (SubV)

O **dominante substituto** (SubV ou Sub V) é um dos recursos mais sofisticados da harmonia popular. Usado amplamente na bossa nova, jazz e samba moderno.

### O Conceito

O SubV substitui o V7 por um acorde a **6 semitons** (trítono) de distância. Funciona porque ambos compartilham o mesmo **trítono interno**.

### Exemplo em C

- **V7 original:** G7 → contém B e F (trítono)
- **SubV:** Db7 → contém F e B (Cb) — **mesmo trítono!**
- Resolução: Db7 → C (desce meio tom cromaticamente)

### Na Prática

| Cadência original | Com SubV | Efeito |
|---|---|---|
| Dm7 → G7 → C | Dm7 → **Db7** → C | Cromatismo: Ré → Réb → Dó |
| Am7 → D7 → G | Am7 → **Ab7** → G | Cromatismo: Lá → Láb → Sol |
| Em7 → A7 → Dm | Em7 → **Eb7** → Dm | Cromatismo: Mi → Mib → Ré |

### Tabela de SubV para Todos os Tons

| Tom (I) | V7 | SubV |
|---|---|---|
| C | G7 | Db7 |
| G | D7 | Ab7 |
| D | A7 | Eb7 |
| A | E7 | Bb7 |
| F | C7 | Gb7 |
| Bb | F7 | B7 |

### Aplicação Avançada: Cadeia com SubV

A7 → D7 → **Db7** → C

Combina dominante secundário (A7→Dm) com SubV (Db7→C) para criar uma linha cromática descendente no baixo.

### No Pagode e Bossa Nova

A bossa nova de Tom Jobim é repleta de SubV:
- "Garota de Ipanema": usa Db7 como SubV de G7
- "Desafinado": substitutos tritônicos em cascata
- No pagode moderno: Thiaguinho e Sorriso Maroto usam SubV para sofisticar o refrão
        `,
        tips: [
          "O SubV sempre fica meio tom ACIMA do acorde de resolução (Db7→C)",
          "Na dúvida, conte 6 semitons a partir do V7 — esse é o SubV",
          "Dm7→Db7→C: ouça o baixo descer cromaticamente Ré-Réb-Dó",
        ],
        chords: ["Dm7", "G7", "Db7", "C"],
      },
      {
        id: "har-8",
        title: "Combinando Campos Harmônicos",
        description: "Misture campos maior, menor natural, harmônica e melódica em uma única progressão.",
        duration: "15 min",
        content: `
## Combinando Campos Harmônicos

Na prática, os grandes compositores de samba e pagode **não usam um único campo harmônico**. Eles misturam livremente acordes de diferentes campos para criar riqueza harmônica.

### Os 4 Campos de Lá menor

| Campo | Escala | V grau | Característica |
|---|---|---|---|
| Natural | A B C D E F G | Em7 (fraco) | Suave, modal |
| Harmônica | A B C D E F G# | E7 (forte!) | Tensão dramática |
| Melódica | A B C D E F# G# | E7 + F#ø | Jazz/bossa |
| Dórica | A B C D E F# G | F#ø + D7 | Funk/samba moderno |

### Progressão Mista (muito usada no samba)

Am → Dm → **E7** → Am → **F** → **G7** → Am

- Am, Dm: campo natural
- **E7**: campo harmônico (G# na terça, cria tensão real)
- **F, G7**: empréstimo do campo de C maior (relativa)

### Como Funciona

1. Use o campo **natural** como base (i → iv)
2. Sempre que precisar resolver no i, use **V7 da harmônica** (E7→Am)
3. Para suavizar, empreste acordes da **relativa maior** (F, G7, C)
4. Para sofisticar, use **ii-V de campos vizinhos**

### Exemplo: "Carinhoso" (Pixinguinha)

Mistura magistral de campos:
- **F** (campo maior principal)
- **E7→Am** (harmônica menor de Am)
- **D7→Gm** (dominante secundário)
- Resultado: riqueza harmônica que não "briga" — flui naturalmente
        `,
        tips: [
          "Pense em campos como paletas de cores — você pode misturar livremente",
          "O V7 da harmônica (E7 em Am) é o mais importante: cria resolução real",
          "Ouça sambas de Cartola e Pixinguinha — eles são mestres da mistura de campos",
        ],
        chords: ["Am", "Dm", "E7", "F", "G7", "C"],
      },
    ],
  },
]

export function getModule(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id)
}

export function getLesson(moduleId: string, lessonId: string) {
  const mod = getModule(moduleId)
  return mod?.lessons.find((l) => l.id === lessonId)
}
