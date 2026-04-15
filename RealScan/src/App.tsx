/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { FileText, Image as ImageIcon, Upload, Activity, AlertTriangle, CheckCircle, Cpu, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type Tab = 'text' | 'image';

interface AnalysisResult {
  likelihood: number;
  confidenceScore: number;
  verdict: 'Likely AI' | 'Mixed' | 'Likely Human';
  pasteDetected: 'Yes' | 'Possible' | 'No' | 'N/A';
  likelySource: string;
  signals: string[];
  analysis: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [textContent, setTextContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleTextFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTextContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data:image/...;base64, part
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const analyzeContent = async () => {
    if (activeTab === 'text' && !textContent.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }
    if (activeTab === 'image' && !imageFile) {
      setError('Please upload an image to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          likelihood: { type: Type.NUMBER, description: "AI likelihood percentage (0-100)" },
          confidenceScore: { type: Type.NUMBER, description: "Confidence score in the overall verdict (0-100)" },
          verdict: { type: Type.STRING, description: "'Likely AI', 'Mixed', or 'Likely Human'" },
          pasteDetected: { type: Type.STRING, description: "'Yes', 'Possible', 'No', or 'N/A'" },
          likelySource: { type: Type.STRING, description: "Guess the generator (e.g. ChatGPT, Midjourney, Human, etc.)" },
          signals: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Bullet points of specific signals detected" },
          analysis: { type: Type.STRING, description: "2-3 sentence plain-English analysis" }
        },
        required: ["likelihood", "confidenceScore", "verdict", "pasteDetected", "likelySource", "signals", "analysis"]
      };

      let response;

      if (activeTab === 'text') {
        const prompt = `Analyze the provided text to determine if it was AI-generated. Be highly strict and skeptical. Look for micro-signals such as:
- Predictable token sequences and low perplexity.
- Lack of "burstiness" (variance in sentence length and structure).
- Over-reliance on common LLM vocabulary ("tapestry", "delve", "testament", "crucial", "furthermore", "in conclusion", "it is important to note").
- Perfectly balanced "sandwich" essay structures (intro, 3 points, conclusion).
- Absence of genuine human idiosyncrasies, emotional nuance, or natural conversational flow.

If you detect these synthetic markers, aggressively increase the AI likelihood percentage.

Text to analyze:
${textContent}`;

        response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: prompt,
          config: {
            systemInstruction: "You are a highly strict and skeptical AI provenance detector. Your threshold for flagging content as AI-generated is very low. Penalize text heavily for generic structures, lack of burstiness, and typical LLM phrasing.",
            temperature: 0.1,
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
          }
        });
      } else {
        const prompt = `You are an expert AI provenance detector. Analyze the provided image to determine if it was AI-generated. Look for signals like hand/finger anatomy errors, background blur artifacts, incoherent depth, overly uniform skin texture/lighting, garbled/nonsensical text, and dreamlike/physically impossible details. Return a JSON object matching the schema.`;
        
        const base64Data = await fileToBase64(imageFile!);
        
        response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: {
            parts: [
              { text: prompt },
              { inlineData: { data: base64Data, mimeType: imageFile!.type } }
            ]
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
          }
        });
      }

      if (response.text) {
        const parsedResult = JSON.parse(response.text) as AnalysisResult;
        setResult(parsedResult);
      } else {
        throw new Error("No response received from the model.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getVerdictBadgeClass = (verdict: string) => {
    if (verdict === 'Likely AI') return 'badge-red';
    if (verdict === 'Mixed') return 'badge-amber';
    return 'badge-green';
  };

  const getVerdictBgClass = (verdict: string) => {
    if (verdict === 'Likely AI') return 'bg-[var(--verdict-red)]';
    if (verdict === 'Mixed') return 'bg-[var(--verdict-amber)]';
    return 'bg-[var(--verdict-green)]';
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <header className="h-16 bg-white border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0">
        <div className="text-xl font-bold tracking-tight flex items-center gap-2">
          Real<span className="text-[var(--accent-indigo)]">Scan</span>
        </div>
        <div className="text-sm text-[var(--text-secondary)]">
          System Status: <span className="text-[var(--verdict-green)] font-medium">Operational</span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 p-8 overflow-auto max-w-7xl mx-auto w-full">
        {/* Input Section */}
        <section className="flex flex-col gap-6">
          <div className="flex border border-[var(--border-color)] rounded-lg overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${activeTab === 'text' ? 'bg-[var(--bg-main)] text-[var(--accent-indigo)] border-b-2 border-[var(--accent-indigo)]' : 'text-[var(--text-secondary)] hover:bg-black/5'}`}
            >
              <FileText className="w-4 h-4" />
              Text Analysis
            </button>
            <div className="w-px bg-[var(--border-color)]"></div>
            <button
              onClick={() => setActiveTab('image')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${activeTab === 'image' ? 'bg-[var(--bg-main)] text-[var(--accent-indigo)] border-b-2 border-[var(--accent-indigo)]' : 'text-[var(--text-secondary)] hover:bg-black/5'}`}
            >
              <ImageIcon className="w-4 h-4" />
              Image Analysis
            </button>
          </div>

          <div className="card">
            <div className="card-title mb-4">{activeTab === 'text' ? 'Text Analysis' : 'Media Analysis'}</div>
            {activeTab === 'text' ? (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <label className="data-label mb-0">Input Text</label>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-xs font-semibold text-[var(--accent-indigo)] hover:underline"
                  >
                    <Upload className="w-3 h-3" /> Upload .txt
                  </button>
                  <input 
                    type="file" 
                    accept=".txt" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleTextFileUpload}
                  />
                </div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste content for linguistic fingerprinting..."
                  className="input-textarea h-56 resize-none focus:outline-none focus:ring-1 focus:ring-[var(--accent-indigo)]"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <label className="data-label mb-0">Input Image</label>
                </div>
                <div 
                  className="upload-zone flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-black/5 transition-colors relative overflow-hidden h-56"
                  onClick={() => imageInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 opacity-60 mb-2" />
                      <strong className="text-[var(--text-primary)]">Drag and drop image here</strong>
                      <p className="text-xs">Supports JPG, PNG, WEBP, GIF</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.webp,.gif" 
                    className="hidden" 
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={analyzeContent}
                disabled={isAnalyzing}
                className="btn-primary px-6 py-2.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    Analyze Artifact
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 border border-red-500/30 bg-red-500/10 text-red-700 text-sm flex items-start gap-2 rounded-md">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* Results Section */}
        <section className="flex flex-col h-full">
          <div className="card h-full flex flex-col">
            <div className="card-title">Analysis Results</div>
            
            {!result && !isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] gap-4">
                <Activity className="w-12 h-12 opacity-50" />
                <p className="text-sm font-semibold uppercase tracking-widest opacity-70">Awaiting Input</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] gap-4">
                <Loader2 className="w-12 h-12 animate-spin opacity-50" />
                <p className="text-sm font-semibold uppercase tracking-widest animate-pulse opacity-70">Processing Signals...</p>
              </div>
            )}

            {result && !isAnalyzing && (
              <div className="flex flex-col animate-in fade-in duration-500 flex-1">
                <div className="text-center py-6">
                  <div className="text-5xl font-extrabold leading-none mb-3">{result.likelihood}%</div>
                  <div className="flex items-center justify-center gap-3">
                    <div className={`badge ${getVerdictBadgeClass(result.verdict)}`}>{result.verdict}</div>
                    <div className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-main)] px-3 py-1 rounded-full uppercase tracking-wide">
                      {result.confidenceScore}% Confidence
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg-main)] rounded-full overflow-hidden mt-4">
                    <div 
                      className={`h-full ${getVerdictBgClass(result.verdict)} transition-all duration-1000 ease-out`}
                      style={{ width: `${result.likelihood}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-6">
                  <div>
                    <label className="data-label">Likely Source</label>
                    <div className="data-value">{result.likelySource}</div>
                  </div>
                  <div>
                    <label className="data-label">Paste Detected</label>
                    <div className="data-value">{result.pasteDetected}</div>
                  </div>
                </div>

                <div className="mt-6 border-t border-[var(--border-color)] pt-6">
                  <label className="data-label">Critical Signals</label>
                  <ul className="mt-3 space-y-2">
                    {result.signals.map((signal, idx) => (
                      <li key={idx} className="text-sm pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[var(--accent-indigo)] before:font-bold">
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="summary-text mt-auto">
                  {result.analysis}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
