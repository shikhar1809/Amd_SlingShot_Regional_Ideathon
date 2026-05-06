import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface MealAnalysis {
  meal_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  health_score: number;
  tip: string;
}

const mealAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    meal_name: { type: Type.STRING },
    calories: { type: Type.NUMBER },
    protein_g: { type: Type.NUMBER },
    carbs_g: { type: Type.NUMBER },
    fat_g: { type: Type.NUMBER },
    health_score: { type: Type.NUMBER },
    tip: { type: Type.STRING },
  },
  required: ["meal_name", "calories", "protein_g", "carbs_g", "fat_g", "health_score", "tip"],
};

export async function analyzeMealImage(base64Image: string, mimeType: string, goal: string, diet: string): Promise<MealAnalysis> {
  const prompt = `Identify and analyze the food in this image. 
  The user's goal is: ${goal}. Dietary preference: ${diet}.
  Provide nutritional estimate and one personalized tip.`;

  const imagePart = {
    inlineData: {
      mimeType: mimeType || "image/jpeg",
      data: base64Image,
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: mealAnalysisSchema,
      systemInstruction: "You are NutriMind, a personal nutrition assistant. Be concise, practical, and encouraging. No medical claims.",
    },
  });

  return JSON.parse(response.text) as MealAnalysis;
}

export async function chatWithGemini(messages: { role: 'user' | 'model', text: string }[], userContext: string) {
  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: `You are NutriMind, a personal nutrition assistant. User context: ${userContext}. Answer food/health questions concisely. No medical claims. Show you are secured and private.`,
    },
    history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
  });

  const lastMessage = messages[messages.length - 1].text;
  const result = await chat.sendMessage({ message: lastMessage });
  return result.text;
}

export async function generateDailyTip(mealHistory: string, goal: string) {
  const prompt = `Based on these meals: ${mealHistory} and the goal: ${goal}, give one short, catchy daily nutrition tip.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are NutriMind. Keep it under 20 words.",
    },
  });
  return response.text;
}

export async function analyzeMealText(text: string, goal: string, diet: string): Promise<MealAnalysis> {
  const prompt = `Analyze this meal: "${text}". 
  The user's goal is: ${goal}. Dietary preference: ${diet}.
  Provide nutritional estimate and one personalized tip.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: mealAnalysisSchema,
      systemInstruction: "You are NutriMind, a personal nutrition assistant. Be concise, practical, and encouraging. No medical claims.",
    },
  });

  return JSON.parse(response.text) as MealAnalysis;
}
