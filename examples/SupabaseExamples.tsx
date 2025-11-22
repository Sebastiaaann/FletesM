/**
 * Ejemplo de uso de Supabase en un componente React
 * Este archivo muestra cómo integrar los servicios de Supabase en tus componentes
 */

import React, { useState, useEffect } from 'react';
import { vehicleService, driverService, routeService } from './services/databaseService';
import { Vehicle, Driver } from './types';

/**
 * Hook personalizado para cargar vehículos
 */
export const useVehicles = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadVehicles = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await vehicleService.getAll();
            setVehicles(data || []);
        } catch (err: any) {
            setError(err.message);
            console.error('Error loading vehicles:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVehicles();
    }, []);

    return { vehicles, loading, error, refresh: loadVehicles };
};

/**
 * Hook personalizado para cargar conductores
 */
export const useDrivers = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDrivers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await driverService.getAll();
            setDrivers(data || []);
        } catch (err: any) {
            setError(err.message);
            console.error('Error loading drivers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDrivers();
    }, []);

    return { drivers, loading, error, refresh: loadDrivers };
};

/**
 * Componente de ejemplo: Lista de Vehículos
 */
export const VehicleList: React.FC = () => {
    const { vehicles, loading, error, refresh } = useVehicles();

    if (loading) {
        return <div className="p-4">Cargando vehículos...</div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500 rounded">
                <p className="text-red-500">Error: {error}</p>
                <button
                    onClick={refresh}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Vehículos ({vehicles.length})</h2>
                <button
                    onClick={refresh}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Actualizar
                </button>
            </div>

            {vehicles.length === 0 ? (
                <p className="text-gray-400">No hay vehículos registrados</p>
            ) : (
                <div className="grid gap-4">
                    {vehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            className="p-4 bg-dark-800 border border-white/10 rounded-lg"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold">{vehicle.plate}</h3>
                                    <p className="text-gray-400">
                                        {vehicle.brand} {vehicle.model} ({vehicle.year})
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Tipo: {vehicle.vehicle_type}
                                    </p>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm ${vehicle.status === 'Active'
                                            ? 'bg-green-500/20 text-green-400'
                                            : vehicle.status === 'Maintenance'
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'bg-gray-500/20 text-gray-400'
                                        }`}
                                >
                                    {vehicle.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * Componente de ejemplo: Formulario para crear vehículo
 */
export const CreateVehicleForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        vehicle_type: 'Semi-trailer',
        status: 'Active' as const,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            await vehicleService.create(formData);

            // Limpiar formulario
            setFormData({
                plate: '',
                brand: '',
                model: '',
                year: new Date().getFullYear(),
                vehicle_type: 'Semi-trailer',
                status: 'Active',
            });

            // Llamar callback de éxito
            onSuccess?.();

            alert('Vehículo creado exitosamente!');
        } catch (err: any) {
            setError(err.message);
            console.error('Error creating vehicle:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-dark-800 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Crear Nuevo Vehículo</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500">
                    {error}
                </div>
            )}

            <div className="grid gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Patente</label>
                    <input
                        type="text"
                        value={formData.plate}
                        onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                        className="w-full px-3 py-2 bg-dark-900 border border-white/10 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Marca</label>
                    <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-3 py-2 bg-dark-900 border border-white/10 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Modelo</label>
                    <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-3 py-2 bg-dark-900 border border-white/10 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Año</label>
                    <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-dark-900 border border-white/10 rounded"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-brand-500 text-black font-semibold rounded hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creando...' : 'Crear Vehículo'}
                </button>
            </div>
        </form>
    );
};

/**
 * Ejemplo de uso de seguimiento GPS en tiempo real
 */
export const useGPSTracking = (routeId: string) => {
    const [locations, setLocations] = useState<any[]>([]);

    useEffect(() => {
        if (!routeId) return;

        // Suscribirse a actualizaciones GPS
        const subscription = gpsService.subscribeToRoute(routeId, (payload) => {
            console.log('Nueva ubicación GPS:', payload.new);
            setLocations((prev) => [...prev, payload.new]);
        });

        // Cleanup: desuscribirse cuando el componente se desmonte
        return () => {
            subscription.unsubscribe();
        };
    }, [routeId]);

    return locations;
};
