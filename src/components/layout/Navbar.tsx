"use client"

import { useEffect, useState } from "react"
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
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const authSection = (
    <>
      {session ? (
        <>
          <span className="text-xs text-slate-500">
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
    </>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-violet-500/10 bg-[#0a0714]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/escola" className="flex items-center gap-2 text-white font-bold">
          <span className="text-xl">🎵</span>
          <span className="hidden sm:inline">Cavaquinho</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
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
            {authSection}
          </div>
        </nav>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          className="lg:hidden flex flex-col items-center justify-center gap-1.5 w-9 h-9 text-slate-300"
        >
          <span
            className={`block h-0.5 w-5 bg-current transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span className={`block h-0.5 w-5 bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span
            className={`block h-0.5 w-5 bg-current transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {menuOpen && (
        <nav className="lg:hidden border-t border-white/10 bg-[#0a0714] px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname.startsWith(link.match)
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 mt-2 pt-3 border-t border-white/10 px-3">
            {authSection}
          </div>
        </nav>
      )}
    </header>
  )
}
