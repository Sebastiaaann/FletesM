import React, { useState } from 'react';
import { DriverFormCard, DriverFormData } from '@/components/ui';
import { UserPlus, Truck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Ejemplo de integración del DriverFormCard en el sistema de gestión de flotas
 * 
 * Este componente muestra cómo integrar el formulario de conductor
 * dentro de la sección de gestión de flotas existente.
 */

export const FleetDriverManagement: React.FC = () => {
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [drivers, setDrivers] = useState<DriverFormData[]>([]);

  const handleAddDriver = (data: DriverFormData) => {
    // Aquí normalmente guardarías en Supabase
    console.log('Nuevo conductor:', data);
    
    // Por ahora, agregar al estado local
    setDrivers([...drivers, data]);
    
    // Mostrar notificación de éxito
    toast.success(`Conductor ${data.fullName} agregado exitosamente`);
    
    // Cerrar modal
    setShowDriverForm(false);
  };

  const handleCancel = () => {
    setShowDriverForm(false);
    toast.error('Operación cancelada');
  };

  // Verificar si una licencia está por vencer (menos de 30 días)
  const isLicenseExpiringSoon = (expirationDate: string) => {
    const expiration = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.floor((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
  };

  // Verificar si una licencia está vencida
  const isLicenseExpired = (expirationDate: string) => {
    const expiration = new Date(expirationDate);
    const today = new Date();
    return expiration < today;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Truck className="h-6 w-6" />
            Gestión de Conductores
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Administra la información de los conductores de tu flota
          </p>
        </div>
        
        <button
          onClick={() => setShowDriverForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
        >
          <UserPlus className="h-5 w-5" />
          Agregar Conductor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Conductores</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {drivers.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Licencias Vigentes</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {drivers.filter(d => !isLicenseExpired(d.licenseExpiration)).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Truck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Por Vencer</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {drivers.filter(d => isLicenseExpiringSoon(d.licenseExpiration)).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Drivers List */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Lista de Conductores
          </h3>

          {drivers.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">
                No hay conductores registrados
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Haz clic en "Agregar Conductor" para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {drivers.map((driver, index) => {
                const expiring = isLicenseExpiringSoon(driver.licenseExpiration);
                const expired = isLicenseExpired(driver.licenseExpiration);

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                        {driver.fullName.charAt(0)}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {driver.fullName}
                          </p>
                          {expired && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                              Vencida
                            </span>
                          )}
                          {expiring && !expired && (
                            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded">
                              Por Vencer
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          RUT: {driver.rut} • Licencia Clase {driver.licenseType}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          Vence: {new Date(driver.licenseExpiration).toLocaleDateString('es-CL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors">
                        Editar
                      </button>
                      <button className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors">
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showDriverForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <DriverFormCard
            onSubmit={handleAddDriver}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
};
