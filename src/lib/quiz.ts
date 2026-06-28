import { campoHarmonico } from './teoria'
import type { Mode } from './teoria'

const NOTAS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const
const TO_NORM: Record<string, string> = { Eb: 'D#', Ab: 'G#', Bb: 'A#' }
const MODES: Mode[] = ['major', 'minor']
const MODE_PT: Record<Mode, string> = { major: 'maior', minor: 'menor' }
const ROMAN_NOMES = ['I', 'ii', 'iii', 'IV', 'V7', 'vi', 'viiº']

export interface Pergunta {
  id: string
  texto: string
  opcoes: string[]
  correta: number
  explicacao: string
}

function rand<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function otherNotas(exclude: string, n: number): string[] {
  const others = NOTAS.filter((n) => n !== exclude)
  return shuffle(others).slice(0, n)
}

// Campo helper
function campo(nota: string, mode: Mode) {
  const root = TO_NORM[nota] ?? nota
  return campoHarmonico(root, mode)
}

// ── Question generators ────────────────────────────────────────────────────

function perguntaV7(nota: string, mode: Mode): Pergunta {
  const c = campo(nota, mode)
  const correct = c[4].example  // V7 is degree index 4
  const wrongs = otherNotas(c[4].root, 3).map((n) => n + '7')
  const opcoes = shuffle([correct, ...wrongs])
  return {
    id: `v7-${nota}-${mode}`,
    texto: `Qual é o acorde V7 (dominante) de ${nota} ${MODE_PT[mode]}?`,
    opcoes,
    correta: opcoes.indexOf(correct),
    explicacao: `Em ${nota} ${MODE_PT[mode]}, o V7 é ${correct} — o acorde que gera mais tensão e resolve no I (${c[0].example}).`,
  }
}

function perguntaII(nota: string): Pergunta {
  const c = campo(nota, 'major')
  const correct = c[1].example  // ii is index 1
  const wrongs = otherNotas(c[1].root, 3).map((n) => n + 'm')
  const opcoes = shuffle([correct, ...wrongs])
  return {
    id: `ii-${nota}`,
    texto: `Qual é o acorde ii (supertônica) de ${nota} maior?`,
    opcoes,
    correta: opcoes.indexOf(correct),
    explicacao: `Em ${nota} maior, o ii é ${correct}. Ele é o pré-dominante da famosa cadência ii – V7 – I.`,
  }
}

function perguntaIV(nota: string, mode: Mode): Pergunta {
  const c = campo(nota, mode)
  const correct = c[3].example  // IV is index 3
  const wrongs = otherNotas(c[3].root, 3).map((n) =>
    mode === 'major' ? n : n + 'm'
  )
  const opcoes = shuffle([correct, ...wrongs])
  return {
    id: `iv-${nota}-${mode}`,
    texto: `Qual é o acorde IV (subdominante) de ${nota} ${MODE_PT[mode]}?`,
    opcoes,
    correta: opcoes.indexOf(correct),
    explicacao: `Em ${nota} ${MODE_PT[mode]}, o IV é ${correct}. A cadência IV – I é chamada de plagal.`,
  }
}

function perguntaVI(nota: string): Pergunta {
  const c = campo(nota, 'major')
  const correct = c[5].example  // vi is index 5
  const wrongs = otherNotas(c[5].root, 3).map((n) => n + 'm')
  const opcoes = shuffle([correct, ...wrongs])
  return {
    id: `vi-${nota}`,
    texto: `Qual é o acorde vi (relativa menor) de ${nota} maior?`,
    opcoes,
    correta: opcoes.indexOf(correct),
    explicacao: `Em ${nota} maior, o vi é ${correct}. A relativa menor compartilha as mesmas notas da tonalidade maior.`,
  }
}

