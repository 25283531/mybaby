
import { GoogleGenAI, Type } from "@google/genai";

export async function getParentingAdvice(device: any, platforms: any[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-flash-preview';
  
  const prompt = `
    The user is managing a device named "${device.name}" with MAC ${device.mac}.
    Current Control Mode: ${device.mode}.
    Current Usage Today: ${device.timeUsedToday} minutes.
    Monitored Platforms: ${platforms.filter(p => p.enabled).map(p => p.name).join(', ')}.
    
    The child using this device is likely watching short videos or playing games. 
    Please provide 3-4 professional and empathetic parenting tips for setting healthy boundaries.
    Also, suggest a specific time quota or schedule window if the current one seems too loose or too strict.
    Keep the tone encouraging and helpful.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Advisor is currently unavailable. Please try again later.";
  }
}

export async function generateSchedule(age: number, goals: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest a daily internet usage schedule for a ${age}-year-old child. Goals: ${goals}. Return a structured JSON list of time windows.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            start: { type: Type.STRING },
            end: { type: Type.STRING },
            activity: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["start", "end", "activity"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}
