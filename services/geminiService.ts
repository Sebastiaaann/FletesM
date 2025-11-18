import { GoogleGenAI, Type } from "@google/genai";
import { QuoteResult, Vehicle } from "../types";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

const SYSTEM_INSTRUCTION = `You are FleetMaster AI, a logistics operations expert. 
Your goal is to optimize fleet performance, reduce costs, and ensure safety.
Prioritize actionable insights based on data.`;

export const generateSmartQuote = async (description: string, distance: string): Promise<QuoteResult> => {
  try {
    const model = "gemini-2.5-flash";
    
    const prompt = `
      Analyze this freight request:
      Items/Description: ${description}
      Approximate Distance: ${distance}

      Provide a structured estimation.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedPrice: { type: Type.STRING, description: "Estimated price range in USD" },
            vehicleType: { type: Type.STRING, description: "Recommended vehicle type" },
            timeEstimate: { type: Type.STRING, description: "Estimated duration" },
            logisticsAdvice: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 bullet points of professional advice"
            },
            confidenceScore: { type: Type.NUMBER, description: "Confidence score 0-100" }
          },
          required: ["estimatedPrice", "vehicleType", "timeEstimate", "logisticsAdvice", "confidenceScore"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as QuoteResult;
    }
    throw new Error("No response text generated");

  } catch (error) {
    console.error("Gemini Quote Error:", error);
    return {
      estimatedPrice: "$0 - $0",
      vehicleType: "Error",
      timeEstimate: "N/A",
      logisticsAdvice: ["Service temporarily unavailable."],
      confidenceScore: 0
    };
  }
};

export const analyzeFleetHealth = async (vehicles: Vehicle[]): Promise<string> => {
  try {
    const vehicleSummary = vehicles.map(v => `${v.model} (${v.status}): ${v.mileage}km, Fuel: ${v.fuelLevel}%`).join('; ');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this fleet status snapshot: [${vehicleSummary}]. 
      Provide a 2-sentence executive summary on operational readiness and one specific maintenance recommendation.`,
      config: {
        systemInstruction: "You are a fleet manager assistant. Be concise and professional."
      }
    });
    return response.text || "Fleet analysis unavailable.";
  } catch (error) {
    return "AI Analysis systems offline.";
  }
};

export const analyzeRouteRisks = async (origin: string, destination: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the route from ${origin} to ${destination} for a heavy goods vehicle. 
      Identify potential risks such as weather conditions, traffic congestion patterns, or terrain challenges.
      Provide a concise 1-sentence risk assessment.`,
    });
    return response.text || "Route risk analysis unavailable.";
  } catch (error) {
    console.error("Route Analysis Error:", error);
    return "Route analysis temporarily unavailable.";
  }
};