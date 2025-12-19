"use client"

import { useEffect, useRef } from "react"

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null
  isPlaying: boolean
}

export function AudioVisualizer({ audioElement, isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode>()
  const dataArrayRef = useRef<Uint8Array>()

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaElementSource(audioElement)

    source.connect(analyser)
    analyser.connect(audioContext.destination)

    analyser.fftSize = 128
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    analyserRef.current = analyser
    dataArrayRef.current = dataArray

    return () => {
      source.disconnect()
      analyser.disconnect()
      audioContext.close()
    }
  }, [audioElement])

  useEffect(() => {
    if (!isPlaying || !canvasRef.current || !analyserRef.current || !dataArrayRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current
    const bufferLength = dataArray.length

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)

      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8

        const hue = (i / bufferLength) * 280 + 200
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`

        const y = canvas.height - barHeight
        ctx.fillRect(x, y, barWidth - 2, barHeight)

        x += barWidth
      }
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  return <canvas ref={canvasRef} width={800} height={120} className="w-full h-full rounded-xl" />
}
