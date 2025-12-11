
import { GoogleGenAI, Type } from "@google/genai";
import { QuoteResult, Vehicle, MaintenancePrediction, FinancialReport } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

// Instructions updated to Spanish
const SYSTEM_INSTRUCTION = `Eres FleetTech AI, un experto en operaciones logísticas. 
Tu objetivo es optimizar el rendimiento de la flota, reducir costos y garantizar la seguridad.
Prioriza insights accionables basados en datos. Responde SIEMPRE en español.`;

// 🔒 RATE LIMITING & CACHE
// Previene abuso de API y reduce costos
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const requestQueue: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 10;

const checkRateLimit = (): boolean => {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  // Limpiar requests antiguos
  while (requestQueue.length > 0 && requestQueue[0] < oneMinuteAgo) {
    requestQueue.shift();
  }
  
  if (requestQueue.length >= MAX_REQUESTS_PER_MINUTE) {
    console.warn('🚨 Gemini API rate limit alcanzado. Espera 1 minuto.');
    return false;
  }
  
  requestQueue.push(now);
  return true;
};

const getCachedResponse = (key: string): any | null => {
  const cached = responseCache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) {
    responseCache.delete(key);
    return null;
  }
  
  return cached.data;
};

const setCachedResponse = (key: string, data: any): void => {
  responseCache.set(key, { data, timestamp: Date.now() });
};

export const generateSmartQuote = async (description: string, distance: string): Promise<QuoteResult> => {
  // 🔒 Verificar cache primero
  const cacheKey = `quote-${description}-${distance}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    console.log('✅ Respuesta desde cache');
    return cached;
  }
  
  // 🔒 Verificar rate limit
  if (!checkRateLimit()) {
    return {
      estimatedPrice: "$0 - $0",
      vehicleType: "Rate limit excedido",
      timeEstimate: "N/A",
      logisticsAdvice: ["Demasiadas solicitudes. Intenta en 1 minuto."],
      confidenceScore: 0
    };
  }
  
  try {
    const model = "gemini-2.5-flash";
    
    const prompt = `
      Analiza esta solicitud de carga:
      Items/Descripción: ${description}
      Distancia Aproximada: ${distance}

      Proporciona una estimación estructurada en español.
      Para el precio, usa formato CLP (Pesos Chilenos) o USD si es internacional.
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
            estimatedPrice: { type: Type.STRING, description: "Rango de precio estimado (ej: $150.000 - $200.000 CLP)" },
            vehicleType: { type: Type.STRING, description: "Tipo de vehículo recomendado en español" },
            timeEstimate: { type: Type.STRING, description: "Duración estimada en español" },
            logisticsAdvice: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 puntos de consejo profesional en español para optimizar esta ruta"
            },
            confidenceScore: { type: Type.NUMBER, description: "Puntaje de confianza 0-100" }
          },
          required: ["estimatedPrice", "vehicleType", "timeEstimate", "logisticsAdvice", "confidenceScore"]
        }
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text) as QuoteResult;
      // 🔒 Guardar en cache
      setCachedResponse(cacheKey, result);
      return result;
    }
    throw new Error("No response text generated");

  } catch (error) {
    console.error("Gemini Quote Error:", error);
    return {
      estimatedPrice: "$0 - $0",
      vehicleType: "Error",
      timeEstimate: "N/A",
      logisticsAdvice: ["Servicio temporalmente no disponible."],
      confidenceScore: 0
    };
  }
};

export const analyzeFleetHealth = async (vehicles: Vehicle[]): Promise<string> => {
  try {
    const vehicleSummary = vehicles.map(v => `${v.model} (${v.status}): ${v.mileage}km, Combustible: ${v.fuelLevel}%`).join('; ');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analiza esta instantánea del estado de la flota: [${vehicleSummary}]. 
      Proporciona un resumen ejecutivo de 2 oraciones en español sobre la preparación operativa y una recomendación de mantenimiento específica.`,
      config: {
        systemInstruction: "Eres un asistente de gerente de flota. Sé conciso, profesional y responde en español."
      }
    });
    return response.text || "Análisis de flota no disponible.";
  } catch (error) {
    return "Sistemas de análisis AI fuera de línea.";
  }
};

export const analyzeRouteRisks = async (origin: string, destination: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analiza la ruta desde ${origin} hasta ${destination} para un vehículo de carga pesada en el sur de Chile. 
      Identifica riesgos potenciales como condiciones climáticas, patrones de tráfico o desafíos del terreno.
      Proporciona una evaluación de riesgo concisa de 1 oración en español.`,
    });
    return response.text || "Análisis de riesgo de ruta no disponible.";
  } catch (error) {
    console.error("Route Analysis Error:", error);
    return "Análisis de ruta temporalmente no disponible.";
  }
};

// NEW: Predictive Maintenance Logic
export const predictMaintenance = async (vehicle: Vehicle): Promise<MaintenancePrediction> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Realiza un diagnóstico predictivo para un ${vehicle.model} con ${vehicle.mileage}km. Último servicio fue hace 6 meses.
      Basado en patrones de desgaste estándar para este kilometraje, ¿qué es probable que falle pronto?`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.NUMBER, description: "Salud general del vehículo 0-100" },
            predictedFailure: { type: Type.STRING, description: "Componente con mayor riesgo de falla (ej: Frenos, Transmisión)" },
            urgency: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
            recommendedAction: { type: Type.STRING, description: "Acción recomendada breve" },
            estimatedCost: { type: Type.STRING, description: "Costo estimado en CLP" }
          },
          required: ["healthScore", "predictedFailure", "urgency", "recommendedAction", "estimatedCost"]
        }
      }
    });
    return JSON.parse(response.text!) as MaintenancePrediction;
  } catch (error) {
    console.error(error);
    return {
      healthScore: 50,
      predictedFailure: "Error en análisis",
      urgency: "Medium",
      recommendedAction: "Revisión manual requerida",
      estimatedCost: "$0 CLP"
    };
  }
};

// NEW: Financial Analysis Logic
export const analyzeFinancials = async (routesData: any[]): Promise<FinancialReport> => {
  try {
    const dataStr = JSON.stringify(routesData);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analiza estos datos financieros de rutas recientes: ${dataStr}. Identifica qué conductor y ruta generaron mejor margen.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                topDriver: { type: Type.STRING, description: "Nombre del conductor más rentable" },
                mostProfitableRoute: { type: Type.STRING, description: "Ruta con mejor margen" },
                costSavingOpportunity: { type: Type.STRING, description: "Dónde se puede ahorrar dinero" },
                efficiencyTrend: { type: Type.STRING, description: "Tendencia general (Positiva/Negativa)" },
                netProfitMargin: { type: Type.STRING, description: "Margen promedio %" }
            }
        }
      }
    });
    return JSON.parse(response.text!) as FinancialReport;
  } catch (error) {
     return {
         topDriver: "N/A",
         mostProfitableRoute: "N/A",
         costSavingOpportunity: "Datos insuficientes",
         efficiencyTrend: "Estable",
         netProfitMargin: "0%"
     };
  }
};
