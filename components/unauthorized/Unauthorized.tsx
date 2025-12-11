import React from 'react';
import { ShieldAlert, Home } from 'lucide-react';
import { AppView } from '../../types';
import { useStore } from '../../store/useStore';

const Unauthorized: React.FC = () => {
  const { setView } = useStore();

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl"></div>
            <div className="relative bg-gradient-to-br from-red-500/10 to-red-900/10 p-6 rounded-full border border-red-500/20">
              <ShieldAlert className="w-16 h-16 text-red-400" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-slate-200 mb-3">
          Acceso Restringido
        </h1>

        {/* Description */}
        <p className="text-slate-400 mb-8 text-lg">
          No tienes permisos para acceder a esta sección.
          <br />
          Contacta con un administrador si necesitas acceso.
        </p>

        {/* Button */}
        <button
          onClick={() => setView(AppView.DASHBOARD)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/50"
        >
          <Home className="w-5 h-5" />
          Volver al Inicio
        </button>

        {/* Footer info */}
        <div className="mt-12 pt-6 border-t border-white/5">
          <p className="text-sm text-slate-500">
            Si crees que esto es un error, comunícate con el equipo de soporte.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
