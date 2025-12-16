import React, { useState } from 'react';
import { DriverFormCard, DriverFormData } from '@/components/ui/driver-form-card';
import toast from 'react-hot-toast';

/**
 * Ejemplo de uso del componente DriverFormCard
 * 
 * Este componente muestra cómo integrar el formulario de conductor
 * con validación de RUT chileno, tipos de licencia y fecha de vencimiento.
 */
export const DriverFormExample: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [drivers, setDrivers] = useState<DriverFormData[]>([]);

  const handleSubmit = (data: DriverFormData) => {
    console.log('Datos del conductor:', data);
    
    // Agregar el conductor a la lista
    setDrivers([...drivers, data]);
    
    // Mostrar notificación de éxito
    toast.success(`Conductor ${data.fullName} agregado exitosamente`);
    
    // Cerrar el formulario
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    toast.error('Operación cancelada');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Gestión de Conductores
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Administra la información de tus conductores
            </p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Agregar Conductor
          </button>
        </div>

        {/* Lista de Conductores */}
        {drivers.length > 0 && (
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Conductores Registrados
            </h2>
            <div className="space-y-4">
              {drivers.map((driver, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {driver.fullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {driver.fullName}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        RUT: {driver.rut} • Licencia: Clase {driver.licenseType}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        Vence: {new Date(driver.licenseExpiration).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <DriverFormCard
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Información de uso */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            📋 Características del Formulario
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li>✅ Validación automática de RUT chileno (módulo 11)</li>
            <li>✅ Formateo automático de RUT mientras se escribe</li>
            <li>✅ Selección de tipos de licencia (A1-A5, B, C, D, E, F)</li>
            <li>✅ Validación de fecha de vencimiento (no permite licencias vencidas)</li>
            <li>✅ Soporte para foto del conductor</li>
            <li>✅ Animaciones suaves con Framer Motion</li>
            <li>✅ Tooltips informativos en cada campo</li>
            <li>✅ Modo oscuro incluido</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
