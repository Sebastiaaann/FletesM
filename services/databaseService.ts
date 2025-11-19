import { supabase } from './supabaseClient';
import { Vehicle, Driver } from '../types';

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
    return data;
  },

  // Obtener vehículo por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Crear nuevo vehículo
  async create(vehicle: Omit<Vehicle, 'id'>) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicle])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar vehículo
  async update(id: string, updates: Partial<Vehicle>) {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Eliminar vehículo (soft delete)
  async delete(id: string) {
    const { error } = await supabase
      .from('vehicles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
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
      .is('deleted_at', null)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(driver: Omit<Driver, 'id'>) {
    const { data, error } = await supabase
      .from('drivers')
      .insert([driver])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Driver>) {
    const { data, error } = await supabase
      .from('drivers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('drivers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
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
// ROUTES - CRUD Operations
// ============================================

export const routeService = {
  async getAll() {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        driver:drivers(*),
        vehicle:vehicles(*),
        cargo:cargo(*),
        costs:route_costs(*),
        revenue:route_revenue(*)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        driver:drivers(*),
        vehicle:vehicles(*),
        cargo:cargo(*),
        costs:route_costs(*),
        revenue:route_revenue(*),
        gps_tracking:gps_tracking(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(route: any) {
    const { data, error } = await supabase
      .from('routes')
      .insert([route])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('routes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('routes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Obtener rutas activas
  async getActive() {
    const { data, error } = await supabase
      .from('routes')
      .select('*, driver:drivers(*), vehicle:vehicles(*)')
      .in('status', ['planned', 'in_progress'])
      .is('deleted_at', null);
    
    if (error) throw error;
    return data;
  },

  // Calcular rentabilidad de una ruta
  async calculateProfitability(routeId: string) {
    const { data, error } = await supabase
      .rpc('calculate_route_profitability', { route_id: routeId });
    
    if (error) throw error;
    return data;
  },
};

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
