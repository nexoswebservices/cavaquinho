"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_LINKS = [
  { href: "/escola", label: "Escola", match: "/escola" },
  { href: "/musicas", label: "Músicas", match: "/musicas" },
  { href: "/progressoes", label: "Progressões", match: "/progressoes" },
  { href: "/arpejos", label: "Arpejos", match: "/arpejos" },
  { href: "/improvisos", label: "Improvisos", match: "/improvisos" },
  { href: "/partituras", label: "Partituras", match: "/partituras" },
  { href: "/analise", label: "Análise", match: "/analise" },
]

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-violet-500/10 bg-[#0a0714]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/escola" className="flex items-center gap-2 text-white font-bold">
          <span className="text-xl">🎵</span>
          <span className="hidden sm:inline">Cavaquinho</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname.startsWith(link.match)
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-2 ml-3 pl-3 border-l border-white/10">
            {session ? (
              <>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  {session.user?.name ?? session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-xs text-violet-300 hover:text-violet-200 transition-colors"
              >
                Entrar
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
