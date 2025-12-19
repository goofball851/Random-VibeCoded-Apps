"use client"

import { useEffect, useState } from "react"

interface MascotLoopiProps {
  isActive: boolean
  isPlaying: boolean
  onClick: () => void
}

export function MascotLoopi({ isActive, isPlaying, onClick }: MascotLoopiProps) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (isPlaying && isActive) {
      const interval = setInterval(() => {
        setRotation((prev) => (prev + 10) % 360)
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isPlaying, isActive])

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 ${isActive ? "scale-110" : "scale-100 opacity-60"}`}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <g transform={`rotate(${rotation} 40 40)`}>
          {/* Circular loop rings */}
          <circle cx="40" cy="40" r="30" stroke="hsl(160, 70%, 58%)" strokeWidth="4" fill="hsl(160, 60%, 65%)" />
          <circle cx="40" cy="40" r="20" stroke="hsl(160, 75%, 50%)" strokeWidth="3" fill="hsl(160, 65%, 60%)" />

          {/* Rotating dots */}
          <circle cx="40" cy="15" r="4" fill="hsl(160, 80%, 40%)" />
          <circle cx="40" cy="65" r="4" fill="hsl(160, 80%, 40%)" />
          <circle cx="15" cy="40" r="4" fill="hsl(160, 80%, 40%)" />
          <circle cx="65" cy="40" r="4" fill="hsl(160, 80%, 40%)" />
        </g>

        {/* Center face (doesn't rotate) */}
        <circle cx="40" cy="40" r="12" fill="hsl(160, 70%, 65%)" />
        <circle cx="36" cy="38" r="2" fill="black" />
        <circle cx="44" cy="38" r="2" fill="black" />
        <path d="M 36 43 Q 40 45 44 43" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
      <p className="text-center text-xs font-bold mt-2" style={{ color: "hsl(160, 70%, 50%)" }}>
        Loopi
      </p>
    </div>
  )
}
