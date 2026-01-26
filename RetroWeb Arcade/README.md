# RetroWeb Arcade

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)
![EmulatorJS](https://img.shields.io/badge/EmulatorJS-Engine-orange?style=for-the-badge)

A modern, high-performance retro gaming emulator that runs entirely in your browser. **RetroWeb Arcade** combines the power of EmulatorJS with AI-driven metadata enrichment to create a beautiful, personalized digital cabinet for your legally owned ROMs.

## 🌟 Features

*   **Multi-System Support**: Play NES, SNES, Sega Genesis, Game Boy, GBA, and Nintendo DS games.
*   **AI-Powered Library**: Automatically detects ROM types and fetches box art/metadata using **Google Gemini**.
*   **Drag & Drop**: Simply drop your game files onto the window to import them instantly.
*   **Modern UI**: 
    *   Glassmorphism aesthetics with Tailwind CSS.
    *   **Eye-Comfort Themes**: Morning (Cream), Afternoon (Slate), and Night (Zinc) modes designed to avoid harsh pure black/white contrast.
    *   Customizable color palettes with persistence.
*   **Save States**: Save and load your game progress anytime (stored locally in browser).
*   **Controller Support**: Plug-and-play support for standard gamepads (Xbox, PS4/5, Generic).
*   **Privacy First**: All game files are stored locally in IndexedDB. Nothing is uploaded to a server except for metadata queries.

## 🚀 Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up Environment**:
    *   Create a `.env` file or export your API key.
    *   `API_KEY=your_google_gemini_api_key`
4.  **Run Development Server**:
    ```bash
    npm start
    ```

## 🎮 Controls

### Keyboard
*   **Arrow Keys**: D-Pad / Movement
*   **Z / X**: A / B Buttons
*   **A / S**: X / Y Buttons
*   **Enter**: Start
*   **Shift**: Select
*   **Shift + F2**: Save State
*   **Shift + F4**: Load State

### Gamepad
*   Standard mapping applied automatically upon connection.

## 🛠 Tech Stack

*   **Frontend**: React 18, TypeScript, Tailwind CSS
*   **AI**: Google GenAI SDK (Gemini 1.5 Flash)
*   **Emulation**: EmulatorJS (Iframe integration)
*   **Storage**: IndexedDB (via native API)

## 📄 License

This project is for educational purposes. Users are responsible for providing their own legally obtained ROM files.