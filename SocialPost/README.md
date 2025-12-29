# 🚀 SocialPost Ai

Create stunning, high-engagement social media cards in seconds. **SocialPost Ai** leverages the power of Google's Gemini models to turn simple URLs or raw text into beautiful, shareable 1:1 square images.

![SocialPost Ai Hero](https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1000)

## ✨ Key Features

- **🌐 Smart URL Unfurling**: Paste any link, and Gemini 3 Flash will automatically extract the most relevant title, description, and site information.
- **🎨 AI Image Generation**: Don't have a photo? Generate high-quality, 1:1 aspect ratio images using **Gemini 2.5 Flash Image** based on your card's content.
- **✍️ Viral Content Polish**: Use AI to refine your headlines and descriptions. Transform dry text into "Viral" copy with a single click.
- **🎭 Designer Templates**:
  - **Trendy Lab**: Modern gradients and sleek typography.
  - **Professional**: Clean, corporate-ready layouts.
  - **Neo-Brutalist**: High contrast, bold borders, and raw energy.
  - **Pop Cartoony**: Fun, vibrant, and eye-catching.
  - **Minimal**: Subtle and sophisticated.
- **🌗 Seamless Theme Support**: Fully optimized Dark and Light modes that respect your system preferences.
- **📸 High-Res Export**: Download pixel-perfect 1:1 square PNGs (1080x1080) optimized for Instagram, X (Twitter), and LinkedIn.
- **🔗 Instant Sharing**: Integrated sharing buttons for major social platforms.

## 🛠️ Built With

- **Framework**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (@google/genai)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Image Capture**: [html-to-image](https://www.npmjs.com/package/html-to-image)

## 🚀 Getting Started

### Prerequisites

You will need a Google Gemini API Key. You can get one for free at the [Google AI Studio](https://aistudio.google.com/).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/socialpost-ai.git
   cd socialpost-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your API Key**
   Create a `.env` file in the root directory and add your key:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm start
   ```

## 📖 Usage

1. **Paste a Link**: Use the "Source Link" field to auto-populate content.
2. **Generate Visuals**: Use the "AI Generate" button to create a background image if you don't have one.
3. **Refine**: Use "Viral Polish" to make your title pop.
4. **Customize**: Swap templates in the "Layout" tab or tweak colors and fonts in "Design".
5. **Share**: Click "Download" for the high-res image or use the "Share" modal to post directly.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ using Google Gemini.