function perguntaQualGrau(nota: string, mode: Mode): Pergunta {
  const c = campo(nota, mode)
  const grauIdx = [0, 1, 3, 4, 5][Math.floor(Math.random() * 5)]  // I, ii, IV, V, vi
  const chord = c[grauIdx].example
  const correct = ROMAN_NOMES[grauIdx]
  const wrongIdxs = [0, 1, 2, 3, 4, 5, 6].filter((i) => i !== grauIdx)
  const wrongs = shuffle(wrongIdxs).slice(0, 3).map((i) => ROMAN_NOMES[i])
  const opcoes = shuffle([correct, ...wrongs])
  return {
    id: `grau-${nota}-${mode}-${grauIdx}`,
    texto: `O acorde ${chord} é qual grau de ${nota} ${MODE_PT[mode]}?`,
    opcoes,
    correta: opcoes.indexOf(correct),
    explicacao: `${chord} é o grau ${correct} de ${nota} ${MODE_PT[mode]}. ${
      grauIdx === 4 ? 'O V7 é o dominante — o acorde que mais cria tensão.' :
      grauIdx === 0 ? 'O I é a tônica — o acorde de repouso.' :
      grauIdx === 3 ? 'O IV é a subdominante — cria afastamento da tônica.' :
      grauIdx === 1 ? 'O ii é a supertônica — pré-dominante essencial no samba.' :
      'O vi é a superdominante — relativa menor da tônica.'
    }`,
  }
}

function perguntaCampoCompletar(nota: string, mode: Mode): Pergunta {
  const c = campo(nota, mode)
  const grauIdx = [1, 3, 4, 5][Math.floor(Math.random() * 4)]
  const correct = c[grauIdx].example
  const roman = ROMAN_NOMES[grauIdx]
  const wrongIdxs = [0, 1, 2, 3, 4, 5, 6].filter((i) => i !== grauIdx)
  const wrongChords = shuffle(wrongIdxs).slice(0, 3).map((i) => c[i].example)
  const opcoes = shuffle([correct, ...wrongChords])
  return {
    id: `campo-${nota}-${mode}-${grauIdx}`,
    texto: `Em ${nota} ${MODE_PT[mode]}, qual é o acorde ${roman}?`,
    opcoes,
    correta: opcoes.indexOf(correct),
    explicacao: `Em ${nota} ${MODE_PT[mode]}, o acorde ${roman} é ${correct}.`,
  }
}

function perguntaCadencia(nota: string): Pergunta {
  const c = campo(nota, 'major')
  type CadInfo = { chords: string[], nome: string, exp: string }
  const cadencias: CadInfo[] = [
    {
      chords: [c[1].example, c[4].example, c[0].example],
      nome: 'ii – V7 – I (Cadência de jazz/samba)',
      exp: `${c[1].example} → ${c[4].example} → ${c[0].example} é a cadência ii–V7–I, muito usada no samba.`,
    },
    {
      chords: [c[4].example, c[0].example],
      nome: 'V7 – I (Cadência autêntica perfeita)',
      exp: `${c[4].example} → ${c[0].example} é a cadência autêntica perfeita — máxima tensão resolvendo no I.`,
    },
    {
      chords: [c[3].example, c[0].example],
      nome: 'IV – I (Cadência plagal)',
      exp: `${c[3].example} → ${c[0].example} é a cadência plagal (IV–I), também chamada "cadência amém".`,
    },
    {
      chords: [c[4].example, c[5].example],
      nome: 'V7 – vi (Cadência deceptiva)',
      exp: `${c[4].example} → ${c[5].example} é uma cadência deceptiva: o V7 "engana" resolvendo no vi em vez do I.`,
    },
  ]
  const chosen = rand(cadencias)
  const correto = chosen.nome
  const errados = cadencias.filter((x) => x.nome !== correto).map((x) => x.nome)
  const opcoes = shuffle([correto, ...errados.slice(0, 3)])
  return {
    id: `cad-${nota}`,
    texto: `A sequência ${chosen.chords.join(' → ')} em ${nota} maior é:`,
    opcoes,
    correta: opcoes.indexOf(correto),
    explicacao: chosen.exp,
  }
}

// ── Main generator ─────────────────────────────────────────────────────────

const GERADORES = [
  () => { const n = rand(NOTAS); return perguntaV7(n, rand(MODES)) },
  () => { const n = rand(NOTAS); return perguntaII(n) },
  () => { const n = rand(NOTAS); return perguntaIV(n, rand(MODES)) },
  () => { const n = rand(NOTAS); return perguntaVI(n) },
  () => { const n = rand(NOTAS); return perguntaQualGrau(n, rand(MODES)) },
  () => { const n = rand(NOTAS); return perguntaCampoCompletar(n, rand(MODES)) },
  () => { const n = rand(NOTAS); return perguntaCadencia(n) },
  () => { const n = rand(NOTAS); return perguntaFuncao(n) },
  () => { const n = rand(NOTAS); return perguntaTensao(n) },
  () => { const n = rand(NOTAS); return perguntaSubV(n) },
]

