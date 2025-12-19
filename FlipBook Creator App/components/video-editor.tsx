"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Timeline } from "@/components/timeline"
import { PreviewCanvas } from "@/components/preview-canvas"
import { TransitionSelector } from "@/components/transition-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { Play, Pause, Download, Upload, Sparkles, Timer } from "lucide-react"

export type TransitionType =
  | "fade"
  | "slide"
  | "zoom"
  | "pan"
  | "rotate"
  | "blur"
  | "wipe"
  | "crossfade"
  | "bounce"
  | "glitch"
  | "colorShift"
  | "flipbook"

export type CountdownStyle = "minimal" | "bold" | "neon" | "circle" | "gradient" | "flip"

export type PhotoEffect = "none" | "grayscale" | "sepia" | "vintage" | "warm" | "cool" | "blur" | "sharpen"
export type TextEffect = "none" | "shadow" | "outline" | "glow" | "double" | "extrude" | "neon" | "3d"

export interface Slide {
  id: string
  type: "photo" | "countdown"
  imageUrl: string
  duration: number
  transition: TransitionType
  // Text overlay properties
  text?: string
  textSize?: string
  textColor?: string
  textPosition?: "top" | "center" | "bottom"
  textEffect?: TextEffect
  // Background color (shows behind/around image)
  backgroundColor?: string
  photoEffect?: PhotoEffect
  // Countdown properties
  countdownFrom?: number
  countdownStyle?: CountdownStyle
}

