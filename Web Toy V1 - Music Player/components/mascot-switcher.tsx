"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MascotBoomi } from "@/components/mascots/mascot-boomi"
import { MascotJammi } from "@/components/mascots/mascot-jammi"
import { MascotWubbzi } from "@/components/mascots/mascot-wubbzi"
import { MascotMelo } from "@/components/mascots/mascot-melo"
import { MascotLoopi } from "@/components/mascots/mascot-loopi"

export type MascotType = "boomi" | "jammi" | "wubbzi" | "melo" | "loopi"

interface MascotSwitcherProps {
  currentMascot: MascotType
  onMascotChange: (mascot: MascotType) => void
  isPlaying: boolean
}

const MASCOTS: MascotType[] = ["boomi", "jammi", "wubbzi", "melo", "loopi"]

export function MascotSwitcher({ currentMascot, onMascotChange, isPlaying }: MascotSwitcherProps) {
  const currentIndex = MASCOTS.indexOf(currentMascot)

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + MASCOTS.length) % MASCOTS.length
    onMascotChange(MASCOTS[newIndex])
  }

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % MASCOTS.length
    onMascotChange(MASCOTS[newIndex])
  }

  const renderMascot = (type: MascotType) => {
    const isActive = type === currentMascot
    const props = { isActive, isPlaying, onClick: () => onMascotChange(type) }

    switch (type) {
      case "boomi":
        return <MascotBoomi key={type} {...props} />
      case "jammi":
        return <MascotJammi key={type} {...props} />
      case "wubbzi":
        return <MascotWubbzi key={type} {...props} />
      case "melo":
        return <MascotMelo key={type} {...props} />
      case "loopi":
        return <MascotLoopi key={type} {...props} />
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* All Mascots Display */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {MASCOTS.map((mascot) => (
          <div key={mascot}>{renderMascot(mascot)}</div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          className="rounded-full w-10 h-10 border-2 bg-transparent"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center min-w-[80px]">
          <p className="text-sm font-bold capitalize text-foreground">{currentMascot}</p>
          <p className="text-xs text-muted-foreground">
            {currentIndex + 1} / {MASCOTS.length}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="rounded-full w-10 h-10 border-2 bg-transparent"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
