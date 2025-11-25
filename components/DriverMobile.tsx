import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { MapPin, Navigation, CheckCircle2, Clock, Truck, AlertCircle, PhoneCall, Package, ArrowRight, Play, Square, Plus, X } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';
import { generateSmartQuote } from '../services/geminiService';
import LoadingButton from './LoadingButton';

interface DriverMobileProps {
  driverName?: string;
}

// Mock data - en producción vendría de la base de datos
const MOCK_DRIVERS = [
  { id: "D-1", name: "Carlos Mendoza" },
  { id: "D-2", name: "Ana Silva" },
  { id: "D-3", name: "Jorge O'Ryan" },
];

const MOCK_VEHICLES = [
  { id: "V-001", plate: "HG-LF-99", model: "Volvo FH16" },
  { id: "V-002", plate: "JS-KK-22", model: "Scania R450" },
  { id: "V-003", plate: "LK-MM-11", model: "Mercedes Actros" },
];

const DriverMobile: React.FC<DriverMobileProps> = ({ driverName = "Conductor" }) => {
  const { registeredRoutes, updateRouteStatus, addRoute } = useStore();
  const [selectedDriver, setSelectedDriver] = useState(driverName);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [activeRoute, setActiveRoute] = useState<any | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [showNewRouteForm, setShowNewRouteForm] = useState(false);
  
  // Form state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<[number, number] | undefined>();
  const [destCoords, setDestCoords] = useState<[number, number] | undefined>();
  const [vehicleType, setVehicleType] = useState('Camión 3/4');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quoteResult, setQuoteResult] = useState<any | null>(null);

  // Filtrar rutas asignadas al conductor
  // Si selectedDriver es "Conductor" (valor por defecto), mostrar TODAS las rutas
  // Si no, filtrar solo las del conductor específico
  const myRoutes = registeredRoutes.filter(route => {
    const isNotCompleted = route.status !== 'Completed';
    
    if (selectedDriver === 'Conductor') {
      // Mostrar todas las rutas no completadas
      return isNotCompleted;
    } else {
      // Mostrar solo las rutas del conductor seleccionado
      return route.driver === selectedDriver && isNotCompleted;
    }
  });

  // Timer para ruta activa
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && activeRoute) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, activeRoute]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRoute = (route: any) => {
    setActiveRoute(route);
    setIsTracking(true);
    setElapsedTime(0);
    updateRouteStatus(route.id, 'In Progress');
  };

  const handleFinishRoute = () => {
    if (activeRoute) {
      updateRouteStatus(activeRoute.id, 'Completed');
      setIsTracking(false);
      setActiveRoute(null);
      setElapsedTime(0);
    }
  };

  const calculateDistance = (coord1?: [number, number], coord2?: [number, number]): number => {
    if (!coord1 || !coord2) return 0;
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const handleGenerateQuote = async () => {
    if (!origin || !destination) {
      alert('Por favor ingresa origen y destino');
      return;
    }

    setIsGenerating(true);
    try {
      const distance = calculateDistance(originCoords, destCoords);
      const result = await generateSmartQuote(description || 'Transporte de carga', `${distance} km`);
      setQuoteResult(result);
    } catch (error) {
      console.error('Error generating quote:', error);
      alert('Error al generar cotización');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRoute = () => {
    if (!origin || !destination || !quoteResult) {
      alert('Por favor completa todos los campos y genera una cotización');
      return;
    }

    if (selectedDriver === 'Conductor') {
      alert('Por favor selecciona un conductor');
      return;
    }

    if (!selectedVehicle) {
      alert('Por favor selecciona un vehículo');
      return;
    }

    const distance = calculateDistance(originCoords, destCoords);
    const newRoute = {
      id: Date.now().toString(),
      origin,
      destination,
      distance: `${distance} km`,
      estimatedPrice: quoteResult.estimatedPrice,
      vehicleType: quoteResult.vehicleType,
      driver: selectedDriver,
      vehicle: selectedVehicle,
      timestamp: Date.now(),
      status: 'Pending' as const,
    };

    addRoute(newRoute);
    
    // Reset form
    setOrigin('');
    setDestination('');
    setOriginCoords(undefined);
    setDestCoords(undefined);
    setDescription('');
    setQuoteResult(null);
    setSelectedVehicle('');
    setShowNewRouteForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 text-white pb-20 pt-20">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-6 pb-8 rounded-b-3xl shadow-2xl mt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-brand-100 text-sm font-medium">Bienvenido</p>
            <h1 className="text-2xl font-bold text-white">{selectedDriver}</h1>
          </div>
          <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
            <Truck className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">{myRoutes.length}</div>
            <div className="text-xs text-brand-100 mt-1">Pendientes</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">
              {selectedDriver === 'Conductor' 
                ? registeredRoutes.filter(r => r.status === 'In Progress').length
                : registeredRoutes.filter(r => r.driver === selectedDriver && r.status === 'In Progress').length
              }
            </div>
            <div className="text-xs text-brand-100 mt-1">En Curso</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">
              {selectedDriver === 'Conductor'
                ? registeredRoutes.filter(r => r.status === 'Completed').length
                : registeredRoutes.filter(r => r.driver === selectedDriver && r.status === 'Completed').length
              }
            </div>
            <div className="text-xs text-brand-100 mt-1">Completadas</div>
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      {!showNewRouteForm && !isTracking && (
        <button
          onClick={() => setShowNewRouteForm(true)}
          className="fixed bottom-24 right-6 z-30 bg-brand-500 hover:bg-brand-600 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* New Route Form Modal */}
      {showNewRouteForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-end">
          <div className="w-full bg-dark-900 rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Nueva Ruta</h2>
              <button
                onClick={() => {
                  setShowNewRouteForm(false);
                  setQuoteResult(null);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Selector de Conductor */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Conductor
                </label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Conductor" className="bg-dark-900">Seleccionar conductor</option>
                  {MOCK_DRIVERS.map(driver => (
                    <option key={driver.id} value={driver.name} className="bg-dark-900">
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Vehículo */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Vehículo
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="" className="bg-dark-900">Seleccionar vehículo</option>
                  {MOCK_VEHICLES.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.plate} className="bg-dark-900">
                      {vehicle.plate} - {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>

              <AddressAutocomplete
                label="Origen"
                value={origin}
                onChange={(val, coords) => {
                  setOrigin(val);
                  setOriginCoords(coords);
                }}
                placeholder="Ingresa dirección de origen"
              />

              <AddressAutocomplete
                label="Destino"
                value={destination}
                onChange={(val, coords) => {
                  setDestination(val);
                  setDestCoords(coords);
                }}
                placeholder="Ingresa dirección de destino"
              />

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Descripción de la Carga (Opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Pallets de electrónicos, frágil"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <LoadingButton
                onClick={handleGenerateQuote}
                loading={isGenerating}
                disabled={!origin || !destination}
                className="w-full"
              >
                Generar Cotización con IA
              </LoadingButton>

              {quoteResult && (
                <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Precio Estimado</span>
                    <span className="text-2xl font-bold text-brand-400">{quoteResult.estimatedPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Vehículo</span>
                    <span className="text-white font-semibold">{quoteResult.vehicleType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Tiempo Estimado</span>
                    <span className="text-white font-semibold">{quoteResult.timeEstimate}</span>
                  </div>
                  
                  <button
                    onClick={handleSaveRoute}
                    className="w-full mt-4 bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Crear Ruta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Route Card */}
      {activeRoute && isTracking ? (
        <div className="mx-4 -mt-6 mb-6 relative z-10">
          <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-6 shadow-2xl border-4 border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-white font-bold text-sm uppercase tracking-wider">Ruta Activa</span>
              </div>
              <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                <span className="text-white text-xs font-bold">EN CURSO</span>
              </div>
            </div>

            {/* Route Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <div className="w-0.5 h-6 bg-white/50 mx-auto my-1"></div>
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white/80 text-xs font-medium mb-1">Origen</p>
                  <p className="text-white font-bold">{activeRoute.origin.split(',')[0]}</p>
                  <p className="text-white/80 text-xs font-medium mt-3 mb-1">Destino</p>
                  <p className="text-white font-bold">{activeRoute.destination.split(',')[0]}</p>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">Tiempo Transcurrido</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">{formatTime(elapsedTime)}</div>
              </div>
            </div>

            {/* Finish Button */}
            <button
              onClick={handleFinishRoute}
              className="w-full bg-white text-green-600 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-50 transition-colors shadow-lg"
            >
              <CheckCircle2 className="w-6 h-6" />
              Finalizar Ruta
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-500" />
            Mis Rutas Pendientes
          </h2>
        </div>
      )}

      {/* Routes List */}
      <div className="px-4 space-y-4">
        {myRoutes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-slate-400 text-lg font-medium">No tienes rutas pendientes</p>
            <p className="text-slate-500 text-sm mt-2">¡Buen trabajo! 🎉</p>
          </div>
        ) : (
          myRoutes.map((route) => (
            <div
              key={route.id}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
            >
              {/* Route Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${route.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {route.status === 'In Progress' ? 'En Curso' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-white font-bold text-lg mb-1">
                    {route.origin.split(',')[0]} → {route.destination.split(',')[0]}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-4 h-4" />
                      {route.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      {route.vehicleType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Route Details */}
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-white/5 rounded-xl">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Cotización</p>
                  <p className="text-white font-bold">{route.estimatedPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Fecha</p>
                  <p className="text-white font-bold text-sm">
                    {new Date(route.timestamp).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>

              {/* Driver and Vehicle Info */}
              {(route.driver || route.vehicle) && (
                <div className="mb-4 p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl space-y-2">
                  {route.driver && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">👤 Conductor:</span>
                      <span className="text-white font-semibold">{route.driver}</span>
                    </div>
                  )}
                  {route.vehicle && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">🚛 Vehículo:</span>
                      <span className="text-white font-semibold">{route.vehicle}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {route.status === 'Pending' && (
                <button
                  onClick={() => handleStartRoute(route)}
                  disabled={isTracking}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Iniciar Ruta
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Emergency Contact */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-950/95 backdrop-blur-lg border-t border-white/10 p-4">
        <button className="w-full bg-red-500/10 border-2 border-red-500 text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
          <PhoneCall className="w-5 h-5" />
          Contactar Soporte
        </button>
      </div>

    </div>
  );
};

export default DriverMobile;
