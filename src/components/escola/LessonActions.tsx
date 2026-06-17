"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface LessonActionsProps {
  moduleId: string
  lessonId: string
  isCompleted: boolean
  isLoggedIn: boolean
  prevLesson: { id: string; title: string } | null
  nextLesson: { id: string; title: string } | null
  moduleHref: string
}

export function LessonActions({
  moduleId,
  lessonId,
  isCompleted,
  isLoggedIn,
  prevLesson,
  nextLesson,
  moduleHref,
}: LessonActionsProps) {
  const router = useRouter()
  const [completed, setCompleted] = useState(isCompleted)
  const [loading, setLoading] = useState(false)

  async function toggleComplete() {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    setLoading(true)
    const newState = !completed
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, lessonId, completed: newState }),
      })
      setCompleted(newState)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Botão de conclusão */}
      <button
        onClick={toggleComplete}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 border ${
          !isLoggedIn
            ? "bg-[#120d24] border-white/10 text-slate-400 hover:border-violet-500/30 hover:text-violet-300"
            : completed
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            : "bg-violet-600 border-transparent text-white hover:bg-violet-500"
        } disabled:opacity-50`}
      >
        {!isLoggedIn ? "Entrar para marcar progresso" : loading ? "Salvando..." : completed ? "✓ Lição concluída — clique para desmarcar" : "Marcar como concluída"}
      </button>

      {/* Navegação entre lições */}
      <div className="flex gap-3">
        {prevLesson ? (
          <Link
            href={`${moduleHref}/${prevLesson.id}`}
            className="flex-1 flex items-center gap-2 bg-[#120d24] border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-400 hover:border-white/20 hover:text-white transition-all"
          >
            <span>‹</span>
            <span className="truncate">{prevLesson.title}</span>
          </Link>
        ) : (
          <Link
            href={moduleHref}
            className="flex-1 flex items-center gap-2 bg-[#120d24] border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-400 hover:border-white/20 hover:text-white transition-all"
          >
            <span>‹</span>
            <span>Voltar ao módulo</span>
          </Link>
        )}

        {nextLesson && (
          <Link
            href={`${moduleHref}/${nextLesson.id}`}
            className="flex-1 flex items-center justify-end gap-2 bg-violet-600/10 border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-violet-300 hover:border-violet-400/40 hover:text-white transition-all"
          >
            <span className="truncate">{nextLesson.title}</span>
            <span>›</span>
          </Link>
        )}
      </div>
    </div>
  )
}
