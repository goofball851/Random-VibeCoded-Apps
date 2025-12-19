"use client"

import { useState, useRef, useEffect } from "react"
import { Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MusicPlayer } from "@/components/music-player"
import { MascotSwitcher, type MascotType } from "@/components/mascot-switcher"
import { PlaylistPanel } from "@/components/playlist-panel"
import { InteractiveZone } from "@/components/interactive-zone"
import { MiniPlayer } from "@/components/mini-player"
import { ThemeToggle } from "@/components/theme-toggle"

interface Track {
  id: string
  title: string
  artist: string
  url: string
}

const DEFAULT_TRACKS: Track[] = [
  {
    id: "1",
    title: "Summer Vibes",
    artist: "Boomi",
    url: "/placeholder.mp3?track=1",
  },
  {
    id: "2",
    title: "Lo-fi Dreams",
    artist: "Jammi",
    url: "/placeholder.mp3?track=2",
  },
  {
    id: "3",
    title: "Hyper Rush",
    artist: "Wubbzi",
    url: "/placeholder.mp3?track=3",
  },
  {
    id: "4",
    title: "Dreamy Synths",
    artist: "Melo",
    url: "/placeholder.mp3?track=4",
  },
  {
    id: "5",
    title: "Rhythmic Loops",
    artist: "Loopi",
    url: "/placeholder.mp3?track=5",
  },
]

export default function WebToyPage() {
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(DEFAULT_TRACKS[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [currentMascot, setCurrentMascot] = useState<MascotType>("boomi")
  const [isMinimized, setIsMinimized] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime)
    }

    const handleDurationChange = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("durationchange", handleDurationChange)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("durationchange", handleDurationChange)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const audio = audioRef.current
      audio.load()
      if (isPlaying) {
        audio.play().catch(() => {
          setIsPlaying(false)
        })
      }
    }
  }, [currentTrack])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleProgressChange = (newProgress: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newProgress
      setProgress(newProgress)
    }
  }

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track)
    setProgress(0)
    // Keep playing if already playing
    if (isPlaying && audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play()
      }, 100)
    }
  }

  const handleAddTracks = (files: File[]) => {
    const newTracks = files.map((file, index) => {
      const url = URL.createObjectURL(file)
      const title = file.name.replace(/\.(mp3|wav|ogg|m4a)$/i, "")

      return {
        id: `custom-${Date.now()}-${index}`,
        title,
        artist: "Custom Track",
        url,
      }
    })

    setTracks((prev) => [...prev, ...newTracks])

    // Auto-select first added track if none is playing
    if (!currentTrack && newTracks.length > 0) {
      setCurrentTrack(newTracks[0])
    }
  }

  const handleRemoveTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((track) => track.id !== trackId))

    // If we removed the current track, select the first available
    if (currentTrack?.id === trackId) {
      const remainingTracks = tracks.filter((track) => track.id !== trackId)
      setCurrentTrack(remainingTracks[0] || null)
      setIsPlaying(false)
    }
  }

  if (isMinimized) {
    return (
      <main className="min-h-screen flex items-end justify-center p-4 bg-background">
        <div className="w-full max-w-md mb-4">
          <MiniPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onExpand={() => setIsMinimized(false)}
            onTogglePlaylist={() => setShowPlaylist(!showPlaylist)}
            mascot={currentMascot}
          />

          {showPlaylist && (
            <div className="mt-4">
              <PlaylistPanel
                tracks={tracks}
                currentTrack={currentTrack}
                onTrackSelect={handleTrackSelect}
                onAddTracks={handleAddTracks}
                onRemoveTrack={handleRemoveTrack}
              />
            </div>
          )}

          {/* Hidden Audio Element */}
          {currentTrack && <audio ref={audioRef} src={currentTrack.url} />}
        </div>
        <div className="fixed bottom-4 right-4">
          <ThemeToggle />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl">
        <div className="bg-card border-4 border-primary rounded-3xl p-8 shadow-2xl relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="rounded-full w-10 h-10">
              <Minimize2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-primary mb-2 text-balance">Web Toy</h1>
            <p className="text-muted-foreground text-balance">A music player for your ears, eyes, and bored thumbs</p>
          </div>

          <div className="mb-6">
            <MascotSwitcher currentMascot={currentMascot} onMascotChange={setCurrentMascot} isPlaying={isPlaying} />
          </div>

          <div className="mb-6">
            <InteractiveZone mascot={currentMascot} isPlaying={isPlaying} />
          </div>

          {showPlaylist && (
            <div className="mb-6">
              <PlaylistPanel
                tracks={tracks}
                currentTrack={currentTrack}
                onTrackSelect={handleTrackSelect}
                onAddTracks={handleAddTracks}
                onRemoveTrack={handleRemoveTrack}
              />
            </div>
          )}

          {/* Music Player */}
          <MusicPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onVolumeChange={setVolume}
            onProgressChange={handleProgressChange}
            onTogglePlaylist={() => setShowPlaylist(!showPlaylist)}
            volume={volume}
            progress={progress}
            duration={duration}
            audioElement={audioRef.current}
          />

          {/* Hidden Audio Element */}
          {currentTrack && <audio ref={audioRef} src={currentTrack.url} />}
        </div>
      </div>
    </main>
  )
}
