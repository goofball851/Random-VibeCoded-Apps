"use client"

import { Play, Pause, Maximize2, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MascotType } from "@/components/mascot-switcher"

interface Track {
  id: string
  title: string
  artist: string
  url: string
}

interface MiniPlayerProps {
  currentTrack: Track | null
  isPlaying: boolean
  onPlayPause: () => void
  onExpand: () => void
  onTogglePlaylist: () => void
  mascot: MascotType
}

const MASCOT_COLORS: Record<MascotType, string> = {
  boomi: "280, 70%, 50%",
  jammi: "80, 50%, 55%",
  wubbzi: "330, 85%, 60%",
  melo: "260, 70%, 70%",
  loopi: "160, 75%, 55%",
}

export function MiniPlayer({
  currentTrack,
  isPlaying,
  onPlayPause,
  onExpand,
  onTogglePlaylist,
  mascot,
}: MiniPlayerProps) {
  return (
    <div
      className="bg-card border-4 border-primary rounded-3xl p-4 shadow-2xl transition-all"
      style={{
        borderColor: `hsl(${MASCOT_COLORS[mascot]})`,
      }}
    >
      <div className="flex items-center gap-4">
        {/* Mascot Icon */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black shadow-lg"
          style={{
            backgroundColor: `hsl(${MASCOT_COLORS[mascot]})`,
          }}
        >
          {mascot[0].toUpperCase()}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          {currentTrack ? (
            <>
              <p className="font-bold text-sm truncate text-foreground">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No track selected</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onTogglePlaylist}
            className="rounded-full w-10 h-10 border-2 bg-transparent"
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            onClick={onPlayPause}
            className="rounded-full w-12 h-12 shadow-lg"
            style={{
              backgroundColor: `hsl(${MASCOT_COLORS[mascot]})`,
            }}
          >
            {isPlaying ? <Pause className="h-5 w-5" fill="white" /> : <Play className="h-5 w-5 ml-0.5" fill="white" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={onExpand}
            className="rounded-full w-10 h-10 border-2 bg-transparent"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
