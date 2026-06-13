import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getModule } from "@/lib/escola-content"
import { ProgressBar } from "@/components/escola/ProgressBar"

export const dynamic = "force-dynamic"

const ICON_COLOR: Record<string, string> = {
  violet: "text-violet-400",
  indigo: "text-indigo-400",
  emerald: "text-emerald-400",
  rose: "text-rose-400",
}

export default async function ModulePage({ params }: { params: { modulo: string } }) {
  const mod = getModule(params.modulo)
  if (!mod) notFound()

  const session = await getServerSession(authOptions)
  const progressRecords = await prisma.userProgress.findMany({
    where: { userId: session!.user!.id, moduleId: mod.id, completed: true },
    select: { lessonId: true },
  })
  const completedSet = new Set(progressRecords.map((r) => r.lessonId))

  const completed = completedSet.size
  const total = mod.lessons.length

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/escola" className="hover:text-slate-300 transition-colors">
          Escola
        </Link>
        <span>/</span>
        <span className="text-slate-300">{mod.title}</span>
      </div>

      {/* Header do módulo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{mod.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">{mod.title}</h1>
            <p className="text-slate-400 text-sm">{mod.description}</p>
          </div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="bg-[#120d24] border border-violet-500/20 rounded-2xl p-5 mb-8">
        <ProgressBar completed={completed} total={total} />
        {completed === total ? (
          <p className="text-xs text-emerald-400 mt-2 font-medium">Módulo concluído!</p>
        ) : completed > 0 ? (
          <p className="text-xs text-slate-500 mt-2">Continue de onde parou</p>
        ) : (
          <p className="text-xs text-slate-500 mt-2">Comece pela primeira lição</p>
        )}
      </div>

      {/* Lista de lições */}
      <div className="space-y-2">
        {mod.lessons.map((lesson, idx) => {
          const isDone = completedSet.has(lesson.id)
          const isNext = !isDone && idx === mod.lessons.findIndex((l) => !completedSet.has(l.id))

          return (
            <Link
              key={lesson.id}
              href={`/escola/${mod.id}/${lesson.id}`}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 group ${
                isDone
                  ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
                  : isNext
                  ? "bg-violet-600/10 border-violet-500/30 hover:border-violet-400/50"
                  : "bg-[#120d24] border-white/5 hover:border-white/20"
              }`}
            >
              {/* Número / check */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  isDone
                    ? "bg-emerald-500/20 text-emerald-400"
                    : isNext
                    ? "bg-violet-600/30 text-violet-300"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium text-sm ${
                    isDone ? "text-slate-300" : isNext ? "text-white" : "text-slate-400"
                  }`}
                >
                  {lesson.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{lesson.description}</p>
              </div>

              {/* Duração */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-slate-500">{lesson.duration}</span>
                <span className={`text-slate-600 group-hover:text-slate-400 transition-colors`}>›</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
