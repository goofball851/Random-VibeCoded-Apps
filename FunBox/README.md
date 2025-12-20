# 🎁 Fun Box 1.0

**Fun Box** is a modular web component designed to contain and manage rich visual or interactive elements — like Rive, Spline, Lottie, or custom canvases — in a simple, drop-in format. It can be used in websites, apps, or PWAs.

---

## 📦 Features

- Web Component (`<fun-box>`)
- Interaction mapping (`click`, `hover`, `tap`, etc.)
- Behavior trigger system (`bounce`, `nod`, etc.)
- Optional character/mascot display
- Plugin-type support (via loaders)
- Placeholder plugin included

---

## 🚀 Getting Started

```html
<fun-box
  type="placeholder"
  src=""
  character="boomi"
  trigger="click"
  behavior="bounce"
/>
```
---

## 📦 FunBox Component

```
<script type="module" src="src/fun-box.js"></script>
```
---

## 🎨 Mascots

Mascots are optional and provide personality or themed feedback.

To disable:

```Mascots
<fun-box character="none"></fun-box>
```

---

## 📝 License

All plugin code is covered under the main project MIT license. Contribute freely and creatively.

---

## 🔗 Resources

[Rive JS Runtime Docs](https://docs.rive.app/runtime/)

[Lottie Web](https://github.com/airbnb/lottie-web)

[Spline Runtime](https://docs.spline.design/web-app-runtime)
