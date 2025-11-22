import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppView } from '../types';

interface AppState {
    currentView: AppView;
    isLoading: boolean;
    setView: (view: AppView) => void;
    setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            currentView: AppView.HOME,
            isLoading: false,
            setView: (view) => set({ currentView: view }),
            setLoading: (loading) => set({ isLoading: loading }),
        }),
        {
            name: 'fleetmaster-storage',
            partialize: (state) => ({ currentView: state.currentView }), // Only persist currentView
        }
    )
);
