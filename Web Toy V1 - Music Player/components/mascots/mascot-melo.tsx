"use client"

import { useEffect, useState } from "react"

interface MascotMeloProps {
  isActive: boolean
  isPlaying: boolean
  onClick: () => void
}

export function MascotMelo({ isActive, isPlaying, onClick }: MascotMeloProps) {
  const [float, setFloat] = useState(0)

  useEffect(() => {
    if (isPlaying && isActive) {
      const interval = setInterval(() => {
        setFloat((prev) => (prev + 1) % 360)
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isPlaying, isActive])

  const floatY = isPlaying && isActive ? Math.sin((float * Math.PI) / 180) * 5 : 0

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 ${isActive ? "scale-110" : "scale-100 opacity-60"}`}
      style={{ transform: `translateY(${floatY}px)` }}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Cloud-like body */}
        <ellipse cx="40" cy="42" rx="28" ry="22" fill="hsl(260, 60%, 72%)" />
        <circle cx="25" cy="40" r="15" fill="hsl(260, 65%, 75%)" />
        <circle cx="55" cy="40" r="15" fill="hsl(260, 65%, 75%)" />
        <circle cx="40" cy="32" r="18" fill="hsl(260, 70%, 78%)" />

        {/* Eyes - dreamy */}
        <circle cx="33" cy="38" r="3" fill="hsl(260, 40%, 40%)" />
        <circle cx="47" cy="38" r="3" fill="hsl(260, 40%, 40%)" />

        {/* Peaceful smile */}
        <path d="M 33 46 Q 40 48 47 46" stroke="hsl(260, 40%, 40%)" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Sparkles */}
        <circle cx="20" cy="28" r="2" fill="hsl(260, 80%, 85%)" opacity="0.7" />
        <circle cx="60" cy="30" r="2.5" fill="hsl(260, 80%, 85%)" opacity="0.7" />
        <circle cx="40" cy="20" r="2" fill="hsl(260, 80%, 85%)" opacity="0.7" />
        <circle cx="68" cy="45" r="1.5" fill="hsl(260, 80%, 85%)" opacity="0.7" />
      </svg>
      <p className="text-center text-xs font-bold mt-2" style={{ color: "hsl(260, 70%, 60%)" }}>
        Melo
      </p>
    </div>
  )
}
