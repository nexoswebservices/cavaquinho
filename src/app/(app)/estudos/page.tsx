import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { MODULES } from "@/lib/escola-content"

export const dynamic = "force-dynamic"

const XP_POR_LICAO = 15
const XP_POR_NIVEL = 100

interface Conquista {
  id: string
  icone: string
  nome: string
  descricao: string
  conquistada: boolean
}

function rank(level: number): string {
  if (level <= 2) return 'Iniciante'
  if (level <= 5) return 'Aprendiz'
  if (level <= 9) return 'Músico'
  return 'Mestre'
}

function rankColor(level: number): string {
  if (level <= 2) return 'text-slate-400'
  if (level <= 5) return 'text-sky-400'
  if (level <= 9) return 'text-violet-400'
  return 'text-amber-400'
}

export default async function EstudosPage() {
  const session = await getServerSession(authOptions)

  const progressRecords = await prisma.userProgress.findMany({
    where: { userId: session!.user!.id, completed: true },
    select: { moduleId: true, lessonId: true },
  })

  const completedSet = new Set(progressRecords.map((r) => `${r.moduleId}:${r.lessonId}`))
  const totalCompleted = completedSet.size
  const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0)

  const totalXP = totalCompleted * XP_POR_LICAO
  const nivel = Math.floor(totalXP / XP_POR_NIVEL) + 1
  const xpAtual = totalXP % XP_POR_NIVEL
  const xpPercent = (xpAtual / XP_POR_NIVEL) * 100

  // Próxima lição não concluída
  let proximaLicao: { modId: string; licaoId: string; modTitulo: string; licaoTitulo: string } | null = null
  outer: for (const mod of MODULES) {
    for (const l of mod.lessons) {
      if (!completedSet.has(`${mod.id}:${l.id}`)) {
        proximaLicao = {
          modId: mod.id,
          licaoId: l.id,
          modTitulo: mod.title,
          licaoTitulo: l.title,
        }
        break outer
      }
    }
  }

  // Módulos com contagem
  const modulosComProgresso = MODULES.map((mod) => {
    const concluidas = mod.lessons.filter((l) => completedSet.has(`${mod.id}:${l.id}`)).length
    const estrelas = concluidas === 0 ? 0
      : concluidas < mod.lessons.length / 2 ? 1
      : concluidas < mod.lessons.length ? 2
      : 3
    return { ...mod, concluidas, estrelas }
  })

  // Conquistas
  const conquistas: Conquista[] = [
    {
      id: 'primeira',
      icone: '🎵',
      nome: 'Primeiro Acorde',
      descricao: 'Completou a primeira lição',
      conquistada: totalCompleted >= 1,
    },
    {
      id: 'cinco',
      icone: '🎸',
      nome: 'Em Ritmo',
      descricao: 'Completou 5 lições',
      conquistada: totalCompleted >= 5,
    },
    {
      id: 'modulo',
      icone: '⭐',
      nome: 'Módulo Completo',
      descricao: 'Completou todas as lições de um módulo',
      conquistada: modulosComProgresso.some((m) => m.estrelas === 3),
    },
    {
      id: 'dez',
      icone: '🏆',
      nome: 'Harmonia Total',
      descricao: 'Completou 10 lições',
      conquistada: totalCompleted >= 10,
    },
    {
      id: 'tudo',
      icone: '🎓',
      nome: 'Mestre do Cavaquinho',
      descricao: 'Completou todas as lições da escola',
      conquistada: totalCompleted >= totalLessons,
    },
    {
      id: 'cifra',
      icone: '📚',
      nome: 'Cifrador',
      descricao: 'Explorou a seção de Cifras',
      conquistada: false,  // Would need tracking, leave as easter egg
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Estudos</h1>
        <p className="text-slate-400">Seu progresso gamificado na escola de música.</p>
      </div>

      {/* XP e Nível */}
      <div className="bg-gradient-to-br from-violet-600/20 to-violet-800/10 border border-violet-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-sm font-semibold mb-0.5 ${rankColor(nivel)}`}>{rank(nivel)}</p>
            <p className="text-3xl font-bold text-white">Nível {nivel}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-0.5">XP total</p>
            <p className="text-xl font-bold text-violet-300">{totalXP} XP</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{xpAtual} / {XP_POR_NIVEL} XP</span>
            <span>Próximo nível</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2.5">
            <div
              className="h-2.5 bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-700"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-3">
          {totalCompleted} de {totalLessons} lições • {XP_POR_LICAO} XP por lição
        </p>
      </div>

      {/* Próxima lição */}
      {proximaLicao && (
        <div className="bg-[#120d24] border border-emerald-500/20 rounded-2xl p-5">
          <p className="text-xs text-emerald-400 font-semibold mb-1">Continuar de onde parou</p>
          <p className="text-white font-semibold mb-0.5">{proximaLicao.licaoTitulo}</p>
          <p className="text-slate-500 text-sm mb-4">{proximaLicao.modTitulo}</p>
          <Link
            href={`/escola/${proximaLicao.modId}/${proximaLicao.licaoId}`}
            className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Estudar agora →
          </Link>
        </div>
      )}

      {totalCompleted >= totalLessons && (
        <div className="bg-[#120d24] border border-amber-500/20 rounded-2xl p-5 text-center">
          <p className="text-3xl mb-2">🎓</p>
          <p className="text-white font-bold">Escola completa!</p>
          <p className="text-slate-400 text-sm">Você concluiu todas as lições. Continue praticando com as Cifras e o Quiz.</p>
        </div>
      )}

      {/* Módulos */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Módulos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modulosComProgresso.map((mod) => (
            <Link
              key={mod.id}
              href={`/escola/${mod.id}`}
              className="bg-[#120d24] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{mod.icon}</span>
                  <span className="text-white font-medium text-sm">{mod.title}</span>
                </div>
                <span className="text-sm">
                  {'⭐'.repeat(mod.estrelas)}{'☆'.repeat(3 - mod.estrelas)}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1">
                <div
                  className="h-1.5 bg-violet-500 rounded-full"
                  style={{ width: `${(mod.concluidas / mod.lessons.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {mod.concluidas}/{mod.lessons.length} lições • {mod.concluidas * XP_POR_LICAO} XP
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Conquistas */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Conquistas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {conquistas.map((c) => (
            <div
              key={c.id}
              className={`rounded-2xl p-4 text-center border transition-colors ${
                c.conquistada
                  ? 'bg-[#120d24] border-violet-500/20'
                  : 'bg-[#0d0920] border-white/5 opacity-40'
              }`}
            >
              <div className="text-3xl mb-2">{c.icone}</div>
              <p className="text-white font-semibold text-xs mb-1">{c.nome}</p>
              <p className="text-slate-500 text-xs">{c.descricao}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
