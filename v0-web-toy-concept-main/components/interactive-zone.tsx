"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { MascotType } from "@/components/mascot-switcher"

interface InteractiveZoneProps {
  mascot: MascotType
  isPlaying: boolean
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
}

const MASCOT_COLORS: Record<MascotType, string> = {
  boomi: "hsl(280, 70%, 50%)",
  jammi: "hsl(80, 50%, 55%)",
  wubbzi: "hsl(330, 85%, 60%)",
  melo: "hsl(260, 70%, 70%)",
  loopi: "hsl(160, 75%, 55%)",
}

const MASCOT_MESSAGES: Record<MascotType, string[]> = {
  boomi: ["BOOM!", "BASS DROP!", "THUMP!", "WOBBLE!"],
  jammi: ["chill~", "vibes", "relax", "lo-fi"],
  wubbzi: ["WUB!", "HYPER!", "RUSH!", "GO!"],
  melo: ["dreamy~", "float", "peaceful", "ahh~"],
  loopi: ["LOOP!", "SPIN!", "AGAIN!", "REPEAT!"],
}

export function InteractiveZone({ mascot, isPlaying }: InteractiveZoneProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number; text: string }[]>([])
  const [beatPulse, setBeatPulse] = useState(false)

  // Beat-synced pulse animation
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setBeatPulse(true)
        setTimeout(() => setBeatPulse(false), 200)
      }, 800)
      return () => clearInterval(interval)
    }
  }, [isPlaying])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const id = Date.now()
    const color = MASCOT_COLORS[mascot]

    // Add sparkle particles
    const newParticles: Particle[] = []
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: id + i,
        x,
        y,
        color,
        size: Math.random() * 8 + 4,
      })
    }
    setParticles((prev) => [...prev, ...newParticles])

    // Add text message
    const messages = MASCOT_MESSAGES[mascot]
    const text = messages[Math.floor(Math.random() * messages.length)]
    setClicks((prev) => [...prev, { id, x, y, text }])

    // Clean up after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)))
      setClicks((prev) => prev.filter((c) => c.id !== id))
    }, 1000)
  }

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/30 to-muted/60 border-2 border-border cursor-pointer transition-all h-48 ${
        beatPulse ? "scale-[1.02] border-primary/50" : ""
      }`}
      style={{
        background: isPlaying
          ? `linear-gradient(135deg, ${MASCOT_COLORS[mascot]}15, ${MASCOT_COLORS[mascot]}05)`
          : undefined,
      }}
    >
      {/* Center text prompt */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="text-muted-foreground text-sm font-medium text-center px-4">
          {isPlaying ? "Click anywhere to interact!" : "Click me when the music plays!"}
        </p>
      </div>

      {/* Click particles */}
      {particles.map((particle, index) => {
        const angle = (index / 8) * Math.PI * 2
        const distance = 50
        const endX = particle.x + Math.cos(angle) * distance
        const endY = particle.y + Math.sin(angle) * distance

        return (
          <div
            key={particle.id}
            className="absolute rounded-full pointer-events-none animate-ping"
            style={
              {
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                transform: `translate(-50%, -50%)`,
                animation: "sparkle 1s ease-out forwards",
                "--end-x": `${endX - particle.x}px`,
                "--end-y": `${endY - particle.y}px`,
              } as React.CSSProperties
            }
          />
        )
      })}

      {/* Click text messages */}
      {clicks.map((click) => (
        <div
          key={click.id}
          className="absolute font-black text-2xl pointer-events-none"
          style={{
            left: click.x,
            top: click.y,
            color: MASCOT_COLORS[mascot],
            transform: "translate(-50%, -50%)",
            animation: "float-up 1s ease-out forwards",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {click.text}
        </div>
      ))}

      {/* Idle beat indicators when playing */}
      {isPlaying && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 rounded-full"
              style={{
                height: beatPulse ? "24px" : "12px",
                backgroundColor: MASCOT_COLORS[mascot],
                transition: "height 0.2s ease-out",
                opacity: 0.6,
                transitionDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
