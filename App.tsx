import React, { Suspense, useEffect } from 'react';
import { useStore } from './store/useStore';
import { useSupabaseRealtime } from './hooks/useSupabaseRealtime';
import { useAuth } from './src/hooks/useAuth';
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import { ToastProvider, showToast } from './components/Toast';
import PageLoader from './components/PageLoader';
import { LoginView } from './components/auth/LoginView';
import Unauthorized from './components/unauthorized/Unauthorized';
// AuthDiagnostic eliminado de producción por seguridad
// import { AuthDiagnostic } from './components/AuthDiagnostic'; 

import SkipLink from './components/SkipLink';
import Hero from './components/Hero';

// Lazy Load
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

const App: React.FC = () => {
  // 1. Hooks Principales
  const { user, profile, loading } = useAuth();
  const store = useStore();
  const { currentView, setView } = store;
  
  useSupabaseRealtime();

  // 1.1. Ref para controlar redirecciones y evitar bucles infinitos
  const isRedirecting = React.useRef(false);

  // 2. Efecto de Redirección (UX Layer)
  // Este efecto maneja la experiencia de usuario, pero NO es la única barrera de seguridad.
  useEffect(() => {
    // Si no hay perfil o ya estamos cargando, no hacer nada
    if (!profile || loading) return;

    const role = profile.role;

    // A. Lógica estricta para DRIVER
    if (role === 'driver') {
      if (currentView !== AppView.DRIVER_MOBILE) {
        // Evitar doble setView si ya estamos en proceso
        if (!isRedirecting.current) {
          isRedirecting.current = true;
          console.log('🚗 Driver detected - Enforcing mobile view');
          setView(AppView.DRIVER_MOBILE);
          // Reseteamos el flag en el próximo ciclo
          setTimeout(() => { isRedirecting.current = false; }, 100);
        }
      }
    }
    // B. Lógica para FLEET MANAGER
    else if (role === 'fleet_manager') {
      const forbiddenViews = [AppView.FINANCIALS, AppView.COMPLIANCE];
      
      if (forbiddenViews.includes(currentView)) {
        if (!isRedirecting.current) {
          isRedirecting.current = true;
          console.log('🛡️ Restricted view - Redirecting to Dashboard');
          showToast.warning('Acceso Denegado', 'Redirigiendo al Dashboard...');
          setView(AppView.DASHBOARD);
          setTimeout(() => { isRedirecting.current = false; }, 100);
        }
      }
    }
  }, [
    // Dependencias Críticas: Solo re-ejecutar si cambia el rol, no el objeto profile entero
    profile?.role,
    currentView,
    loading,
    setView
  ]);

  // 3. Demo Mode (Solo en Desarrollo o entorno seguro)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Verificamos que no estemos en producción real (opcional, ajusta según tu lógica)
      const isProd = import.meta.env.PROD; 
      
      if (!isProd && e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        enableDemoMode(useStore);
        showToast.success('🎭 Modo Demo', 'Datos de prueba cargados');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // 4. Early Returns (Loading & Auth)

  if (loading) {
    return (
      <div className="antialiased text-slate-200">
        <PageLoader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="antialiased text-slate-200">
        <ToastProvider />
        <LoginView />
      </div>
    );
  }

  // 5. Render Guard (Security Layer - CRÍTICO)
  // Aquí es donde realmente bloqueamos el acceso al componente.
  
  const renderView = () => {
    const role = profile?.role;
    
    // Si por alguna razón no hay rol cargado, denegar acceso
    if (!role) {
      console.error('❌ No role found for user:', user?.email);
      return <Unauthorized />;
    }

    switch (currentView) {
      case AppView.HOME:
        return <Hero />;

      case AppView.DASHBOARD:
        // Admin y Manager pueden ver Dashboard
        // Driver NO debería ver el Dashboard de escritorio
        if (role === 'driver') return <Unauthorized />;
        return <Dashboard />;

      case AppView.TRACKING:
        // 🔒 CORRECCIÓN: Bloqueado para Drivers
        if (role === 'admin' || role === 'fleet_manager') {
          return <FleetTracking />;
        }
        return <Unauthorized />;

      case AppView.FLEET:
        if (role === 'admin' || role === 'fleet_manager') {
          return <FleetManager />;
        }
        return <Unauthorized />;

      case AppView.ROUTES:
      case AppView.ROUTE_BUILDER:
        // 🔒 CORRECCIÓN: Bloqueado para Drivers
        // Asumimos que Managers sí pueden planear rutas
        if (role === 'admin' || role === 'fleet_manager') {
          return currentView === AppView.ROUTES ? <RoutePlanner /> : <RouteBuilder />;
        }
        return <Unauthorized />;

      case AppView.FINANCIALS:
        return role === 'admin' ? <Financials /> : <Unauthorized />;

      case AppView.COMPLIANCE:
        return role === 'admin' ? <Compliance /> : <Unauthorized />;

      case AppView.DRIVER_MOBILE:
        // Vista permitida para todos (es la home del driver)
        return <DriverMobile />;

      default:
        // Fallback seguro
        return <Hero />;
    }
  };

  // 6. UI Condicional
  const isDriver = profile?.role === 'driver';
  
  // Ocultar navegación si es driver
  const showNavigation = !isDriver; 

  return (
    <div className="antialiased text-slate-200 selection:bg-brand-500 selection:text-black font-sans">
      <SkipLink />
      <ToastProvider />
      
      {showNavigation && (
        <>
          <Navbar />
          <Breadcrumbs />
        </>
      )}
      
      <main 
        id="main-content" 
        className={`bg-dark-950 ${showNavigation ? 'pt-20' : ''}`}
      >
        <Suspense fallback={<PageLoader />}>
          {renderView()}
        </Suspense>
      </main>

      {showNavigation && (
        <footer className="bg-black border-t border-white/5 py-8">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-600 text-sm">
            <p>© 2025 FleetTech Corp.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;