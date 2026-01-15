import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedTask } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTaskBreakdown = async (userGoal: string): Promise<GeneratedTask[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Break down the following goal into 3-5 actionable sub-tasks for a todo list. 
      Goal: "${userGoal}". 
      Assign a relevant emoji and a priority level (high, medium, low) based on urgency/impact.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "The action title" },
              emoji: { type: Type.STRING, description: "A single relevant emoji char" },
              priority: { type: Type.STRING, enum: ["high", "medium", "low"] }
            },
            required: ["title", "emoji", "priority"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedTask[];
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate tasks. Please try again.");
  }
};
