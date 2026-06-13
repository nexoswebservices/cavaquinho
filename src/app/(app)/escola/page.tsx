import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { MODULES } from "@/lib/escola-content"
import { ModuleGrid } from "@/components/escola/ModuleGrid"

export const dynamic = "force-dynamic"

const COLOR_MAP: Record<string, string> = {
  violet: "from-violet-600/20 to-violet-800/10 border-violet-500/30 hover:border-violet-400/50",
  indigo: "from-indigo-600/20 to-indigo-800/10 border-indigo-500/30 hover:border-indigo-400/50",
  emerald: "from-emerald-600/20 to-emerald-800/10 border-emerald-500/30 hover:border-emerald-400/50",
  rose: "from-rose-600/20 to-rose-800/10 border-rose-500/30 hover:border-rose-400/50",
}

export default async function EscolaPage() {
  const session = await getServerSession(authOptions)

  const progressRecords = await prisma.userProgress.findMany({
    where: { userId: session!.user!.id, completed: true },
    select: { moduleId: true, lessonId: true },
  })

  const completedSet = new Set(progressRecords.map((r) => `${r.moduleId}:${r.lessonId}`))

  const modulesWithProgress = MODULES.map((mod) => {
    const completed = mod.lessons.filter((l) => completedSet.has(`${mod.id}:${l.id}`)).length
    return { ...mod, completed, colorClass: COLOR_MAP[mod.color] ?? COLOR_MAP.violet }
  })

  const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0)
  const totalCompleted = completedSet.size

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Escola de Música</h1>
        <p className="text-slate-400">
          Aprenda harmonia, escalas, acordes e cadências do pagode e samba.
        </p>
      </div>

      {/* Progresso geral */}
      {totalCompleted > 0 && (
        <div className="mb-8 bg-[#120d24] border border-violet-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Progresso geral</span>
            <span className="text-sm font-bold text-violet-400">
              {Math.round((totalCompleted / totalLessons) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="h-2 bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-700"
              style={{ width: `${(totalCompleted / totalLessons) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {totalCompleted} de {totalLessons} lições concluídas
          </p>
        </div>
      )}

      {/* Módulos */}
      <ModuleGrid modules={modulesWithProgress} />
    </div>
  )
}
