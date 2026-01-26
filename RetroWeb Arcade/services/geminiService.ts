import { GoogleGenAI, Type } from "@google/genai";
import { GameMetadata } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
}

// Local Heuristic Parser
// Extracts cleaner titles from common ROM naming conventions (e.g., "Mario (USA) (Rev 1).sfc")
const parseLocalMetadata = (filename: string, system: string): GameMetadata => {
    // 1. Remove file extension
    let cleanName = filename.replace(/\.[^/.]+$/, "");
    
    // 2. Remove things in brackets [] or parentheses () often found in ROM sets
    // e.g. "Game Title (USA) [!]" -> "Game Title"
    cleanName = cleanName.replace(/(\(.*\))|(\[.*\])/g, "").trim();
    
    // 3. Remove version numbers like v1.0 if attached
    cleanName = cleanName.replace(/v\d+(\.\d+)?/i, "").trim();

    return {
        title: cleanName,
        description: `Classic title for the ${system} console. loaded from local library.`,
        genre: "Retro",
        releaseYear: "Unknown", // Local parser can't guess year reliably
        coverQuery: `${cleanName} ${system} box art official`,
        coverUrl: undefined // Leaving this undefined triggers the GameCard's search thumbnail fallback
    };
};

export const generateGameMetadata = async (filename: string, system: string): Promise<GameMetadata> => {
  const ai = getClient();
  
  // If no API key is present, immediately use local parser
  if (!ai) {
      console.log("No API Key found, using local filename parsing.");
      return parseLocalMetadata(filename, system);
  }

  try {
    const prompt = `
      I have a ROM file named "${filename}" for the console system "${system}".
      
      Identify this game and find its official box art.
      
      1. **Title**: The official clean English title (e.g., "Super Mario World").
      2. **Description**: A concise summary (max 2 sentences).
      3. **Genre**: The primary genre.
      4. **Release Year**: The original release year.
      5. **Cover URL**: 
         - Search specifically for an image hosted on **upload.wikimedia.org** or **commons.wikimedia.org**.
         - These URLs are preferred because they allow hotlinking. 
         - If found, ensure it is the box art or cartridge art.
         - If NOT found on wikimedia, leave this field empty. Do not guess URLs from other sites.
      6. **Cover Query**: 
         - Create a specific search string to find the box art image on a search engine. 
         - Format: "[Game Title] [System Name] box art cover" (e.g. "Sonic the Hedgehog Genesis box art cover").

      Return the result as a valid JSON object.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            genre: { type: Type.STRING },
            releaseYear: { type: Type.STRING },
            coverQuery: { type: Type.STRING, description: "Optimized search query for the box art" },
            coverUrl: { type: Type.STRING, description: "Direct URL to the box art (prefer Wikimedia)" },
          },
          required: ["title", "description", "genre", "releaseYear", "coverQuery"],
        },
      },
    });

    if (response.text) {
        // Strip Markdown code blocks if present (e.g. ```json ... ```)
        const cleanText = response.text.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleanText) as GameMetadata;
    }
    throw new Error("No response text");

  } catch (error) {
    console.warn("Gemini metadata generation failed or unavailable, falling back to local parser:", error);
    return parseLocalMetadata(filename, system);
  }
};