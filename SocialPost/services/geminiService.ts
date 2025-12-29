
import { GoogleGenAI, Type } from "@google/genai";
import { AIUnfurlResult } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const unfurlUrl = async (url: string): Promise<AIUnfurlResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this URL and provide metadata for a social media card: ${url}`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          siteName: { type: Type.STRING },
          imageSuggestionPrompt: { 
            type: Type.STRING, 
            description: "A text-to-image prompt to generate a fitting cover image for this link" 
          }
        },
        required: ["title", "description", "siteName", "imageSuggestionPrompt"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const polishContent = async (title: string, description: string, tone: string): Promise<{ title: string, description: string }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Polish the following content for a social media card in a ${tone} tone. Keep it concise.
    Title: ${title}
    Description: ${description}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["title", "description"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `High quality, modern, clean, digital art style: ${prompt}` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  let imageUrl = '';
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }
  return imageUrl;
};
