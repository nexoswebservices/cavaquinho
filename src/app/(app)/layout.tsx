import { Navbar } from "@/components/layout/Navbar"
import { Metronomo } from "@/components/ui/Metronomo"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0714]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      <Metronomo />
    </div>
  )
}
