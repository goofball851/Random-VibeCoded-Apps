# 📦 Funbox Runtime Engine

[![Version](https://img.shields.io/badge/Version-1.0.2-indigo)](https://github.com/your-username/funbox-runtime)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.11-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Rive](https://img.shields.io/badge/Rive-4.17-black?logo=rive&logoColor=white)](https://rive.app/)

A high-performance, isolated interaction layer for React. Funbox creates a "Cinematic Mode" for your web applications, allowing users to interact with Rive, Lottie, or video assets in a distraction-free, full-screen environment.

## ✨ Key Features

- **Process Isolation**: Mounts via React Portals at the document root to bypass parent CSS constraints (z-index, overflow, etc.).
- **Smart Scroll Management**: Automatically locks and restores document scrolling on mount/unmount.
- **HUD Interface**: Built-in minimalist "Heads-Up Display" with active process tracking and a "Process Kill" emergency exit.
- **Engine Agnostic**: Architected to support multiple rendering engines (currently optimized for Rive Canvas).
- **Motion Orchestration**: Powered by Framer Motion for high-end entry/exit transitions.

## 🚀 Installation

This is a **Source Plugin**. Simply copy the `/funbox` folder into your project's `src` or `components` directory.

### Peer Dependencies
Ensure your project has the following installed:
```bash
npm install framer-motion @rive-app/react-canvas tailwindcss
```

## 🛠 Usage

1. **Define a Session**: The Runtime is controlled by a `FunboxSession` object.
2. **Mount the Component**: Place the component anywhere in your tree (it portals out to document body).

```tsx
import { useState } from 'react';
import { FunboxRuntime, FunboxSession } from './funbox';

export function MyExperience() {
  const [activeSession, setActiveSession] = useState<FunboxSession | null>(null);

  const launchScene = () => {
    setActiveSession({
      itemId: 'SCENE_01',
      type: 'rive',
      url: 'https://cdn.rive.app/animations/vehicles.riv'
    });
  };

  return (
    <div>
      <button onClick={launchScene}>Launch Interaction</button>

      <FunboxRuntime 
        session={activeSession} 
        onClose={() => setActiveSession(null)} 
      />
    </div>
  );
}
```

## 📖 API Reference

### `FunboxRuntime` Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `session` | `FunboxSession \| null` | The data object defining the content to render. If null, the runtime hides. |
| `onClose` | `() => void` | Callback triggered when the "Kill Process" button is clicked. |
| `version` | `string` | Optional version string displayed in the HUD. |

### `FunboxSession` Object

| Field | Type | Description |
| :--- | :--- | :--- |
| `itemId` | `string` | A unique identifier shown in the HUD (Debug mode). |
| `type` | `'rive' \| 'lottie'` | The rendering engine to initialize. |
| `url` | `string` | Remote source URL for the asset. |

## 🎨 Design Philosophy

Funbox is designed to feel like a "System Level" event. 
- **The HUD**: Uses `font-mono` and high-tracking uppercase text to simulate a terminal/OS interface.
- **The Backdrop**: Uses a pure deep `#000000` to refocus the user's brain on the interaction.
- **Transitions**: Uses a 800ms "Initialization" delay to hide engine loading/asset fetching artifacts, ensuring a "perfect" first frame.

## 📄 License

MIT © 2024 Flux Ribbon Labs.
