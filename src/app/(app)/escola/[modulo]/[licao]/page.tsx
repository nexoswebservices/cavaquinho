import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getModule, getLesson } from "@/lib/escola-content"
import { LessonActions } from "@/components/escola/LessonActions"
import { renderMarkdown } from "@/lib/markdown"

export const dynamic = "force-dynamic"

export default async function LicaoPage({
  params,
}: {
  params: { modulo: string; licao: string }
}) {
  const mod = getModule(params.modulo)
  const lesson = getLesson(params.modulo, params.licao)
  if (!mod || !lesson) notFound()

  const session = await getServerSession(authOptions)
  const progress = await prisma.userProgress.findUnique({
    where: {
      userId_moduleId_lessonId: {
        userId: session!.user!.id,
        moduleId: mod.id,
        lessonId: lesson.id,
      },
    },
  })
  const isCompleted = progress?.completed ?? false

  const lessonIndex = mod.lessons.findIndex((l) => l.id === lesson.id)
  const prevLesson = lessonIndex > 0 ? mod.lessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex < mod.lessons.length - 1 ? mod.lessons[lessonIndex + 1] : null

  const contentHtml = renderMarkdown(lesson.content)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
        <Link href="/escola" className="hover:text-slate-300 transition-colors">Escola</Link>
        <span>/</span>
        <Link href={`/escola/${mod.id}`} className="hover:text-slate-300 transition-colors">{mod.title}</Link>
        <span>/</span>
        <span className="text-slate-300 truncate">{lesson.title}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
            {mod.icon} {mod.title}
          </span>
          <span className="text-xs text-slate-500">{lesson.duration}</span>
          {isCompleted && (
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              ✓ Concluída
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
        <p className="text-slate-400 mt-1">{lesson.description}</p>
      </div>

      {/* Conteúdo */}
      <div
        className="lesson-content bg-[#120d24] border border-white/5 rounded-2xl p-6 mb-6"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* Tips */}
      {lesson.tips && lesson.tips.length > 0 && (
        <div className="bg-violet-600/10 border border-violet-500/20 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-violet-300 mb-3">Dicas práticas</h3>
          <ul className="space-y-2">
            {lesson.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-violet-400 mt-0.5 flex-shrink-0">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Acordes da lição */}
      {lesson.chords && lesson.chords.length > 0 && (
        <div className="bg-[#120d24] border border-white/5 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Acordes desta lição</h3>
          <div className="flex flex-wrap gap-2">
            {lesson.chords.map((chord) => (
              <span
                key={chord}
                className="bg-slate-800 border border-white/10 text-slate-300 font-mono text-sm px-3 py-1.5 rounded-lg"
              >
                {chord}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botão de conclusão */}
      <LessonActions
        moduleId={mod.id}
        lessonId={lesson.id}
        isCompleted={isCompleted}
        prevLesson={prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null}
        nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null}
        moduleHref={`/escola/${mod.id}`}
      />
    </div>
  )
}
