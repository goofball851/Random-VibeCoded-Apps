# Fontini

<img width="500" height="500" alt="Gemini_Generated_Image_yv034zyv034zyv03" src="https://github.com/user-attachments/assets/4f93431a-924d-41ea-99f3-13b17e31eceb" />


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A powerful web-based font creation tool that lets you design custom fonts by drawing each character individually. Create unique typefaces with professional-grade drawing tools, then export them as OpenType font files (.otf).

## ✨ Features

### Drawing Tools
- **Pen Tool**: Create precise vector paths with nodes and curves
- **Brush Tool**: Freehand drawing for organic shapes
- **Fill Tool**: Color closed paths with customizable colors and patterns
- **Eraser**: Remove unwanted strokes
- **Move Tool**: Reposition elements on the canvas
- **Node Selection**: Edit individual points in your paths

### Professional Features
- **Smart Curve Smoothing**: Automatically optimize your pen strokes
- **Adjustable Weight**: Control stroke thickness (1-50px)
- **Fill Patterns**: Solid, hatch, dots, and grid patterns
- **Fill Colors**: 6 preset colors including black, indigo, pink, green, orange, and red
- **Typography Guidelines**: Toggle ascent, caps height, x-height, baseline, and center guides
- **Blueprint Mode**: Import reference images to trace over

### Workflow Tools
- **Character Matrix**: Visual grid showing completion status of all glyphs
- **Gallery View**: Preview all your completed characters at once
- **Undo/Redo**: Full history support for your drawing actions
- **Progress Tracking**: See which characters are complete
- **Export to .otf**: Generate professional OpenType font files

## 🎯 Supported Characters

Create glyphs for all uppercase letters (A-Z), lowercase letters (a-z), and numbers (0-9) - 62 characters total.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fontini.git

# Navigate to the project directory
cd fontini

# Install dependencies
npm install

# Start the development server
npm start
```

The app will open at `http://localhost:3000`

## 📖 Usage Guide

### Basic Workflow

1. **Select a Character**: Use the navigation arrows or open the Matrix to choose which character to draw
2. **Choose Your Tool**: Select from pen, brush, fill, eraser, move, or node tools
3. **Draw Your Character**: Create your design within the canvas area
4. **Use Guidelines**: Toggle the typography guidelines to maintain consistent proportions
5. **Navigate**: Move to the next character and repeat
6. **Export**: Once you've completed your desired characters, click "Export" to download your .otf font file

### Tool Tips

**Pen Tool**
- Click to place nodes
- Drag while placing for curved paths
- Click on existing endpoints to continue a path
- Enable "Smart Path" for automatic curve smoothing

**Fill Tool**
- Only works on closed paths created with the pen tool
- Select your color and pattern before clicking
- Click inside a closed shape to fill it

**Blueprint Mode**
- Click "Import Ref" to upload a reference image
- Toggle "Blueprint" to show/hide the reference
- Trace over scanned drawings or reference type

## 🛠️ Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **HTML Canvas** - Drawing surface
- **OpenType.js** - Font file generation

## 🎨 Features in Detail

### Guidelines System
Five adjustable typography guidelines help maintain consistent character proportions:
- **Ascent**: Top of tall letters (b, d, h)
- **Caps Height**: Top of capital letters
- **X-Height**: Top of lowercase letters (x, a, e)
- **Baseline**: Bottom of letters
- **Center**: Horizontal center guide

### Fill System
Four pattern options for filled shapes:
- **Solid**: Complete fill
- **Hatch**: Diagonal lines
- **Dots**: Dotted pattern
- **Grid**: Cross-hatch pattern

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by professional font design tools
- Thanks to the open-source community


---

**Happy font creating with Fontini!** 🎨✨
