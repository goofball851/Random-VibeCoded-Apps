"use client"

import { useEffect, useState, useRef } from "react"
import type { Slide } from "./video-editor"

interface PreviewCanvasProps {
  slides: Slide[]
  selectedSlideId: string
  isPlaying: boolean
  onPlayingChange: (playing: boolean) => void
}

export function PreviewCanvas({ slides, selectedSlideId, isPlaying, onPlayingChange }: PreviewCanvasProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [countdownNumber, setCountdownNumber] = useState<number | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const [glitchFrame, setGlitchFrame] = useState(0)
  const [colorShiftHue, setColorShiftHue] = useState(0)
  const [flipbookFrame, setFlipbookFrame] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const countdownIntervalRef = useRef<NodeJS.Timeout>()

  const currentSlide = isPlaying ? slides[currentSlideIndex] : slides.find((s) => s.id === selectedSlideId) || slides[0]

  useEffect(() => {
    if (!isPlaying || currentSlide.type !== "countdown") {
      setCountdownNumber(null)
      return
    }

    const from = currentSlide.countdownFrom || 3
    const durationPerNumber = currentSlide.duration

    setCountdownNumber(from)
    let current = from

    const interval = setInterval(() => {
      if (currentSlide.countdownStyle === "flip") {
        setIsFlipping(true)
        setTimeout(() => {
          current -= 1
          if (current > 0) {
            setCountdownNumber(current)
          } else {
            setCountdownNumber(null)
            clearInterval(interval)
          }
          setIsFlipping(false)
        }, 300)
      } else {
        current -= 1
        if (current > 0) {
          setCountdownNumber(current)
        } else {
          setCountdownNumber(null)
          clearInterval(interval)
        }
      }
    }, durationPerNumber)

    countdownIntervalRef.current = interval

    return () => {
      clearInterval(interval)
    }
  }, [
    isPlaying,
    currentSlideIndex,
    currentSlide,
    currentSlide.duration,
    currentSlide.countdownFrom,
    currentSlide.type,
    currentSlide.countdownStyle,
  ])

  useEffect(() => {
    if (!isPlaying) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
      return
    }

    setIsTransitioning(true)
    const transitionDuration = 800

    const transitionTimeout = setTimeout(() => {
      setIsTransitioning(false)
    }, transitionDuration)

    const totalDuration =
      currentSlide.type === "countdown"
        ? currentSlide.duration * (currentSlide.countdownFrom || 3)
        : currentSlide.duration

    const slideTimeout = setTimeout(() => {
      const nextIndex = (currentSlideIndex + 1) % slides.length
      if (nextIndex === 0) {
        onPlayingChange(false)
        setCurrentSlideIndex(0)
      } else {
        setCurrentSlideIndex(nextIndex)
      }
    }, totalDuration)

    timeoutRef.current = slideTimeout

    return () => {
      clearTimeout(transitionTimeout)
      clearTimeout(slideTimeout)
    }
  }, [isPlaying, currentSlideIndex, currentSlide, slides.length, onPlayingChange])

  useEffect(() => {
    if (!isPlaying) {
      const index = slides.findIndex((s) => s.id === selectedSlideId)
      if (index !== -1) {
        setCurrentSlideIndex(index)
      }
    }
  }, [selectedSlideId, slides, isPlaying])

  useEffect(() => {
    if (!isTransitioning || currentSlide.transition !== "glitch") return

    const interval = setInterval(() => {
      setGlitchFrame((prev) => (prev + 1) % 6)
    }, 50)

    return () => clearInterval(interval)
  }, [isTransitioning, currentSlide.transition])

  useEffect(() => {
    if (!isTransitioning || currentSlide.transition !== "colorShift") return

    const interval = setInterval(() => {
      setColorShiftHue((prev) => (prev + 30) % 360)
    }, 100)

    return () => clearInterval(interval)
  }, [isTransitioning, currentSlide.transition])

  useEffect(() => {
    if (!isTransitioning || currentSlide.transition !== "flipbook") return

    const interval = setInterval(() => {
      setFlipbookFrame((prev) => (prev + 1) % 8)
    }, 60)

    return () => clearInterval(interval)
  }, [isTransitioning, currentSlide.transition])

  const getTransitionClass = () => {
    if (!isTransitioning) return ""

    switch (currentSlide.transition) {
      case "fade":
        return "animate-in fade-in duration-800"
      case "slide":
        return "animate-in slide-in-from-right duration-700"
      case "zoom":
        return "animate-in zoom-in-50 duration-700"
      case "pan":
        return "animate-in slide-in-from-left-1/4 duration-1000"
      case "rotate":
        return "animate-in spin-in-90 duration-700"
      case "blur":
        return "animate-in fade-in duration-800"
      case "wipe":
        return "animate-in slide-in-from-bottom duration-600"
      case "crossfade":
        return "animate-in fade-in duration-1000"
      case "bounce":
        return "animate-in zoom-in duration-700 ease-out"
      case "glitch":
        return "animate-in fade-in duration-300"
      case "colorShift":
        return "animate-in fade-in duration-600"
      case "flipbook":
        return "animate-in fade-in duration-400"
      default:
        return "animate-in fade-in duration-800"
    }
  }

  const getTextPositionClass = () => {
    switch (currentSlide.textPosition) {
      case "top":
        return "items-start pt-12"
      case "center":
        return "items-center"
      case "bottom":
        return "items-end pb-12"
      default:
        return "items-center"
    }
  }

  const getCountdownStyleClass = () => {
    switch (currentSlide.countdownStyle) {
      case "minimal":
        return "font-light tracking-wider"
      case "bold":
        return "font-black tracking-tighter"
      case "neon":
        return "font-bold tracking-wide"
      case "circle":
        return "font-bold"
      case "gradient":
        return "font-black tracking-tight"
      case "flip":
        return "font-black tracking-tight"
      default:
        return "font-bold"
    }
  }

  const getPhotoFilter = () => {
    switch (currentSlide.photoEffect) {
      case "grayscale":
        return "grayscale(100%)"
      case "sepia":
        return "sepia(100%)"
      case "vintage":
        return "sepia(50%) contrast(1.2) brightness(0.9)"
      case "warm":
        return "saturate(1.3) hue-rotate(-10deg)"
      case "cool":
        return "saturate(1.2) hue-rotate(10deg)"
      case "blur":
        return "blur(2px)"
      case "sharpen":
        return "contrast(1.2) brightness(1.05)"
      case "none":
      default:
        return "none"
    }
  }

  const getTextEffectStyle = () => {
    const effect = currentSlide.textEffect || "shadow"
    const color = currentSlide.textColor || "#FFFFFF"

    switch (effect) {
      case "shadow":
        return {
          textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.5)",
        }
      case "outline":
        return {
          WebkitTextStroke: "2px rgba(0,0,0,0.8)",
          textShadow: "0 0 8px rgba(0,0,0,0.5)",
        }
      case "glow":
        return {
          textShadow: `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}, 0 2px 8px rgba(0,0,0,0.5)`,
        }
      case "double":
        return {
          textShadow: `3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.5)`,
        }
      case "extrude":
        return {
          textShadow: `1px 1px 0 rgba(0,0,0,0.3), 2px 2px 0 rgba(0,0,0,0.3), 3px 3px 0 rgba(0,0,0,0.3), 4px 4px 0 rgba(0,0,0,0.3), 5px 5px 0 rgba(0,0,0,0.3), 10px 10px 20px rgba(0,0,0,0.4)`,
        }
      case "neon":
        return {
          textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}, 0 0 40px ${color}, 0 0 50px ${color}, 0 0 60px ${color}, 0 0 70px ${color}`,
        }
      case "3d":
        return {
          textShadow: `1px 1px 0 rgba(0,0,0,0.2), 2px 2px 0 rgba(0,0,0,0.2), 3px 3px 0 rgba(0,0,0,0.2), 4px 4px 0 rgba(0,0,0,0.2), 5px 5px 0 rgba(0,0,0,0.2), 10px 10px 20px rgba(0,0,0,0.4)`,
          transform: "perspective(500px) rotateX(5deg)",
        }
      case "none":
      default:
        return {
          textShadow: "0 2px 8px rgba(0,0,0,0.8)",
        }
    }
  }

  const getGlitchTransform = () => {
    if (currentSlide.transition !== "glitch" || !isTransitioning) return {}

    const transforms = [
      { transform: "translate(0, 0)", filter: "none" },
      { transform: "translate(-5px, 2px)", filter: "hue-rotate(90deg)" },
      { transform: "translate(5px, -2px)", filter: "hue-rotate(180deg)" },
      { transform: "translate(-3px, -3px)", filter: "saturate(3)" },
      { transform: "translate(3px, 3px)", filter: "contrast(2)" },
      { transform: "translate(0, 0)", filter: "invert(0.1)" },
    ]

    return transforms[glitchFrame]
  }

  const getColorShiftFilter = () => {
    if (currentSlide.transition !== "colorShift" || !isTransitioning) return ""
    return `hue-rotate(${colorShiftHue}deg) saturate(1.5)`
  }

  const getFlipbookTransform = () => {
    if (currentSlide.transition !== "flipbook" || !isTransitioning) return {}

    const scale = 0.7 + flipbookFrame * 0.05
    const rotation = flipbookFrame * 5

    return {
      transform: `scale(${scale}) rotate(${rotation}deg)`,
      transition: "transform 60ms linear",
    }
  }

  const transitionStyle = {
    ...getGlitchTransform(),
    ...getFlipbookTransform(),
    filter: `${getPhotoFilter()} ${getColorShiftFilter()}`.trim() || undefined,
  }

  if (!currentSlide) return null

  return (
    <div className="flex h-full items-center justify-center">
      <div
        className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-lg border-2 border-border shadow-2xl"
        style={{ backgroundColor: currentSlide.backgroundColor }}
      >
        <div className={`h-full w-full ${getTransitionClass()}`} style={transitionStyle}>
          {currentSlide.type === "countdown" ? (
            <div className="absolute inset-0 flex items-center justify-center">
              {countdownNumber !== null ? (
                <div className="relative">
                  {currentSlide.countdownStyle === "neon" && (
                    <div
                      className={`text-[280px] ${getCountdownStyleClass()} animate-in zoom-in-50 duration-300 absolute inset-0 blur-2xl`}
                      style={{
                        color: "#00F0FF",
                        textShadow: "0 0 80px #00F0FF, 0 0 120px #00F0FF",
                      }}
                    >
                      {countdownNumber}
                    </div>
                  )}
                  {currentSlide.countdownStyle === "flip" ? (
                    <div className="relative" style={{ perspective: "1000px" }}>
                      <div
                        className={`relative rounded-3xl bg-white px-16 py-12 shadow-2xl transition-all duration-300`}
                        style={{
                          transformStyle: "preserve-3d",
                          transform: isFlipping ? "rotateX(90deg)" : "rotateX(0deg)",
                        }}
                      >
                        <div className={`text-[240px] ${getCountdownStyleClass()} text-slate-900`}>
                          {countdownNumber}
                        </div>
                      </div>
                    </div>
                  ) : currentSlide.countdownStyle === "circle" ? (
                    <div className="relative flex items-center justify-center">
                      <div className="absolute h-64 w-64 rounded-full border-8 border-white/20 animate-in zoom-in duration-500" />
                      <div
                        className={`text-[180px] ${getCountdownStyleClass()} text-white animate-in zoom-in-50 duration-300`}
                      >
                        {countdownNumber}
                      </div>
                    </div>
                  ) : currentSlide.countdownStyle === "gradient" ? (
                    <div
                      className={`text-[280px] ${getCountdownStyleClass()} animate-in zoom-in-50 duration-300 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent`}
                      style={{
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {countdownNumber}
                    </div>
                  ) : (
                    <div
                      className={`text-[280px] ${getCountdownStyleClass()} animate-in zoom-in-50 duration-300`}
                      style={{
                        color: currentSlide.countdownStyle === "neon" ? "#00F0FF" : "#FFFFFF",
                        textShadow:
                          currentSlide.countdownStyle === "neon"
                            ? "0 0 20px #00F0FF, 0 0 40px #00F0FF, 0 0 60px #00F0FF"
                            : "0 4px 20px rgba(0,0,0,0.5)",
                      }}
                    >
                      {countdownNumber}
                    </div>
                  )}
                </div>
              ) : (
                !isPlaying && (
                  <div className="text-[280px] font-bold text-white/30">{currentSlide.countdownFrom || 3}</div>
                )
              )}
            </div>
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={currentSlide.imageUrl || "/placeholder.svg"}
                  alt="Slide content"
                  className="h-full w-full object-contain"
                  style={{ filter: getPhotoFilter() }}
                />
              </div>

              {currentSlide.text && (
                <div className={`absolute inset-0 flex ${getTextPositionClass()} justify-center px-12`}>
                  <div className="relative">
                    <h1
                      className={`text-${currentSlide.textSize} text-balance text-center font-bold leading-tight tracking-tight`}
                      style={{
                        color: currentSlide.textColor,
                        ...getTextEffectStyle(),
                      }}
                    >
                      {currentSlide.text}
                    </h1>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {isPlaying && (
          <div className="absolute bottom-4 left-4 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white">
            Playing
          </div>
        )}
      </div>
    </div>
  )
}
