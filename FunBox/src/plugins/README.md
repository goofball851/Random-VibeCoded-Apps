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

🛠 Tips

Keep plugin logic isolated — don’t leak globals

If a plugin needs to preload assets, do it in the async function

Load only the required runtime (don’t bundle all into core)

Use inline styles or classes, not external CSS

💡 Future Ideas

Add a fallback for unsupported types

Enable shared controls (pause, reset, volume)

Allow multiple states per plugin

Support multiple plugins per Fun Box
