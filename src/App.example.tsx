/**
 * App Example with Authentication
 * 
 * Ejemplo completo de cómo integrar el sistema de autenticación
 * en tu aplicación existente.
 */

import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';

/**
 * Componente principal de la app (después de autenticación)
 */
function AuthenticatedApp() {
  const { user, profile, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con info del usuario */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">FletesM</h1>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name || user?.email}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.role === 'admin' && 'Administrador'}
                  {profile?.role === 'fleet_manager' && 'Gestor de Flota'}
                  {profile?.role === 'driver' && 'Conductor'}
                </p>
              </div>
              
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido de la app basado en rol */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Panel de Admin - Solo para administradores */}
        <ProtectedRoute requiredRole="admin">
          <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Panel de Administración
            </h2>
            <p className="text-gray-600">
              Acceso completo al sistema. Gestiona usuarios, flota y configuración.
            </p>
          </section>
        </ProtectedRoute>

        {/* Gestión de Flota - Admin y Fleet Manager */}
        <ProtectedRoute requiredRole={['admin', 'fleet_manager']}>
          <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Gestión de Flota
            </h2>
            <p className="text-gray-600">
              Administra vehículos, rutas y asignaciones.
            </p>
          </section>
        </ProtectedRoute>

        {/* Vista de Conductor - Solo para conductores */}
        <ProtectedRoute requiredRole="driver">
          <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Mis Rutas
            </h2>
            <p className="text-gray-600">
              Rutas asignadas y entregas pendientes.
            </p>
          </section>
        </ProtectedRoute>

        {/* Dashboard General - Todos los usuarios autenticados */}
        <section className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-semibold text-blue-900">Entregas Hoy</h3>
              <p className="text-2xl font-bold text-blue-600">12</p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <h3 className="font-semibold text-green-900">En Tránsito</h3>
              <p className="text-2xl font-bold text-green-600">8</p>
            </div>
            <div className="p-4 bg-purple-50 rounded">
              <h3 className="font-semibold text-purple-900">Completadas</h3>
              <p className="text-2xl font-bold text-purple-600">45</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * Wrapper principal con lógica de autenticación
 */
function AppWithAuth() {
  const { isAuthenticated, loading } = useAuth();
  const [showRegister, setShowRegister] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <RegisterForm />
    ) : (
      <LoginForm />
    );
  }

  return <AuthenticatedApp />;
}

/**
 * Componente raíz que envuelve todo con AuthProvider
 */
function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

export default App;
