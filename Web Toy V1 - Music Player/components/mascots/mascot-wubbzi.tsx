"use client"

import { useEffect, useState } from "react"

interface MascotWubbziProps {
  isActive: boolean
  isPlaying: boolean
  onClick: () => void
}

export function MascotWubbzi({ isActive, isPlaying, onClick }: MascotWubbziProps) {
  const [wiggle, setWiggle] = useState(false)

  useEffect(() => {
    if (isPlaying && isActive) {
      const interval = setInterval(() => {
        setWiggle(true)
        setTimeout(() => setWiggle(false), 200)
      }, 600)
      return () => clearInterval(interval)
    }
  }, [isPlaying, isActive])

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-150 ${
        wiggle ? "animate-wiggle" : ""
      } ${isActive ? "scale-110" : "scale-100 opacity-60"}`}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Star body */}
        <path
          d="M 40 10 L 48 32 L 70 32 L 52 46 L 60 68 L 40 54 L 20 68 L 28 46 L 10 32 L 32 32 Z"
          fill="hsl(330, 80%, 65%)"
          stroke="hsl(330, 85%, 50%)"
          strokeWidth="3"
        />

        {/* Eyes - excited */}
        <circle cx="35" cy="35" r="5" fill="white" />
        <circle cx="45" cy="35" r="5" fill="white" />
        <circle cx="36" cy="34" r="3" fill="black" />
        <circle cx="46" cy="34" r="3" fill="black" />

        {/* Big smile */}
        <path d="M 30 42 Q 40 50 50 42" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Energy sparkles */}
        <circle cx="65" cy="25" r="3" fill="hsl(330, 90%, 75%)" opacity="0.8" />
        <circle cx="15" cy="25" r="2.5" fill="hsl(330, 90%, 75%)" opacity="0.8" />
        <circle cx="25" cy="15" r="2" fill="hsl(330, 90%, 75%)" opacity="0.8" />
      </svg>
      <p className="text-center text-xs font-bold mt-2" style={{ color: "hsl(330, 80%, 55%)" }}>
        Wubbzi
      </p>
    </div>
  )
}
