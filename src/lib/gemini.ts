import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  return client;
};
