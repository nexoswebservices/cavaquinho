"use client"

import { PartituraView } from "./PartituraView"
import { TablaturaView } from "./TablaturaView"
import type { NoteData } from "./PartituraView"
import type { TabNote } from "./TablaturaView"

interface PartituraComTabProps {
  notes: NoteData[]
  tab: TabNote[]
  timeSignature?: string
  keySignature?: string
  title?: string
}

export function PartituraComTab({ notes, tab, timeSignature, keySignature, title }: PartituraComTabProps) {
  return (
    <div className="bg-[#0a0714] border border-white/5 rounded-xl p-4 space-y-0">
      {title && <p className="text-xs text-slate-500 mb-2">{title}</p>}
      <PartituraView notes={notes} timeSignature={timeSignature} keySignature={keySignature} />
      <TablaturaView notes={tab} />
    </div>
  )
}
