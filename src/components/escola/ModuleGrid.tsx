import Link from "next/link"
import { ProgressBar } from "./ProgressBar"

interface ModuleWithProgress {
  id: string
  title: string
  description: string
  icon: string
  lessons: { id: string }[]
  completed: number
  colorClass: string
}

export function ModuleGrid({ modules }: { modules: ModuleWithProgress[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {modules.map((mod) => (
        <Link
          key={mod.id}
          href={`/escola/${mod.id}`}
          className={`group bg-gradient-to-br ${mod.colorClass} border rounded-2xl p-6 transition-all duration-200 hover:scale-[1.01]`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">{mod.icon}</div>
            {mod.completed === mod.lessons.length && mod.completed > 0 && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                Concluído
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold text-white mb-1">{mod.title}</h2>
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">{mod.description}</p>

          <ProgressBar completed={mod.completed} total={mod.lessons.length} />
        </Link>
      ))}
    </div>
  )
}
