"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
  { href: "/escola", label: "Lições", exact: true },
  { href: "/escola/quiz", label: "Quiz" },
  { href: "/escola/meu-progresso", label: "Meu Progresso" },
]

export function EscolaSubNav() {
  const pathname = usePathname()

  function isActive(tab: typeof TABS[number]) {
    if (tab.exact) {
      return pathname === tab.href
    }
    return pathname.startsWith(tab.href)
  }

  return (
    <div className="flex gap-1 mb-8 border-b border-white/5 pb-px">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            isActive(tab)
              ? "border-violet-500 text-violet-300"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
