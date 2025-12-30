# Serpentine Carousel

<img width="500" height="500" alt="Gemini_Generated_Image_mxtjx5mxtjx5mxtj" src="https://github.com/user-attachments/assets/55db1947-e0a9-4134-ba99-9b3d5a9526d1" />


[![React](https://img.shields.io/badge/react-18+-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-4.9+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Framer Motion](https://img.shields.io/badge/framer--motion-10+-E91E63?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-success)](#)

A responsive, motion-driven **serpentine carousel** built with **React**, **TypeScript**, and **Framer Motion** using Google AI Studio. 
Designed to feel *alive* — continuously flowing on desktop, touch-friendly on mobile, and interaction-aware.

This component is ideal for:
- Interactive showcases
- Character / media galleries
- Narrative or world-driven UI systems
- Motion-first design systems

---

## ✨ Features

- 🐍 **Serpentine motion loop**  
  Items flow through a logical path rather than a linear track.

- 🎥 **Framer Motion animation loop**  
  Uses `useAnimationFrame` + `useMotionValue` for smooth, time-based motion.

- 🖱 **Hover-aware speed control**  
  Carousel slows down on hover to encourage interaction.

- 📱 **Mobile-first fallback layout**  
  Automatically switches to a vertical static layout on smaller screens.

- 🪟 **Modal media viewer**  
  Clicking an item opens a modal without interrupting layout flow.

- ⚙️ **Fully configurable constants**  
  Layout, speed, spacing, and breakpoints live in a shared constants file.

---

## 🧠 How It Works

### Desktop
- Items move continuously through a fixed number of **logical spots**
- Motion loops seamlessly using modulo math
- Hovering reduces speed
- Selecting an item pauses motion and opens a modal

### Mobile
- Animation is disabled
- Items render as a stacked vertical list
- Modal behavior remains intact

---

## 📦 Dependencies

```bash
react
framer-motion
