import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { AppView } from '../../types';

/**
 * Unauthorized Component
 * 
 * Pantalla de acceso restringido mostrada cuando un usuario intenta
 * acceder a una sección para la cual no tiene permisos.
 * 
 * Características:
 * - Diseño centrado y elegante
 * - Icono de alerta de seguridad
 * - Mensaje claro de restricción
 * - Botón para regresar al dashboard
 * - Estilo consistente con el tema oscuro
 */
const Unauthorized: React.FC = () => {
  const { setView } = useStore();

  const handleGoBack = () => {
    setView(AppView.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon Container */}
        <div className="relative inline-flex items-center justify-center mb-8">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
          
          {/* Icon */}
          <div className="relative bg-gradient-to-br from-red-500/20 to-red-900/20 rounded-full p-8 border border-red-500/30">
            <ShieldAlert className="w-16 h-16 text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
          Acceso Restringido
        </h1>

        {/* Description */}
        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
          No tienes los permisos necesarios para acceder a esta sección.
          <br />
          Por favor, contacta al administrador si crees que esto es un error.
        </p>

        {/* Action Button */}
        <button
          onClick={handleGoBack}
          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/50"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Inicio
        </button>

        {/* Decorative Elements */}
        <div className="mt-12 flex items-center justify-center gap-2 text-slate-600">
          <div className="h-px w-12 bg-slate-800"></div>
          <span className="text-xs font-mono uppercase tracking-wider">Error 403</span>
          <div className="h-px w-12 bg-slate-800"></div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
