import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppView } from '../types';
import { routeService } from '../services/databaseService';

interface DeliveryProof {
    signature: string; // Base64 image
    clientName?: string;
    clientId?: string;
    deliveredAt: number; // Timestamp
    notes?: string;
}

interface RegisteredRoute {
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
    deliveryProof?: DeliveryProof; // Comprobante de entrega
}

interface PendingRouteData {
    origin: string;
    destination: string;
    distance: string;
    cargoDescription: string;
    estimatedPrice: string;
    vehicleType: string;
}

interface AppState {
    currentView: AppView;
    isLoading: boolean;
    registeredRoutes: RegisteredRoute[];
    pendingRouteData: PendingRouteData | null;
    setView: (view: AppView) => void;
    setLoading: (loading: boolean) => void;
    loadRoutes: () => Promise<void>;
    addRoute: (route: RegisteredRoute) => Promise<void>;
    removeRoute: (routeId: string) => Promise<void>;
    updateRouteStatus: (routeId: string, status: 'Pending' | 'In Progress' | 'Completed') => Promise<void>;
    updateRouteWithProof: (routeId: string, deliveryProof: DeliveryProof) => Promise<void>;
    setPendingRouteData: (data: PendingRouteData | null) => void;
    clearPendingRouteData: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            currentView: AppView.HOME,
            isLoading: false,
            registeredRoutes: [],
            pendingRouteData: null,
            
            setView: (view) => set({ currentView: view }),
            setLoading: (loading) => set({ isLoading: loading }),
            
            // Cargar rutas desde Supabase
            loadRoutes: async () => {
                try {
                    const routes = await routeService.getAll();
                    set({ registeredRoutes: routes });
                } catch (error) {
                    console.error('Error loading routes:', error);
                    // En caso de error, mantener las rutas en localStorage
                }
            },
            
            // Agregar ruta (Supabase + Estado local)
            addRoute: async (route) => {
                try {
                    await routeService.create(route);
                    set((state) => ({ 
                        registeredRoutes: [...state.registeredRoutes, route] 
                    }));
                } catch (error) {
                    console.error('Error adding route:', error);
                    // Fallback: agregar solo al estado local
                    set((state) => ({ 
                        registeredRoutes: [...state.registeredRoutes, route] 
                    }));
                }
            },
            
            // Eliminar ruta (Supabase + Estado local)
            removeRoute: async (routeId) => {
                try {
                    await routeService.delete(routeId);
                    set((state) => ({ 
                        registeredRoutes: state.registeredRoutes.filter(route => route.id !== routeId) 
                    }));
                } catch (error) {
                    console.error('Error removing route:', error);
                    // Fallback: eliminar solo del estado local
                    set((state) => ({ 
                        registeredRoutes: state.registeredRoutes.filter(route => route.id !== routeId) 
                    }));
                }
            },
            
            // Actualizar estado de ruta (Supabase + Estado local)
            updateRouteStatus: async (routeId, status) => {
                try {
                    await routeService.updateStatus(routeId, status);
                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.map(route =>
                            route.id === routeId ? { ...route, status } : route
                        )
                    }));
                } catch (error) {
                    console.error('Error updating route status:', error);
                    // Fallback: actualizar solo el estado local
                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.map(route =>
                            route.id === routeId ? { ...route, status } : route
                        )
                    }));
                }
            },

            // Actualizar ruta con comprobante de entrega
            updateRouteWithProof: async (routeId, deliveryProof) => {
                try {
                    // Actualizar en Supabase
                    await routeService.updateProof(routeId, deliveryProof);
                    
                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.map(route =>
                            route.id === routeId 
                                ? { ...route, deliveryProof, status: 'Completed' as const } 
                                : route
                        )
                    }));
                } catch (error) {
                    console.error('Error updating route with proof:', error);
                    // Fallback: actualizar solo el estado local
                    set((state) => ({
                        registeredRoutes: state.registeredRoutes.map(route =>
                            route.id === routeId 
                                ? { ...route, deliveryProof, status: 'Completed' as const } 
                                : route
                        )
                    }));
                }
            },
            
            setPendingRouteData: (data) => set({ pendingRouteData: data }),
            clearPendingRouteData: () => set({ pendingRouteData: null }),
        }),
        {
            name: 'fleettech-storage',
            partialize: (state) => ({
                currentView: state.currentView,
                registeredRoutes: state.registeredRoutes
            }),
        }
    )
);
