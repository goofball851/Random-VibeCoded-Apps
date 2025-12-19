"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, GripVertical } from "lucide-react"
import type { Slide } from "./video-editor"

interface TimelineProps {
  slides: Slide[]
  selectedSlideId: string
  onSelectSlide: (id: string) => void
  onUpdateSlide: (id: string, updates: Partial<Slide>) => void
  onDeleteSlide: (id: string) => void
}

export function Timeline({ slides, selectedSlideId, onSelectSlide, onDeleteSlide }: TimelineProps) {
  const totalDuration = slides.reduce((sum, slide) => sum + slide.duration, 0)

  return (
    <div className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Timeline</h3>
        <span className="text-xs text-muted-foreground">Total: {(totalDuration / 1000).toFixed(1)}s</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {slides.map((slide, index) => (
          <Card
            key={slide.id}
            className={`relative flex-shrink-0 cursor-pointer overflow-hidden transition-all ${
              selectedSlideId === slide.id ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-muted-foreground/50"
            }`}
            style={{ width: `${(slide.duration / 1000) * 60}px`, minWidth: "120px" }}
            onClick={() => onSelectSlide(slide.id)}
          >
            <div className="flex h-20 flex-col justify-between p-2">
              <div className="flex items-start justify-between gap-1">
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSlide(slide.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="h-12 w-full rounded overflow-hidden relative">
                  <img src={slide.imageUrl || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                  {slide.text && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="text-[8px] font-bold text-white truncate px-1">{slide.text}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>#{index + 1}</span>
                <span>{(slide.duration / 1000).toFixed(1)}s</span>
              </div>
            </div>

            {/* Transition indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          </Card>
        ))}
      </div>
    </div>
  )
}
