# ArtFrame

<img width="500" height="500" alt="Gemini_Generated_Image_j1a3c7j1a3c7j1a3" src="https://github.com/user-attachments/assets/7b4d356c-e074-4237-9d39-3f83c27432a1" />


![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg?logo=tailwindcss&logoColor=white)

**ArtFrame** is a high-performance, minimalist React application designed for creating structured image layouts. Perfect for character portfolios, mood boards, and social media content, it allows users to arrange images in a 1080p square canvas with precise control.

## ✨ Features

- **Drag & Drop Layouts**: Easily arrange blocks within a fixed 1080x1080 canvas.
- **Smart Snapping**: Blocks snap to each other and the grid for perfect alignment.
- **Strict Boundaries**: Content stays locked within the canvas—no more accidental overflows.
- **Image Manipulation**: Pan and zoom images within their blocks for the perfect crop.
- **Rich Customization**: Adjust borders (solid, dashed, dotted), border colors, background settings, and **canvas corner radius**.
- **Video Export**: Automatically detects GIFs and exports the entire canvas as a high-quality H.264 MP4 video.
- **Local Persistence**: Save and load your projects locally via JSON.
- **History**: Robust Undo/Redo support for peace of mind.

## 🚀 Usage

1.  **Add Blocks**: Click the "Add Block" button to spawn new content areas.
2.  **Edit Content**: Select a block to upload images, change borders, or duplicate it.
3.  **Adjust Images**: Use the "Image Transform" tools in the sidebar to scale and pan your images.
4.  **Export**: Click "Export PNG" (or "Export Video" if using GIFs) to download your creation.

## 🛠 Tech Stack

- **Framework**: React 19
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Video Processing**: WebCodecs API + mp4-muxer
- **GIF Processing**: gifuct-js

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Developed by Google Gemini** acting as a Senior Frontend Engineer.
