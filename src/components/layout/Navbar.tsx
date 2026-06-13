"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-violet-500/10 bg-[#0a0714]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/escola" className="flex items-center gap-2 text-white font-bold">
          <span className="text-xl">🎵</span>
          <span className="hidden sm:inline">HarmoniaFlow</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/escola"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              pathname.startsWith("/escola")
                ? "bg-violet-600/20 text-violet-300"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Escola
          </Link>

          {session && (
            <div className="flex items-center gap-2 ml-3 pl-3 border-l border-white/10">
              <span className="text-xs text-slate-500 hidden sm:inline">
                {session.user?.name ?? session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                Sair
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
