"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Music, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Track {
  id: string
  title: string
  artist: string
  url: string
}

interface PlaylistPanelProps {
  tracks: Track[]
  currentTrack: Track | null
  onTrackSelect: (track: Track) => void
  onAddTracks: (files: File[]) => void
  onRemoveTrack: (trackId: string) => void
}

export function PlaylistPanel({ tracks, currentTrack, onTrackSelect, onAddTracks, onRemoveTrack }: PlaylistPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith("audio/") || file.name.endsWith(".mp3") || file.name.endsWith(".wav"),
    )

    if (files.length > 0) {
      onAddTracks(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      onAddTracks(files)
    }
  }

  return (
    <div className="bg-muted/50 rounded-2xl p-4 border-2 border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Music className="h-5 w-5" />
          Playlist
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full border-2"
        >
          <Upload className="h-4 w-4 mr-2" />
          Add Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-4 transition-colors mb-4",
          isDragging ? "border-primary bg-primary/10" : "border-border bg-background/50",
        )}
      >
        <p className="text-center text-sm text-muted-foreground">
          {isDragging ? "Drop your audio files here" : "Drag & drop audio files (MP3/WAV)"}
        </p>
      </div>

      {/* Track List */}
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {tracks.map((track) => (
            <div
              key={track.id}
              onClick={() => onTrackSelect(track)}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all group",
                currentTrack?.id === track.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background hover:bg-muted",
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">{track.title}</p>
                <p
                  className={cn(
                    "text-xs truncate",
                    currentTrack?.id === track.id ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {track.artist}
                </p>
              </div>

              {/* Playing indicator */}
              {currentTrack?.id === track.id && (
                <div className="flex gap-0.5 items-end h-4 mr-2">
                  <div className="w-1 bg-current animate-pulse h-2" style={{ animationDelay: "0ms" }} />
                  <div className="w-1 bg-current animate-pulse h-3" style={{ animationDelay: "150ms" }} />
                  <div className="w-1 bg-current animate-pulse h-4" style={{ animationDelay: "300ms" }} />
                </div>
              )}

              {/* Remove button for custom tracks */}
              {track.id.startsWith("custom-") && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveTrack(track.id)
                  }}
                  className={cn(
                    "h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                    currentTrack?.id === track.id
                      ? "hover:bg-primary-foreground/20"
                      : "hover:bg-destructive/20 hover:text-destructive",
                  )}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}

          {tracks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">No tracks yet. Add some music!</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
