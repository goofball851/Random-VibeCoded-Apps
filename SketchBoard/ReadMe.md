# SketchBoard

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.0+-61dafb.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

**SketchBoard** is an infinite canvas drawing application for visual brainstorming and idea exploration. Draw freely, upload reference images, and sketch over them to plan out your concepts.

Perfect for artists, designers, and anyone who thinks visually!

## Features

### Drawing Tools
- **Brush Tool** - Draw with customizable colors and sizes
- **Eraser Tool** - Erase with adjustable size
- **Infinite Canvas** - Pan and zoom anywhere
- **Undo/Redo** - Full history tracking

### Image Management
- **Upload Images** - Add reference images or AI-generated concepts
- **Move Images** - Reposition images anywhere on the canvas
- **Draw Over Images** - Sketch directly on top of references

### Canvas Controls
- **Pan & Zoom** - Navigate your workspace smoothly
- **Smart Save** - Preview before saving with automatic cropping
- **Clear Canvas** - Start fresh with confirmation dialog
- **Watermark** - Automatic branding on exports

## Keyboard Shortcuts

### Tools
- `B` - Switch to Brush
- `E` - Switch to Eraser
- `M` - Switch to Move (for repositioning images)

### Size Adjustment
- `[` - Decrease tool size
- `]` - Increase tool size

### History
- `Cmd/Ctrl + Z` - Undo
- `Shift + Cmd/Ctrl + Z` - Redo

### Navigation
- `Middle Click` or `Alt + Drag` - Pan canvas
- `Scroll` - Zoom in/out

## How to Use

1. **Start Drawing** - Select the brush tool and start sketching
2. **Upload References** - Click Upload to add images to your canvas
3. **Reposition Images** - Use the Move tool (M) to drag images around
4. **Adjust Tools** - Use the slider or `[` `]` keys to change brush/eraser size
5. **Save Your Work** - Click Save to preview and download your sketch

## Tech Stack

- **React** - UI framework
- **HTML5 Canvas** - Drawing engine
- **Lucide Icons** - Icon library
- **Tailwind CSS** - Styling

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sketchboard.git

# Navigate to project directory
cd sketchboard

# Install dependencies
npm install

# Start development server
npm start
```

## Features in Detail

### Save with Preview
When you click Save, SketchBoard:
1. Automatically crops to your content (no empty space)
2. Shows you a preview of what will be saved
3. Adds padding around your work
4. Includes a watermark
5. Lets you confirm or cancel before downloading

### Smart Image Handling
- Images are placed at your current viewport location
- Move tool lets you reposition after upload
- Images integrate with undo/redo system
- Multiple images supported

### Infinite Canvas
- No size limits - draw as large as you need
- Smooth pan and zoom
- All content tracked regardless of position
- Export automatically finds and crops to your content

## License

MIT License - feel free to use and modify!

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## Future Features (Ideas)

- [ ] Layers support
- [ ] Different brush types (pencil, marker, etc.)
- [ ] Opacity controls
- [ ] Color palettes
- [ ] Image rotation and scaling
- [ ] Export in different formats (JPG, SVG)
- [ ] Custom watermark images
- [ ] Touch/stylus pressure sensitivity

## Contact

Created for visual thinkers who need a space to dump and develop ideas! 

---

**SketchBoard** - Where ideas take shape 🎨