export function VideoEditor() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "1",
      type: "photo",
      imageUrl: "/vast-mountain-valley.png",
      duration: 3000,
      transition: "fade",
      text: "Welcome",
      textSize: "5xl",
      textColor: "#FFFFFF",
      textPosition: "center",
      textEffect: "shadow",
      backgroundColor: "#000000",
      photoEffect: "none",
    },
  ])
  const [selectedSlideId, setSelectedSlideId] = useState<string>("1")
  const [isPlaying, setIsPlaying] = useState(false)

  const selectedSlide = slides.find((s) => s.id === selectedSlideId)

  const addPhotoSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      type: "photo",
      imageUrl: "/abstract-colorful-photo.png",
      duration: 3000,
      transition: "fade",
      text: "",
      textSize: "4xl",
      textColor: "#FFFFFF",
      textPosition: "center",
      textEffect: "shadow",
      backgroundColor: "#000000",
      photoEffect: "none",
    }
    setSlides([...slides, newSlide])
    setSelectedSlideId(newSlide.id)
  }

  const addCountdownSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      type: "countdown",
      imageUrl: "",
      duration: 3000,
      transition: "zoom",
      backgroundColor: "#0F172A",
      countdownFrom: 3,
      countdownStyle: "bold",
    }
    setSlides([...slides, newSlide])
    setSelectedSlideId(newSlide.id)
  }

  const updateSlide = (id: string, updates: Partial<Slide>) => {
    setSlides(slides.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const deleteSlide = (id: string) => {
    const filtered = slides.filter((s) => s.id !== id)
    setSlides(filtered)
    if (selectedSlideId === id && filtered.length > 0) {
      setSelectedSlideId(filtered[0].id)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const newSlide: Slide = {
          id: Date.now().toString(),
          type: "photo",
          imageUrl: event.target?.result as string,
          duration: 3000,
          transition: "fade",
          text: "",
          textSize: "4xl",
          textColor: "#FFFFFF",
          textPosition: "center",
          textEffect: "shadow",
          backgroundColor: "#000000",
          photoEffect: "none",
        }
        setSlides([...slides, newSlide])
        setSelectedSlideId(newSlide.id)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-card px-6 py-3">
        <div className="flex items-center gap-2">
          <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect
              x="4"
              y="4"
              width="24"
              height="24"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            />
            <rect
              x="8"
              y="8"
              width="16"
              height="16"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-primary opacity-60"
            />
            <rect x="12" y="12" width="8" height="8" rx="1" fill="currentColor" className="text-primary opacity-40" />
          </svg>
          <h1 className="text-xl font-semibold">Framez</h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="default" className="gap-2">
            <Download className="h-4 w-4" />
            Export Video
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Assets */}
        <aside className="w-64 border-r bg-card p-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Add Content</h2>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-transparent"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
            <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" onClick={addPhotoSlide}>
              <Sparkles className="h-4 w-4" />
              Add Placeholder
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" onClick={addCountdownSlide}>
              <Timer className="h-4 w-4" />
              Add Countdown
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium">Slides ({slides.length})</h3>
            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
              {slides.map((slide, index) => (
                <Card
                  key={slide.id}
                  className={`cursor-pointer overflow-hidden transition-colors ${
                    selectedSlideId === slide.id ? "ring-2 ring-primary" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedSlideId(slide.id)}
                >
                  {slide.type === "countdown" ? (
                    <div
                      className="relative h-16 w-full flex items-center justify-center"
                      style={{ backgroundColor: slide.backgroundColor }}
                    >
                      <Timer className="h-6 w-6 text-white/70" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-1 left-2 text-xs font-medium text-white">
                        {index + 1}. Countdown
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-16 w-full">
                      <img
                        src={slide.imageUrl || "/placeholder.svg"}
                        alt={`Slide ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-1 left-2 text-xs font-medium text-white">
                        {index + 1}. {slide.text || "Photo"}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </aside>

        {/* Center - Preview */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 p-6">
            <PreviewCanvas
              slides={slides}
              selectedSlideId={selectedSlideId}
              isPlaying={isPlaying}
              onPlayingChange={setIsPlaying}
            />
          </div>

          {/* Timeline */}
          <div className="border-t bg-card">
            <Timeline
              slides={slides}
              selectedSlideId={selectedSlideId}
              onSelectSlide={setSelectedSlideId}
              onUpdateSlide={updateSlide}
              onDeleteSlide={deleteSlide}
            />
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <aside className="w-80 border-l bg-card p-4 overflow-y-auto">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Properties</h2>

          {selectedSlide ? (
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
                <TabsTrigger value="transition">Transition</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 pt-4">
                {selectedSlide.type === "countdown" ? (
                  <>
                    <div className="space-y-2">
                      <Label>Countdown From</Label>
                      <Input
                        type="number"
                        value={selectedSlide.countdownFrom || 3}
                        onChange={(e) =>
                          updateSlide(selectedSlide.id, {
                            countdownFrom: Number.parseInt(e.target.value),
                          })
                        }
                        min="1"
                        max="10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Countdown Style</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={selectedSlide.countdownStyle}
                        onChange={(e) =>
                          updateSlide(selectedSlide.id, { countdownStyle: e.target.value as CountdownStyle })
                        }
                      >
                        <option value="minimal">Minimal</option>
                        <option value="bold">Bold</option>
                        <option value="neon">Neon</option>
                        <option value="circle">Circle</option>
                        <option value="gradient">Gradient</option>
                        <option value="flip">Flip Card</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Duration (seconds per number)</Label>
                      <Input
                        type="number"
                        value={selectedSlide.duration / 1000}
                        onChange={(e) =>
                          updateSlide(selectedSlide.id, {
                            duration: Number.parseFloat(e.target.value) * 1000,
                          })
                        }
                        step="0.1"
                        min="0.3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedSlide.backgroundColor}
                          onChange={(e) => updateSlide(selectedSlide.id, { backgroundColor: e.target.value })}
                          className="w-16"
                        />
                        <Input
                          value={selectedSlide.backgroundColor}
                          onChange={(e) => updateSlide(selectedSlide.id, { backgroundColor: e.target.value })}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Photo URL</Label>
                      <Input
                        value={selectedSlide.imageUrl}
                        onChange={(e) => updateSlide(selectedSlide.id, { imageUrl: e.target.value })}
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Duration (seconds)</Label>
                      <Input
                        type="number"
                        value={selectedSlide.duration / 1000}
                        onChange={(e) =>
                          updateSlide(selectedSlide.id, {
                            duration: Number.parseFloat(e.target.value) * 1000,
                          })
                        }
                        step="0.5"
                        min="0.5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedSlide.backgroundColor}
                          onChange={(e) => updateSlide(selectedSlide.id, { backgroundColor: e.target.value })}
                          className="w-16"
                        />
                        <Input
                          value={selectedSlide.backgroundColor}
                          onChange={(e) => updateSlide(selectedSlide.id, { backgroundColor: e.target.value })}
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <h3 className="text-sm font-medium">Text Overlay</h3>

                      <div className="space-y-2">
                        <Label>Text</Label>
                        <Input
                          value={selectedSlide.text || ""}
                          onChange={(e) => updateSlide(selectedSlide.id, { text: e.target.value })}
                          placeholder="Add text overlay..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Text Size</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={selectedSlide.textSize}
                          onChange={(e) => updateSlide(selectedSlide.id, { textSize: e.target.value })}
                        >
                          <option value="2xl">Small</option>
                          <option value="3xl">Medium</option>
                          <option value="4xl">Large</option>
                          <option value="5xl">Extra Large</option>
                          <option value="6xl">Huge</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Text Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedSlide.textColor}
                            onChange={(e) => updateSlide(selectedSlide.id, { textColor: e.target.value })}
                            className="w-16"
                          />
                          <Input
                            value={selectedSlide.textColor}
                            onChange={(e) => updateSlide(selectedSlide.id, { textColor: e.target.value })}
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Text Position</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={selectedSlide.textPosition}
                          onChange={(e) =>
                            updateSlide(selectedSlide.id, {
                              textPosition: e.target.value as "top" | "center" | "bottom",
                            })
                          }
                        >
                          <option value="top">Top</option>
                          <option value="center">Center</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="effects" className="space-y-4 pt-4">
                {selectedSlide.type === "photo" && (
                  <>
                    <div className="space-y-2">
                      <Label>Photo Effect</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={selectedSlide.photoEffect || "none"}
                        onChange={(e) => updateSlide(selectedSlide.id, { photoEffect: e.target.value as PhotoEffect })}
                      >
                        <option value="none">None</option>
                        <option value="grayscale">Grayscale</option>
                        <option value="sepia">Sepia</option>
                        <option value="vintage">Vintage</option>
                        <option value="warm">Warm</option>
                        <option value="cool">Cool</option>
                        <option value="blur">Soft Blur</option>
                        <option value="sharpen">Sharpen</option>
                      </select>
                      <p className="text-xs text-muted-foreground">Apply visual effects to your photo</p>
                    </div>

                    {selectedSlide.text && (
                      <div className="border-t pt-4 space-y-2">
                        <Label>Text Effect</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={selectedSlide.textEffect || "none"}
                          onChange={(e) => updateSlide(selectedSlide.id, { textEffect: e.target.value as TextEffect })}
                        >
                          <optgroup label="2D Effects">
                            <option value="none">None</option>
                            <option value="shadow">Drop Shadow</option>
                            <option value="outline">Outline</option>
                            <option value="glow">Glow</option>
                            <option value="double">Double Text</option>
                          </optgroup>
                          <optgroup label="3D Effects">
                            <option value="extrude">3D Extrude</option>
                            <option value="neon">Neon 3D</option>
                            <option value="3d">3D Perspective</option>
                          </optgroup>
                        </select>
                        <p className="text-xs text-muted-foreground">Add 2D or 3D effects to your text</p>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="transition" className="pt-4">
                <TransitionSelector
                  selectedTransition={selectedSlide.transition}
                  onSelect={(transition) => updateSlide(selectedSlide.id, { transition })}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-sm text-muted-foreground">Select a slide to edit its properties</p>
          )}
        </aside>
      </div>
    </div>
  )
}
