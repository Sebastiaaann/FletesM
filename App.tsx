

import React, { Suspense, useEffect } from 'react';
import { useStore } from './store/useStore';
import { useSupabaseRealtime } from './hooks/useSupabaseRealtime';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import { ToastProvider } from './components/Toast';
import PageLoader from './components/PageLoader';
import Unauthorized from './components/unauthorized/Unauthorized';

import SkipLink from './components/SkipLink';
import Hero from './components/Hero';
import SupabaseTest from './components/SupabaseTest';

// Lazy load heavy components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const FleetManager = React.lazy(() => import('./components/FleetManager'));
const RoutePlanner = React.lazy(() => import('./components/RoutePlanner'));
const RouteBuilder = React.lazy(() => import('./components/RouteBuilder'));
const Financials = React.lazy(() => import('./components/Financials'));
const Compliance = React.lazy(() => import('./components/Compliance'));
const FleetTracking = React.lazy(() => import('./components/FleetTracking'));
const DriverMobile = React.lazy(() => import('./components/DriverMobile'));

import { AppView } from './types';
import { enableDemoMode } from './utils/demoData';
import { showToast } from './components/Toast';

const AppContent: React.FC = () => {
  const store = useStore();
  const { currentView, setView } = store;
  const { profile } = useAuth();
  useSupabaseRealtime();

  // Demo Mode: Press Ctrl+Shift+D
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        enableDemoMode(useStore);
        showToast.success('🎭 Modo Demo Activado', 'Datos de ejemplo cargados');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Role-based redirection
  useEffect(() => {
    if (!profile) return;

    const role = profile.role;

    // Si el usuario es driver, solo puede acceder a DRIVER_MOBILE
    if (role === 'driver' && currentView !== AppView.DRIVER_MOBILE) {
      setView(AppView.DRIVER_MOBILE);
      return;
    }

    // Si no es admin, no puede acceder a FINANCIALS o COMPLIANCE
    if (role !== 'admin' && (currentView === AppView.FINANCIALS || currentView === AppView.COMPLIANCE)) {
      setView(AppView.DASHBOARD);
      showToast.error('Acceso denegado', 'No tienes permisos para esta sección');
      return;
    }

    // Si no es admin ni fleet_manager, no puede acceder a FLEET
    if (role !== 'admin' && role !== 'fleet_manager' && currentView === AppView.FLEET) {
      setView(AppView.DASHBOARD);
      showToast.error('Acceso denegado', 'No tienes permisos para esta sección');
      return;
    }
  }, [currentView, profile, setView]);

  const renderView = () => {
    const role = profile?.role;

    switch (currentView) {
      case AppView.HOME:
        return <Hero />;
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.TRACKING:
        return <FleetTracking />;
      case AppView.FLEET:
        // Solo admin o fleet_manager pueden ver esta vista
        if (role === 'admin' || role === 'fleet_manager') {
          return <FleetManager />;
        }
        return <Unauthorized />;
      case AppView.ROUTES:
        return <RoutePlanner />;
      case AppView.ROUTE_BUILDER:
        return <RouteBuilder />;
      case AppView.FINANCIALS:
        // Solo admin puede ver esta vista
        if (role === 'admin') {
          return <Financials />;
        }
        return <Unauthorized />;
      case AppView.COMPLIANCE:
        // Solo admin puede ver esta vista
        if (role === 'admin') {
          return <Compliance />;
        }
        return <Unauthorized />;
      case AppView.DRIVER_MOBILE:
        return <DriverMobile />;
      default:
        return <Hero />;
    }
  };

  return (
    <div className="antialiased text-slate-200 selection:bg-brand-500 selection:text-black font-sans">
      <SkipLink />
      <Navbar />
      <Breadcrumbs />
      <main id="main-content" className="bg-dark-950 pt-20">
        <Suspense fallback={<PageLoader />}>
          {renderView()}
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-600 text-sm">
          <p>© 2024 FleetTech Corp. Todos los derechos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer transition-colors">Privacidad</span>
            <span className="hover:text-white cursor-pointer transition-colors">Seguridad</span>
            <span className="hover:text-white cursor-pointer transition-colors">API</span>
          </div>
        </div>
      </footer>

      {/* Test de conexión Supabase (temporal) */}
      {/* <SupabaseTest /> */}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider />
      <AppContent />
    </AuthProvider>
  );
};

export default App;