function perguntaFuncao(nota: string): Pergunta {
  const normRoot = TO_NORM[nota] ?? nota
  const campo = campoHarmonico(normRoot, 'major')
  const grauIdx = rand([0, 1, 2, 3, 4, 5, 6])
  const acorde = campo[grauIdx]
  const funcoes = ['Tônica', 'Subdominante', 'Dominante'] as const
  const correta = funcoes.indexOf(acorde.fn)

  return {
    id: `funcao-${nota}-${grauIdx}`,
    texto: `Qual a FUNÇÃO harmônica do grau ${acorde.degree} (${acorde.example}) no campo de ${nota} maior?`,
    opcoes: [...funcoes],
    correta,
    explicacao: `O grau ${acorde.degree} tem função de ${acorde.fn}. Tônica = repouso (I, iii, vi), Subdominante = afastamento (ii, IV), Dominante = tensão (V, viiº).`,
  }
}

function perguntaTensao(nota: string): Pergunta {
  const normRoot = TO_NORM[nota] ?? nota
  const campo = campoHarmonico(normRoot, 'major')
  const grausComTensao = [0, 1, 3, 4, 5] // graus com tensões interessantes
  const grauIdx = rand(grausComTensao)
  const acorde = campo[grauIdx]

  const tensoesCorretas = acorde.tensions
  const todasTensoes = ['9', 'b9', '#9', '11', '#11', '13', 'b13']
  const erradas = todasTensoes.filter(t => !tensoesCorretas.includes(t))

  const opcoes = [
    tensoesCorretas.join(', '),
    rand(erradas) + ', ' + rand(erradas),
    'Nenhuma tensão disponível',
    rand(todasTensoes) + ', ' + rand(todasTensoes),
  ]

  return {
    id: `tensao-${nota}-${grauIdx}`,
    texto: `Quais tensões estão disponíveis para ${acorde.example} (grau ${acorde.degree}) no campo de ${nota} maior?`,
    opcoes,
    correta: 0,
    explicacao: `O grau ${acorde.degree} (${acorde.label}) aceita as tensões: ${tensoesCorretas.join(', ')}. Tensões que colidem com notas do acorde são evitadas.`,
  }
}

function perguntaSubV(nota: string): Pergunta {
  const normRoot = TO_NORM[nota] ?? nota
  const campo = campoHarmonico(normRoot, 'major')
  const v7 = campo[4]

  // SubV = 6 semitons acima do V
  const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const vIdx = CHROMATIC.indexOf(normRoot === v7.root ? v7.root : (TO_NORM[v7.root] ?? v7.root))
  // V root is at scale degree 5
  const vRoot = CHROMATIC[(CHROMATIC.indexOf(normRoot) + 7) % 12]
  const subVRoot = CHROMATIC[(CHROMATIC.indexOf(vRoot) + 6) % 12]
  const subV = subVRoot + '7'

  const wrongs = [0, 1, 2].map(i => CHROMATIC[(CHROMATIC.indexOf(subVRoot) + 2 + i * 3) % 12] + '7')
  const opcoes = [subV, ...wrongs]

  return {
    id: `subv-${nota}`,
    texto: `No tom de ${nota} maior, qual é o dominante substituto (SubV) de ${vRoot}7?`,
    opcoes,
    correta: 0,
    explicacao: `O SubV de ${vRoot}7 é ${subV} — fica a 6 semitons (trítono) e compartilha o mesmo trítono interno. Resolve cromaticamente: ${subV}→${campo[0].example}.`,
  }
}

export function gerarPerguntas(n = 10): Pergunta[] {
  const perguntas: Pergunta[] = []
  const idsUsados = new Set<string>()

  let tentativas = 0
  while (perguntas.length < n && tentativas < n * 5) {
    tentativas++
    const gerador = rand(GERADORES)
    const p = gerador()
    if (!idsUsados.has(p.id)) {
      idsUsados.add(p.id)
      perguntas.push(p)
    }
  }

  return perguntas
}
