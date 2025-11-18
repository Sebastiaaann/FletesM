export interface QuoteResult {
  estimatedPrice: string;
  vehicleType: string;
  timeEstimate: string;
  logisticsAdvice: string[];
  confidenceScore: number;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  status: 'Active' | 'Maintenance' | 'Idle';
  mileage: number;
  fuelLevel: number;
  nextService: string; // Date string
}

export interface Driver {
  id: string;
  name: string;
  rut: string; // Chilean ID
  licenseType: string;
  licenseExpiry: string;
  status: 'Available' | 'On Route' | 'Off Duty';
}

export enum AppView {
  HOME = 'HOME',
  DASHBOARD = 'DASHBOARD',
  FLEET = 'FLEET',
  ROUTES = 'ROUTES',
  FINANCIALS = 'FINANCIALS'
}
