# 🧩 Fun Box Plugin System

This folder contains **plugin loaders** for different interactive asset types used inside the `<fun-box>` web component.

Each plugin loader is a JavaScript module that exports a default function to mount and control a visual experience — like a Rive animation, Lottie file, or custom canvas.

---

## 🧠 How It Works

When a `<fun-box>` is initialized, it reads the `type` attribute (e.g. `rive`, `lottie`, `canvas`, etc.) and dynamically imports a corresponding loader from this folder:

```js
import(`./plugins/loader-${type}.js`)
```

---

# 🧩 Fun Box Plugin System

This folder contains plugin loaders for interactive types like Rive, Lottie, etc.

---

## 🔄 Plugin Lifecycle

Each loader must return an object with:

```js
{
  play: (behavior: string) => void,
  destroy: () => void
}```

---

## 🛠 Tips

Keep plugin logic isolated — don’t leak globals

If a plugin needs to preload assets, do it in the async function

Load only the required runtime (don’t bundle all into core)

Use inline styles or classes, not external CSS

---

## 💡 Future Ideas

1. Add a fallback for unsupported types
2. Enable shared controls (pause, reset, volume)
3. Allow multiple states per plugin
4. Support multiple plugins per Fun Box

