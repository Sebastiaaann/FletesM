/**
 * Servicio para consultar información de vehículos chilenos por patente
 * Utiliza la API de @apis-chile (https://api.boostr.cl)
 */

// Tipos de respuesta de la API
interface VehicleApiSuccessResponse {
  status: 'success';
  data: {
    plate: string;
    dv: string; // Dígito verificador
    make: string; // Marca
    model: string; // Modelo
    year: number; // Año
    type: string; // Tipo de vehículo
    engine: string; // Motor
  };
}

interface VehicleApiErrorResponse {
  status: 'error';
  data: '';
  code: string; // V-01, V-02, etc.
  message: string;
}

type VehicleApiResponse = VehicleApiSuccessResponse | VehicleApiErrorResponse;

export interface VehicleInfo {
  plate: string;
  make: string;
  model: string;
  year: number;
  type: string;
  engine: string;
  dv: string;
}

// URLs de la API
// En desarrollo, usamos el proxy de Vite para evitar CORS
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment ? '/api/vehicle' : 'https://api.boostr.cl/vehicle';
const TEST_ENDPOINT = `${API_BASE_URL}/fake`; // Para testing sin API KEY
const PROD_ENDPOINT = `${API_BASE_URL}`; // Para producción con API KEY

// Configuración
const USE_TEST_API = true; // Cambiar a false cuando tengas API KEY de producción

/**
 * Valida formato de patente chilena
 * Formatos válidos:
 * - Nuevo: 4 letras + 2 números (ej: BCYT91, GFDD74)
 * - Antiguo: 2 letras + 4 números (ej: AB1234)
 */
export function validateChileanPlate(plate: string): boolean {
  if (!plate) return false;
  
  const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Formato nuevo: 4 letras + 2 números (LLLLNN)
  const newFormat = /^[A-Z]{4}[0-9]{2}$/;
  // Formato antiguo: 2 letras + 4 números (LLNNNN)
  const oldFormat = /^[A-Z]{2}[0-9]{4}$/;
  
  return newFormat.test(cleanPlate) || oldFormat.test(cleanPlate);
}

/**
 * Limpia y formatea una patente chilena
 */
export function formatChileanPlate(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Datos mock para desarrollo cuando la API no está disponible
 */
const MOCK_VEHICLES: Record<string, VehicleInfo> = {
  'GFDD74': {
    plate: 'GFDD74',
    make: 'SUBARU',
    model: 'NEW WRX S AWD CVT 2.0T',
    year: 2019,
    type: 'AUTOMOVIL',
    engine: 'M983322',
    dv: '6',
  },
  'JG5165': {
    plate: 'JG5165',
    make: 'CHEVROLET',
    model: 'SILVERADO 2500HD 4X4',
    year: 2018,
    type: 'CAMIONETA',
    engine: 'V8 6.0L',
    dv: '5',
  },
  'KFBJ3P': {
    plate: 'KFBJ3P',
    make: 'MERCEDES-BENZ',
    model: 'ACTROS 2546 6X2',
    year: 2020,
    type: 'CAMION',
    engine: 'OM471 12.8L',
    dv: 'P',
  },
  'BCYT91': {
    plate: 'BCYT91',
    make: 'VOLVO',
    model: 'FH16 750 6X4',
    year: 2021,
    type: 'CAMION',
    engine: 'D16K 16.1L',
    dv: '1',
  },
  'AA0129': {
    plate: 'AA0129',
    make: 'ISUZU',
    model: 'NQR 75L',
    year: 2019,
    type: 'CAMION',
    engine: '4HK1 5.2L',
    dv: '9',
  },
};

/**
 * Consulta información de un vehículo por patente
 */
export async function getVehicleInfo(plate: string): Promise<VehicleInfo> {
  // Validar formato
  if (!validateChileanPlate(plate)) {
    throw new Error('Formato de patente inválido. Formato válido: LLLLNN o LLNNNN');
  }

  const cleanPlate = formatChileanPlate(plate);
  
  // Intentar obtener desde mock primero (útil cuando la API no está disponible)
  if (MOCK_VEHICLES[cleanPlate]) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_VEHICLES[cleanPlate];
  }

  const endpoint = USE_TEST_API ? TEST_ENDPOINT : PROD_ENDPOINT;
  const url = `${endpoint}/${cleanPlate}.json`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'FleetTech/1.0',
      },
    });

    // Si la API no está disponible (503, 403), usar mock como fallback
    if (response.status === 503 || response.status === 403) {
      throw new Error('API_UNAVAILABLE');
    }

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data: VehicleApiResponse = await response.json();

    // Verificar si hay error en la respuesta
    if (data.status === 'error') {
      switch (data.code) {
        case 'V-01':
          throw new Error('Falta indicar patente');
        case 'V-02':
          throw new Error('No se encontraron datos para esta patente');
        default:
          throw new Error(data.message || 'Error al consultar la patente');
      }
    }

    // Retornar datos del vehículo
    return {
      plate: data.data.plate,
      make: data.data.make,
      model: data.data.model,
      year: data.data.year,
      type: data.data.type,
      engine: data.data.engine,
      dv: data.data.dv,
    };
  } catch (error) {
    // Si la API no está disponible, sugerir usar patentes mock
    if (error instanceof Error && error.message === 'API_UNAVAILABLE') {
      const availablePlates = Object.keys(MOCK_VEHICLES).join(', ');
      throw new Error(`API no disponible. Usa estas patentes de prueba: ${availablePlates}`);
    }
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al consultar información del vehículo');
  }
}

/**
 * Patentes de prueba disponibles (con datos mock mientras la API no esté accesible)
 */
export const TEST_PLATES = Object.keys(MOCK_VEHICLES);
