import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ReplyRequest {
  message: string;
  sender: 'Boss' | 'Colleague' | 'Junior';
  tone: 'Positive' | 'Negative' | 'Neutral';
  inputLanguage: 'English' | 'Bangla' | 'Banglish' | 'Auto-detect';
  mode: 'reply' | 'say';
}

export interface ReplyResponse {
  english: string;
  bangla: string;
}

export async function generateCorporateReply(req: ReplyRequest): Promise<ReplyResponse> {
  const isReply = req.mode === 'reply';
  
  const systemInstruction = `You are a professional corporate communication assistant.
Your task is to ${isReply ? 'generate a short, professional reply based on the message received' : 'rewrite the user\'s intent into a polished, professional corporate message'}.

Instructions:
1. The input message might be in ${req.inputLanguage}. If "Auto-detect" is selected, identify the language first.
2. Keep the output short (1–3 lines maximum).
3. Always maintain a professional tone.
4. No slang or casual language.
5. Adjust respect level based on hierarchy (who the recipient is):
   - If Boss → More respectful and formal.
   - If Colleague → Professional and cooperative.
   - If Junior → Supportive and guiding.
6. If tone is Negative, remain polite, constructive, and solution-focused.
7. If tone is Positive, show willingness and cooperation.
8. If tone is Neutral, keep it simple and professional.
9. Do not add extra explanation.
10. Provide both an English version and a Bangla translation.

${!isReply ? '11. Correct all grammar and arrange the thoughts into a clear, professional statement.' : ''}

Output MUST be in JSON format with keys "english" and "bangla".`;

  const prompt = `${isReply ? 'Received Message' : 'User Intent'}: "${req.message}"
Target Recipient: ${req.sender}
Desired Tone: ${req.tone}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          english: { type: Type.STRING },
          bangla: { type: Type.STRING },
        },
        required: ["english", "bangla"],
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}') as ReplyResponse;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to generate a valid reply.");
  }
}
