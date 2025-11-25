import { supabase } from './supabaseClient';
import { Vehicle, Driver } from '../types';

// Tipos para las tablas de Supabase
interface RouteDB {
  id: string;
  origin: string;
  destination: string;
  distance: string;
  estimated_price: string;
  vehicle_type: string;
  driver?: string;
  vehicle?: string;
  timestamp: number;
  status: 'Pending' | 'In Progress' | 'Completed';
}

interface VehicleDB {
  id: string;
  plate: string;
  model: string;
  status: 'Active' | 'Maintenance' | 'Idle';
  mileage: number;
  fuel_level: number;
  next_service: string;
  location_lat?: number;
  location_lng?: number;
}

interface DriverDB {
  id: string;
  name: string;
  rut: string;
  license_type: string;
  license_expiry: string;
  status: 'Available' | 'On Route' | 'Off Duty';
}

// ============================================
// VEHICLES - CRUD Operations
// ============================================

export const vehicleService = {
  // Obtener todos los vehículos
  async getAll() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transformar de snake_case (DB) a camelCase (App)
    return data?.map(v => ({
      id: v.id,
      plate: v.plate,
      model: v.model,
      status: v.status,
      mileage: v.mileage,
      fuelLevel: v.fuel_level,
      nextService: v.next_service,
      city: v.city,
      location: v.location_lat && v.location_lng ? {
        lat: v.location_lat,
        lng: v.location_lng
      } : undefined
    })) || [];
  },

  // Crear nuevo vehículo
  async create(vehicle: any) {
    // Transformar de camelCase (App) a snake_case (DB)
    const dbVehicle = {
      id: vehicle.id,
      plate: vehicle.plate,
      model: vehicle.model,
      status: vehicle.status,
      mileage: vehicle.mileage,
      fuel_level: vehicle.fuelLevel,
      next_service: vehicle.nextService,
      city: vehicle.city,
      location_lat: vehicle.location?.lat,
      location_lng: vehicle.location?.lng
    };

    const { data, error } = await supabase
      .from('vehicles')
      .insert([dbVehicle])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar vehículo
  async update(id: string, updates: any) {
    // Transformar campos a snake_case
    const dbUpdates: any = {};
    if (updates.plate) dbUpdates.plate = updates.plate;
    if (updates.model) dbUpdates.model = updates.model;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.mileage !== undefined) dbUpdates.mileage = updates.mileage;
    if (updates.fuelLevel !== undefined) dbUpdates.fuel_level = updates.fuelLevel;
    if (updates.nextService) dbUpdates.next_service = updates.nextService;
    if (updates.city) dbUpdates.city = updates.city;
    if (updates.location?.lat !== undefined) dbUpdates.location_lat = updates.location.lat;
    if (updates.location?.lng !== undefined) dbUpdates.location_lng = updates.location.lng;

    const { data, error } = await supabase
      .from('vehicles')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Eliminar vehículo
  async delete(id: string) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Obtener vehículos por estado
  async getByStatus(status: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', status)
      .is('deleted_at', null);
    
    if (error) throw error;
    return data;
  },
};

// ============================================
// DRIVERS - CRUD Operations
// ============================================

export const driverService = {
  async getAll() {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Transformar de snake_case (DB) a camelCase (App)
    return data?.map(d => ({
      id: d.id,
      name: d.name,
      rut: d.rut,
      licenseType: d.license_type,
      licenseExpiry: d.license_expiry,
      status: d.status
    })) || [];
  },

  async create(driver: any) {
    // Transformar de camelCase (App) a snake_case (DB)
    const dbDriver = {
      id: driver.id,
      name: driver.name,
      rut: driver.rut,
      license_type: driver.licenseType,
      license_expiry: driver.licenseExpiry,
      status: driver.status
    };

    const { data, error } = await supabase
      .from('drivers')
      .insert([dbDriver])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    // Transformar campos a snake_case
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.rut) dbUpdates.rut = updates.rut;
    if (updates.licenseType) dbUpdates.license_type = updates.licenseType;
    if (updates.licenseExpiry) dbUpdates.license_expiry = updates.licenseExpiry;
    if (updates.status) dbUpdates.status = updates.status;

    const { data, error } = await supabase
      .from('drivers')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Obtener conductores disponibles
  async getAvailable() {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('status', 'Available')
      .is('deleted_at', null);
    
    if (error) throw error;
    return data;
  },
};

// ============================================
// ROUTES - Removed old service (duplicated below)
// ============================================

// ============================================
// GPS TRACKING - Real-time Operations
// ============================================

