# 🎨 ChromaFlow AI

<img width="500" height="500" alt="Gemini_Generated_Image_2r6i9n2r6i9n2r6i" src="https://github.com/user-attachments/assets/9d21e7cc-b250-46e4-9ef1-abea9099c525" />


![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**ChromaFlow AI** is a professional-grade brand identity and color system architect. Powered by Google's Gemini 3 Flash, it transforms simple anchor colors or visual assets into comprehensive, accessible, and high-fidelity design systems.

---

## ✨ Key Features

-   **🧠 Logic-Based Generation**: Create palettes using design prompts like "Cyberpunk High Contrast" or "Oceanic Calm" via Gemini AI.
-   **🧬 DNA Extraction**: Upload any image (logo, photo, or mockup) to extract its core color DNA and map it to functional UI roles.
-   **📐 Pattern Studio**: Dynamic SVG pattern generator (Dots, Grid, Waves, Circuit) that scales with your palette.
-   **📱 Brand Mockups**: Real-time previews of App Icons and Profile Systems to see your colors in action.
-   **♿ Accessibility Intelligence**: Automatic WCAG contrast checking (AA/FAIL) for every generated color.
-   **🖼️ High-Res Export**: Download a 1024x1024 "Brand Tile" containing your title, mockups, swatches, and custom patterns.
-   **💾 Cloud Vault**: Save your favorite systems locally for future reference.

---

## 🚀 Getting Started

### Prerequisites
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/).

### Installation
1. Clone the repository.
2. Set your environment variable:
   ```bash
   export API_KEY='your_gemini_api_key_here'
   ```
3. Open `index.html` in your browser (or use a local dev server like Vite/Live Server).

---

## 🛠️ Built With

-   **React 19** - UI Framework
-   **Tailwind CSS** - Styling & Dark Mode
-   **@google/genai** - AI Engine (Gemini 3 Flash)
-   **Lucide React** - Iconography
-   **HTML5 Canvas** - High-resolution image processing

---

## 📖 How It Works

### The Studio (Discover)
Input a hex code and optional design prompt. ChromaFlow sends this context to Gemini with a strict system instruction to return a balanced 5-role palette:
1. **Primary**: Main brand voice.
2. **Secondary**: Supporting elements.
3. **Accent**: High-conversion highlights.
4. **Outline**: Borders and subtle details.
5. **Background**: Neutral UI surface.

### Extraction Logic
When an image is uploaded, ChromaFlow performs a multimodal analysis. Gemini doesn't just "pick pixels"; it understands the *intent* of the image, selecting a background that provides utility while preserving the aesthetic energy of the source.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Developed with ❤️ by the ChromaFlow Team.
