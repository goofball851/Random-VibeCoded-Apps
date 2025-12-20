# 🧩 Fun Box Plugin System

This folder contains **plugin loaders** for different interactive asset types used inside the `<fun-box>` web component.

Each plugin loader is a JavaScript module that exports a default function to mount and control a visual experience — like a Rive animation, Lottie file, or custom canvas.

---

## 🧠 How It Works

When a `<fun-box>` is initialized, it reads the `type` attribute (e.g. `rive`, `lottie`, `canvas`, etc.) and dynamically imports a corresponding loader from this folder:

```js
import(`./plugins/loader-${type}.js`)