export const gpsService = {
  // Agregar nueva ubicación GPS
  async addLocation(location: {
    route_id: string;
    vehicle_id: string;
    latitude: number;
    longitude: number;
    speed: number;
    engine_on: boolean;
  }) {
    const { data, error } = await supabase
      .from('gps_tracking')
      .insert([{ ...location, timestamp: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener historial de ubicaciones
  async getRouteHistory(routeId: string) {
    const { data, error } = await supabase
      .from('gps_tracking')
      .select('*')
      .eq('route_id', routeId)
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Suscribirse a actualizaciones en tiempo real
  subscribeToRoute(routeId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`route-${routeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gps_tracking',
          filter: `route_id=eq.${routeId}`,
        },
        callback
      )
      .subscribe();
  },
};

// ============================================
// MAINTENANCE - Operations
// ============================================

export const maintenanceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('maintenance')
      .select('*, vehicle:vehicles(*)')
      .is('deleted_at', null)
      .order('scheduled_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getByVehicle(vehicleId: string) {
    const { data, error } = await supabase
      .from('maintenance')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .is('deleted_at', null)
      .order('scheduled_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(maintenance: any) {
    const { data, error } = await supabase
      .from('maintenance')
      .insert([maintenance])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('maintenance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener mantenimientos próximos
  async getUpcoming(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('maintenance')
      .select('*, vehicle:vehicles(*)')
      .gte('scheduled_date', new Date().toISOString())
      .lte('scheduled_date', futureDate.toISOString())
      .is('deleted_at', null);
    
    if (error) throw error;
    return data;
  },
};

// ============================================
// COMPLIANCE/DOCUMENTS - Operations
// ============================================

export const complianceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('compliance_documents')
      .select('*')
      .is('deleted_at', null)
      .order('expiry_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getExpiringSoon(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('compliance_documents')
      .select('*')
      .lte('expiry_date', futureDate.toISOString())
      .gte('expiry_date', new Date().toISOString())
      .is('deleted_at', null);
    
    if (error) throw error;
    return data;
  },

  async create(document: any) {
    const { data, error } = await supabase
      .from('compliance_documents')
      .insert([document])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// ============================================
// ANALYTICS - Dashboard Metrics
// ============================================

// ============================================
// ROUTES - CRUD Operations
// ============================================

export const routeService = {
  // Obtener todas las rutas
  async getAll() {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    // Transformar de snake_case (DB) a camelCase (App)
    return data?.map(route => ({
      id: route.id,
      origin: route.origin,
      destination: route.destination,
      distance: route.distance,
      estimatedPrice: route.estimated_price,
      vehicleType: route.vehicle_type,
      driver: route.driver,
      vehicle: route.vehicle,
      timestamp: route.timestamp,
      status: route.status,
      deliveryProof: route.delivery_proof
    })) || [];
  },

  // Obtener rutas por conductor
  async getByDriver(driverName: string) {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('driver', driverName)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(route => ({
      id: route.id,
      origin: route.origin,
      destination: route.destination,
      distance: route.distance,
      estimatedPrice: route.estimated_price,
      vehicleType: route.vehicle_type,
      driver: route.driver,
      vehicle: route.vehicle,
      timestamp: route.timestamp,
      status: route.status,
      deliveryProof: route.delivery_proof
    })) || [];
  },

  // Crear nueva ruta
  async create(route: {
    id: string;
    origin: string;
    destination: string;
    distance: string;
    estimatedPrice: string;
    vehicleType: string;
    driver?: string;
    vehicle?: string;
    timestamp: number;
    status: 'Pending' | 'In Progress' | 'Completed';
    deliveryProof?: any;
  }) {
    // Transformar de camelCase (App) a snake_case (DB)
    const dbRoute = {
      id: route.id,
      origin: route.origin,
      destination: route.destination,
      distance: route.distance,
      estimated_price: route.estimatedPrice,
      vehicle_type: route.vehicleType,
      driver: route.driver,
      vehicle: route.vehicle,
      timestamp: route.timestamp,
      status: route.status,
      delivery_proof: route.deliveryProof
    };

    const { data, error } = await supabase
      .from('routes')
      .insert([dbRoute])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar estado de ruta
  async updateStatus(id: string, status: 'Pending' | 'In Progress' | 'Completed') {
    const { data, error } = await supabase
      .from('routes')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar comprobante de entrega
  async updateProof(id: string, deliveryProof: any) {
    const { data, error } = await supabase
      .from('routes')
      .update({ 
        delivery_proof: deliveryProof,
        status: 'Completed'
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Eliminar ruta
  async delete(id: string) {
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

export const analyticsService = {
  // Obtener métricas del dashboard
  async getDashboardMetrics() {
    const { data, error } = await supabase.rpc('get_dashboard_metrics');
    
    if (error) throw error;
    return data;
  },

  // Rentabilidad por conductor
  async getDriverProfitability(startDate?: string, endDate?: string) {
    const { data, error } = await supabase.rpc('get_driver_profitability', {
      start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: endDate || new Date().toISOString(),
    });
    
    if (error) throw error;
    return data;
  },

  // Rutas más rentables
  async getMostProfitableRoutes(limit: number = 10) {
    const { data, error } = await supabase.rpc('get_most_profitable_routes', {
      route_limit: limit,
    });
    
    if (error) throw error;
    return data;
  },
};

// Exportar todos los servicios
export default {
  vehicles: vehicleService,
  drivers: driverService,
  routes: routeService,
  gps: gpsService,
  maintenance: maintenanceService,
  compliance: complianceService,
  analytics: analyticsService,
};
