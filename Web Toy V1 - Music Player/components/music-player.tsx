"use client"

import { useState } from "react"
import { Play, Pause, Volume2, VolumeX, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { AudioVisualizer } from "@/components/audio-visualizer"

interface Track {
  id: string
  title: string
  artist: string
  url: string
}

interface MusicPlayerProps {
  currentTrack: Track | null
  isPlaying: boolean
  onPlayPause: () => void
  onVolumeChange: (volume: number) => void
  onProgressChange: (progress: number) => void
  onTogglePlaylist: () => void
  volume: number
  progress: number
  duration: number
  audioElement: HTMLAudioElement | null
}

export function MusicPlayer({
  currentTrack,
  isPlaying,
  onPlayPause,
  onVolumeChange,
  onProgressChange,
  onTogglePlaylist,
  volume,
  progress,
  duration,
  audioElement,
}: MusicPlayerProps) {
  const [isMuted, setIsMuted] = useState(false)

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    onVolumeChange(isMuted ? volume : 0)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Visualizer */}
      <div className="h-28 bg-card rounded-2xl overflow-hidden border-4 border-primary shadow-lg">
        <AudioVisualizer audioElement={audioElement} isPlaying={isPlaying} />
      </div>

      {/* Track Info */}
      {currentTrack && (
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground text-balance">{currentTrack.title}</h3>
          <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-muted-foreground min-w-[40px]">{formatTime(progress)}</span>
        <Slider
          value={[progress]}
          max={duration || 100}
          step={0.1}
          onValueChange={([value]) => onProgressChange(value)}
          className="flex-1"
        />
        <span className="text-xs font-mono text-muted-foreground min-w-[40px]">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Playlist Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={onTogglePlaylist}
          className="rounded-full w-12 h-12 border-4 bg-transparent"
        >
          <List className="h-5 w-5" />
        </Button>

        {/* Play/Pause */}
        <Button
          size="icon"
          onClick={onPlayPause}
          className="rounded-full w-20 h-20 shadow-xl hover:scale-105 transition-transform"
        >
          {isPlaying ? (
            <Pause className="h-8 w-8" fill="currentColor" />
          ) : (
            <Play className="h-8 w-8 ml-1" fill="currentColor" />
          )}
        </Button>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleMuteToggle}
            className="rounded-full w-12 h-12 border-4 bg-transparent"
          >
            {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            onValueChange={([value]) => {
              setIsMuted(false)
              onVolumeChange(value)
            }}
            className="w-24"
          />
        </div>
      </div>
    </div>
  )
}
