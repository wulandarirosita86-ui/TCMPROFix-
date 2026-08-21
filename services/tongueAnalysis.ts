import { GoogleGenAI } from "@google/genai";
import { ApiKeyEntry } from '../types';
import { getResolvedGeminiKeys, CANDIDATE_MODELS } from './geminiService';

export async function analyzeTongueImage(
  base64Image: string, 
  apiKeys?: ApiKeyEntry[],
  onKeyExhausted?: (key: string) => void
): Promise<{ text: string }> {
  const allResolved = getResolvedGeminiKeys(apiKeys);
  
  if (allResolved.length === 0) {
    throw new Error("Tidak ada API Key Gemini yang ditemukan. Silakan tambahkan API Key di menu Settings / Master Control untuk memulai analisis lidah.");
  }

  let availableKeys = allResolved.filter(k => !k.isExhausted && k.key.trim() !== "");
  if (availableKeys.length === 0) {
    availableKeys = allResolved.map(k => ({ ...k, isExhausted: false }));
  }

  const [mimeTypePrefix, base64Data] = base64Image.split(';base64,');
  const mimeType = mimeTypePrefix ? mimeTypePrefix.split(':')[1] : "image/jpeg";

  const prompt = `
  Kamu adalah ahli diagnosis lidah TCM (Traditional Chinese Medicine) tingkat profesor.
  Analisis foto lidah ini dengan sangat detail dan akurat.
  Jawab dalam Bahasa Indonesia, format:

  1. Warna badan lidah: ...
  2. Warna lapisan/sabur: ...
  3. Kualitas sabur: ...
  4. Fitur khusus: (crack, teeth marks, red points, deviated, swollen, thin, dll)
  5. Kesimpulan pola utama: (contoh: Kidney Yin Deficiency with Empty Heat, Spleen Qi Deficiency with Dampness, Liver Fire, dll)
  6. Rekomendasi titik akupuntur tambahan (3-5 titik): ...

  Hanya jawab berdasarkan foto lidah ini, jangan tambah-tambah.
  `;

  let lastError: any = null;
  const maxKeyRetries = Math.min(availableKeys.length, 5);

  for (let kIdx = 0; kIdx < maxKeyRetries; kIdx++) {
    const apiKey = availableKeys[kIdx].key;
    
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          },
          config: {
            maxOutputTokens: 1024,
            temperature: 0.1,
          }
        });

        return {
          text: response.text || "Maaf, tidak dapat menganalisis gambar ini."
        };
      } catch (error: any) {
        console.error(`Tongue Analysis Error with key ${apiKey.substring(0, 8)}... on model ${modelName}:`, error);
        lastError = error;
        const errMsg = (error.message || "").toLowerCase();
        const errString = JSON.stringify(error).toLowerCase();
        
        // 1. High demand / 503 / 500 / Overloaded -> Try next model
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
          console.warn(`Model ${modelName} unavailable/high demand, trying fallback...`);
          continue;
        }

        // 2. Not found / 404
        if (errMsg.includes("not found") || errMsg.includes("no longer available") || errMsg.includes("404")) {
          continue;
        }

        // 3. Quota / Rate limit (429)
        if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("403") || errMsg.includes("limit")) {
          continue;
        } 
        
        // 4. Invalid key
        if (errMsg.includes("api key not found") || errMsg.includes("invalid api key") || errMsg.includes("api_key_invalid")) {
          break; // Try next key
        }

        // 5. Fallback to next model
        continue;
      }
    }

    const lastMsg = (lastError?.message || "").toLowerCase();
    if (lastMsg.includes("429") || lastMsg.includes("quota") || lastMsg.includes("limit")) {
      if (onKeyExhausted) onKeyExhausted(apiKey);
    }
  }

  let finalErrorMessage = "Gagal melakukan analisis lidah.";
  if (lastError?.message) {
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

  throw new Error(finalErrorMessage);
}
