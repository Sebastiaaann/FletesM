import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppView } from '../types';

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
    addRoute: (route: RegisteredRoute) => void;
    removeRoute: (routeId: string) => void;
    updateRouteStatus: (routeId: string, status: 'Pending' | 'In Progress' | 'Completed') => void;
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
            addRoute: (route) => set((state) => ({ registeredRoutes: [...state.registeredRoutes, route] })),
            removeRoute: (routeId) => set((state) => ({ 
                registeredRoutes: state.registeredRoutes.filter(route => route.id !== routeId) 
            })),
            updateRouteStatus: (routeId, status) => set((state) => ({
                registeredRoutes: state.registeredRoutes.map(route =>
                    route.id === routeId ? { ...route, status } : route
                )
            })),
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
