"use client"

import { useEffect, useState } from "react"

interface MascotBoomiProps {
  isActive: boolean
  isPlaying: boolean
  onClick: () => void
}

export function MascotBoomi({ isActive, isPlaying, onClick }: MascotBoomiProps) {
  const [bounce, setBounce] = useState(false)

  useEffect(() => {
    if (isPlaying && isActive) {
      const interval = setInterval(() => {
        setBounce(true)
        setTimeout(() => setBounce(false), 400)
      }, 800)
      return () => clearInterval(interval)
    }
  }, [isPlaying, isActive])

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 ${bounce ? "animate-bounce" : ""} ${
        isActive ? "scale-110" : "scale-100 opacity-60"
      }`}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Bass Speaker Body */}
        <circle cx="40" cy="40" r="35" fill="hsl(280, 60%, 35%)" stroke="hsl(280, 70%, 25%)" strokeWidth="3" />
        <circle cx="40" cy="40" r="25" fill="hsl(280, 50%, 25%)" />
        <circle cx="40" cy="40" r="15" fill="hsl(280, 60%, 20%)" />

        {/* Eyes */}
        <circle cx="30" cy="35" r="4" fill="white" />
        <circle cx="50" cy="35" r="4" fill="white" />
        <circle cx="31" cy="35" r="2" fill="black" />
        <circle cx="51" cy="35" r="2" fill="black" />

        {/* Smile */}
        <path d="M 30 48 Q 40 53 50 48" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Sound Waves */}
        <path d="M 10 40 Q 8 40 8 38" stroke="hsl(280, 70%, 50%)" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M 70 40 Q 72 40 72 38" stroke="hsl(280, 70%, 50%)" strokeWidth="2" fill="none" opacity="0.6" />
      </svg>
      <p className="text-center text-xs font-bold mt-2" style={{ color: "hsl(280, 60%, 45%)" }}>
        Boomi
      </p>
    </div>
  )
}
