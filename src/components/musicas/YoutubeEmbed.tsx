"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady: () => void
  }
}

interface YoutubeEmbedProps {
  youtubeId: string
  onReady: (player: YT.Player) => void
  onStateChange: (state: number) => void
}

export function YoutubeEmbed({ youtubeId, onReady, onStateChange }: YoutubeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)

  useEffect(() => {
    function initPlayer() {
      if (!containerRef.current) return
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: youtubeId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => onReady(playerRef.current!),
          onStateChange: (e: YT.OnStateChangeEvent) => onStateChange(e.data),
        },
      })
    }

    if (window.YT?.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
      if (!document.getElementById("yt-iframe-api")) {
        const script = document.createElement("script")
        script.id = "yt-iframe-api"
        script.src = "https://www.youtube.com/iframe_api"
        document.head.appendChild(script)
      }
    }

    return () => {
      playerRef.current?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId])

  return (
    <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
      <div ref={containerRef} className="absolute inset-0 rounded-xl overflow-hidden" />
    </div>
  )
}
