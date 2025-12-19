"use client"

import { useEffect, useState } from "react"

interface MascotJammiProps {
  isActive: boolean
  isPlaying: boolean
  onClick: () => void
}

export function MascotJammi({ isActive, isPlaying, onClick }: MascotJammiProps) {
  const [nod, setNod] = useState(false)

  useEffect(() => {
    if (isPlaying && isActive) {
      const interval = setInterval(() => {
        setNod(true)
        setTimeout(() => setNod(false), 300)
      }, 1000)
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
        {/* Hoodie */}
        <ellipse cx="40" cy="55" rx="30" ry="20" fill="hsl(80, 40%, 55%)" />

        {/* Head */}
        <circle cx="40" cy="40" r="25" fill="hsl(80, 35%, 65%)" stroke="hsl(80, 40%, 50%)" strokeWidth="3" />

        {/* Hoodie Hood */}
        <path
          d="M 20 35 Q 20 15 40 15 Q 60 15 60 35"
          fill="hsl(80, 45%, 50%)"
          stroke="hsl(80, 50%, 40%)"
          strokeWidth="2"
        />

        {/* Eyes - relaxed */}
        <path
          d="M 28 36 Q 32 38 36 36"
          stroke="hsl(80, 20%, 30%)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 44 36 Q 48 38 52 36"
          stroke="hsl(80, 20%, 30%)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Smile */}
        <path d="M 32 48 Q 40 50 48 48" stroke="hsl(80, 20%, 30%)" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Headphones cord */}
        <circle cx="25" cy="38" r="6" fill="hsl(80, 50%, 40%)" stroke="hsl(80, 60%, 30%)" strokeWidth="2" />
        <circle cx="55" cy="38" r="6" fill="hsl(80, 50%, 40%)" stroke="hsl(80, 60%, 30%)" strokeWidth="2" />
      </svg>
      <p className="text-center text-xs font-bold mt-2" style={{ color: "hsl(80, 50%, 50%)" }}>
        Jammi
      </p>
    </div>
  )
}
