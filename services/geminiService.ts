import { GoogleGenAI, Type } from "@google/genai";
import { Language, ScoredSyndrome, ApiKeyEntry } from '../types';

const getSystemInstruction = (language: Language, cdssAnalysis?: ScoredSyndrome[]) => {
  const topSyndrome = cdssAnalysis && cdssAnalysis.length > 0 ? cdssAnalysis[0].syndrome : null;
  const tpContext = topSyndrome?.treatment_principle?.length ? `\nPRINSIP TERAPI DARI CDSS: ${topSyndrome.treatment_principle.join(', ')}` : '';
  const herbContext = topSyndrome?.herbal_prescription ? `\nRESEP KLASIK DARI CDSS: ${topSyndrome.herbal_prescription}` : '';

  return `Anda adalah Pakar Senior TCM (Giovanni Maciocia). 
Tugas: Diagnosis instan dalam JSON.
WAJIB: 10-12 titik akupunktur + Master Tung jika relevan.
ANALISIS: Pisahkan BEN (Akar) dan BIAO (Cabang).
SKOR: Sertakan "score" (0-100) untuk setiap item diferensiasi.${tpContext}${herbContext}
Gunakan PRINSIP TERAPI dan RESEP KLASIK dari CDSS jika tersedia.
Lakukan diferensiasi 8 Prinsip dan Organ Zang-Fu.
OBESITAS: Berikan analisis jika ada indikasi.
KECANTIKAN: Berikan saran jika relevan.

Bahasa: ${language}.
HANYA kembalikan JSON. Jangan ada teks lain sebelum atau sesudah JSON.`;
};

// Helper to gather all configured Gemini API keys from various storage locations
export const getResolvedGeminiKeys = (apiKeys?: ApiKeyEntry[]): ApiKeyEntry[] => {
  const keyMap = new Map<string, boolean>(); // key -> isExhausted

  // 1. Keys passed directly
  if (Array.isArray(apiKeys)) {
    apiKeys.forEach(k => {
      if (k && typeof k.key === 'string' && k.key.trim()) {
        keyMap.set(k.key.trim(), !!k.isExhausted);
      }
    });
  }

  // 2. Read from localStorage tcm_app_settings
  try {
    const raw = localStorage.getItem('tcm_app_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.geminiApiKey && typeof parsed.geminiApiKey === 'string' && parsed.geminiApiKey.trim()) {
        const k = parsed.geminiApiKey.trim();
        if (!keyMap.has(k)) keyMap.set(k, false);
      }
      if (Array.isArray(parsed.geminiApiKeys)) {
        parsed.geminiApiKeys.forEach((entry: any) => {
          const val = typeof entry === 'string' ? entry : entry?.key;
          if (val && typeof val === 'string' && val.trim()) {
            const trimmed = val.trim();
            if (!keyMap.has(trimmed)) {
              keyMap.set(trimmed, !!entry?.isExhausted);
            }
          }
        });
      }
    }
  } catch (e) {
    console.warn("Storage check skipped:", e);
  }

  // 3. Read direct localStorage keys
  try {
    ['gemini_api_key', 'tcm_gemini_api_key', 'apiKey', 'GEMINI_API_KEY'].forEach(item => {
      const val = localStorage.getItem(item);
      if (val && val.trim()) {
        const trimmed = val.trim();
        if (!keyMap.has(trimmed)) keyMap.set(trimmed, false);
      }
    });
  } catch (e) {}

  // 4. Read process.env or import.meta.env
  try {
    const envKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (envKey && envKey.trim() && envKey !== 'undefined' && envKey !== 'null') {
      const trimmed = envKey.trim();
      if (!keyMap.has(trimmed)) keyMap.set(trimmed, false);
    }
  } catch (e) {}

  return Array.from(keyMap.entries()).map(([key, isExhausted]) => ({ key, isExhausted }));
};

