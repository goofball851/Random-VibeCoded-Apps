# FLUX.RIBBON Engine v2.5

<img width="500" height="500" alt="Gemini_Generated_Image_mxtjx5mxtjx5mxtj" src="https://github.com/user-attachments/assets/55db1947-e0a9-4134-ba99-9b3d5a9526d1" />

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.11-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Rive](https://img.shields.io/badge/Rive-Ready-black?logo=rive&logoColor=white)](https://rive.app/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A high-fidelity, serpentine media carousel engine built with **React**, **Framer Motion**, and **Rive**. Designed for cinematic asset discovery with a focus on fluid motion and adaptive scaling across all device modalities.

## ✨ Features

- **3-Track Serpentine Flow**: A unique logical tracking system that moves items in a continuous "S" pattern across three horizontal rows.
- **Multi-Format Support**: Native integration for high-resolution images, video assets, and interactive **Rive** animations.
- **Adaptive Ribbon Scaling**: Dynamic viewport calculation that maximizes "screen-fill" while maintaining readability on Ultra-wide, Desktop, and Tablet displays.
- **Cinematic Lightbox**:
  - **Tablet Optimization**: Unified vertical stacking for both Portrait and Landscape to maintain media dominance.
  - **Mobile Landscape Engine**: Specialized scaling that fits content perfectly into low-height viewports without vertical overflow.
- **Hover Physics**: Spring-based 3D parallax effects and ambient background color sampling.
- **Performance Focused**: Efficient rendering using logical spot visibility checks to minimize DOM overhead during animation.

## 🛠️ Tech Stack

- **Framework**: React 19 (ESM)
- **Animation**: Framer Motion
- **Interactive Assets**: Rive Canvas
- **Styling**: Tailwind CSS
- **Icons/UI**: Custom SVG + Lucide-style patterns

## 🚀 Getting Started

### Prerequisites

This project utilizes ES Modules and an import map for lightning-fast development without a heavy build step. Ensure you have a modern browser or a simple local server (like `npx serve`).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/flux-ribbon.git
   cd flux-ribbon
   ```

2. Open `index.html` in your browser.

### Development Note

The project is structured with a root `index.html` using an `importmap`. Components are modular ES6 modules located in the project root.

## 📱 Responsive Architecture

| Device | Carousel Mode | Modal Layout |
| :--- | :--- | :--- |
| **Desktop** | Serpentine (3-Track) | Side-by-Side (Cinematic) |
| **Tablet** | Serpentine (Adaptive) | Stacked (Media Top) |
| **Mobile** | Vertical List | Full-screen (Auto-scaled) |

## 🧩 Component Breakdown

- **RibbonCarousel**: The core engine orchestrating the progress and scaling.
- **CarouselItem**: Individual nodes with 3D hover physics and Rive state-machine integration.
- **MediaModal**: The immersive detail view with orientation-aware layout logic.
