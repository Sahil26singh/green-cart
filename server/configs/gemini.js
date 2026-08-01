import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const AI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

export default ai;