// Resilient priority order: fast, stable production models first, with fallbacks
export const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-2.5-flash',
  'gemini-3.7-flash',
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview',
  'gemini-flash-latest'
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sendMessageToGeminiStream = async (
  message: string,
  image: string | undefined,
  history: any[],
  language: Language,
  isPregnant: boolean,
  cdssAnalysis?: ScoredSyndrome[],
  apiKeys?: ApiKeyEntry[],
  onChunk?: (text: string) => void,
  onKeyExhausted?: (key: string) => void
) => {
  const allResolved = getResolvedGeminiKeys(apiKeys);
  
  if (allResolved.length === 0) {
    throw new Error("Tidak ada API Key Gemini yang ditemukan. Silakan tambahkan API Key di menu Settings / Master Control.");
  }

  // Filter available non-exhausted keys; if all are exhausted, reset them so user can retry
  let availableKeys = allResolved.filter(k => !k.isExhausted && k.key.trim() !== "");
  if (availableKeys.length === 0) {
    availableKeys = allResolved.map(k => ({ ...k, isExhausted: false }));
  }

  let lastError: any = null;
  const maxKeyAttempts = Math.min(availableKeys.length, 5);

  for (let kIdx = 0; kIdx < maxKeyAttempts; kIdx++) {
    const currentKeyEntry = availableKeys[kIdx];
    const apiKey = currentKeyEntry.key;

    // Try models in priority order
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        const parts: any[] = [{ text: message }];
        if (image) {
          const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
          const base64Data = image.split(',')[1] || image;
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data
            }
          });
        }

        // Prepare history (last 6 messages, excluding errors)
        const historyParts = history
          .filter(msg => (msg.role === 'user' || msg.role === 'model') && !msg.isError)
          .slice(-6)
          .map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text.substring(0, 1000) }]
          }));

        const contents = [
          ...historyParts,
          { role: 'user', parts }
        ];

        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: getSystemInstruction(language, cdssAnalysis),
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                conversationalResponse: { type: Type.STRING },
                diagnosis: {
                  type: Type.OBJECT,
                  properties: {
                    patternId: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    differentiation: {
                      type: Type.OBJECT,
                      properties: {
                        ben: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              label: { type: Type.STRING },
                              value: { type: Type.STRING },
                              score: { type: Type.NUMBER }
                            }
                          }
                        },
                        biao: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              label: { type: Type.STRING },
                              value: { type: Type.STRING },
                              score: { type: Type.NUMBER }
                            }
                          }
                        }
                      }
                    },
                    recommendedPoints: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          code: { type: Type.STRING },
                          description: { type: Type.STRING }
                        }
                      }
                    },
                    wuxingElement: { type: Type.STRING },
                    wuxingRelationships: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          type: { type: Type.STRING },
                          targetElement: { type: Type.STRING },
                          description: { type: Type.STRING }
                        }
                      }
                    },
                    lifestyleAdvice: { type: Type.STRING },
                    herbal_recommendation: { 
                      type: Type.OBJECT,
                      properties: {
                        formula_name: { type: Type.STRING },
                        chief: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                    },
                    obesity_indication: { type: Type.STRING },
                    beauty_acupuncture: { type: Type.STRING },
                    keySymptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                    tongueDescription: { type: Type.STRING },
                    pulseDescription: { type: Type.STRING }
                  }
                }
              }
            },
            temperature: 0.1,
            maxOutputTokens: 4096,
          }
        });

        let rawText = "";
        try {
          rawText = response.text || "";
        } catch (e) {
          console.error("Error getting response text:", e);
          const candidate = response.candidates?.[0];
          if (candidate?.finishReason === 'SAFETY') {
            throw new Error("Konten diblokir oleh filter keamanan AI. Silakan coba kata-kata lain.");
          }
          if (candidate?.finishReason === 'MAX_TOKENS') {
            throw new Error("Respon terlalu panjang dan terpotong. Silakan coba pertanyaan yang lebih spesifik.");
          }
          throw new Error("Gagal mengambil respon dari AI.");
        }

        let cleanText = rawText.trim();
        
        // Handle potential markdown code blocks
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
        }

        if (onChunk) onChunk(cleanText);
        
        try {
          const parsed = JSON.parse(cleanText);
          return { data: parsed };
        } catch (parseError) {
          console.error("JSON Parse Error. Raw:", cleanText);
          
          const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const secondAttempt = JSON.parse(jsonMatch[0]);
              return { data: secondAttempt };
            } catch (e) {
              console.error("Second parse attempt failed");
            }
          }
          
          throw new Error("Gagal memproses format data dari AI. Silakan coba lagi.");
        }
      } catch (error: any) {
        console.error(`Gemini Error with key ${apiKey.substring(0, 8)}... on model ${modelName}:`, error);
        lastError = error;

        const errMsg = (error.message || "").toLowerCase();
        const errString = JSON.stringify(error).toLowerCase();

        // 1. High demand / 503 / 500 / Overloaded / Temporary Server Spike -> Fallback to next model immediately!
        if (
          errMsg.includes("503") || 
          errMsg.includes("high demand") || 
          errMsg.includes("unavailable") || 
          errMsg.includes("overloaded") || 
          errMsg.includes("500") || 
          errMsg.includes("internal") ||
          errString.includes("503") ||
          errString.includes("unavailable")
        ) {
          console.warn(`Model ${modelName} is experiencing high demand (503). Retrying with next fallback model...`);
          continue; // Try next candidate model!
        }
        
        // 2. If model not found or deprecated, try next candidate model
        if (
          errMsg.includes("not found") || 
          errMsg.includes("no longer available") || 
          errMsg.includes("404") ||
          errString.includes("404")
        ) {
          console.warn(`Model ${modelName} not available, trying next fallback model...`);
          continue; // Try next candidate model!
        }

        // 3. Quota / Rate limit (429) -> Try next model first, if all fail will exhaust key
        if (
          errMsg.includes("429") || 
          errMsg.includes("quota") || 
          errMsg.includes("limit") ||
          errString.includes("429") ||
          errString.includes("resource_exhausted")
        ) {
          console.warn(`Model ${modelName} hit rate limit/quota, trying next model or key...`);
          // Continue to next model in case quota is model-specific, otherwise key will move on
          continue;
        }

        // 4. Invalid key / Auth failure -> Move to next API key
        if (
          errMsg.includes("api key not found") || 
          errMsg.includes("invalid api key") || 
          errMsg.includes("api_key_invalid") ||
          errMsg.includes("unauthenticated")
        ) {
          break; // break model loop, go to next key
        }

        // 5. For any other temporary error, try next candidate model first before failing
        console.warn(`Encountered error on model ${modelName}. Attempting next model...`);
        continue;
      }
    }

    // If all models failed for this key, mark key exhausted if it seemed quota related
    const lastMsg = (lastError?.message || "").toLowerCase();
    if (lastMsg.includes("429") || lastMsg.includes("quota") || lastMsg.includes("limit")) {
      if (onKeyExhausted) onKeyExhausted(apiKey);
    }
  }

  // Parse clear error message if all keys and models failed
  let finalErrorMessage = "Gagal memproses permintaan AI.";
  if (lastError) {
    if (lastError.message) {
      try {
        const parsedErr = typeof lastError.message === 'string' && lastError.message.startsWith('{') 
          ? JSON.parse(lastError.message) 
          : null;
        if (parsedErr?.error?.message) {
          finalErrorMessage = parsedErr.error.message;
        } else {
          finalErrorMessage = lastError.message;
        }
      } catch (e) {
        finalErrorMessage = lastError.message;
      }
    }
  }

  throw new Error(finalErrorMessage);
};
