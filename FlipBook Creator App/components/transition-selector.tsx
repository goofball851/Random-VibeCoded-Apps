"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { TransitionType } from "./video-editor"

interface TransitionSelectorProps {
  selectedTransition: TransitionType
  onSelect: (transition: TransitionType) => void
}

const transitions: { value: TransitionType; label: string; description: string }[] = [
  { value: "fade", label: "Fade", description: "Classic smooth fade" },
  { value: "crossfade", label: "Crossfade", description: "Slow elegant fade" },
  { value: "slide", label: "Slide", description: "Slide from right" },
  { value: "zoom", label: "Zoom In", description: "Scale up entrance" },
  { value: "pan", label: "Pan", description: "Ken Burns effect" },
  { value: "wipe", label: "Wipe", description: "Wipe from bottom" },
  { value: "rotate", label: "Rotate", description: "Spin transition" },
  { value: "glitch", label: "Glitch", description: "Digital glitch effect" },
  { value: "colorShift", label: "Color Shift", description: "Rainbow hue shift" },
  { value: "flipbook", label: "Flipbook", description: "Animated frames effect" },
]

export function TransitionSelector({ selectedTransition, onSelect }: TransitionSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Transition Effect</Label>
      <div className="grid gap-2">
        {transitions.map((transition) => (
          <Card
            key={transition.value}
            className={`cursor-pointer p-3 transition-colors ${
              selectedTransition === transition.value ? "border-primary bg-primary/5" : "hover:bg-muted"
            }`}
            onClick={() => onSelect(transition.value)}
          >
            <div className="space-y-1">
              <div className="font-medium">{transition.label}</div>
              <div className="text-xs text-muted-foreground">{transition.description}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
