import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useStore } from '../store/useStore';
import { analyzeFleetHealth } from '../services/geminiService';
import { Vehicle, AppView } from '../types';
import { BarChart3, Fuel, Wrench, TrendingUp, AlertCircle, Zap, MapPin, BellRing, Calendar, ArrowUpRight, ArrowDownRight, X, Package, Clock, CheckCircle2, Loader2, FileSignature } from 'lucide-react';
import MapSkeleton from './MapSkeleton';
import Sparkline from './Sparkline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { vehicleService } from '../services/databaseService';
import DeliveryProofViewer from './DeliveryProofViewer';

// Lazy load FleetMap for better performance
const FleetMap = lazy(() => import('./FleetMap'));

const smartAlerts = [
   { id: 1, type: 'critical', msg: "Consumo excesivo de combustible detectado en V-001 (+15% sobre promedio)", time: "Hace 10m" },
   { id: 2, type: 'warning', msg: "Conductor D-2 excedió límite de velocidad en zona urbana", time: "Hace 45m" },
   { id: 3, type: 'info', msg: "Ruta Santiago-Valdivia optimizada: Ahorro potencial $45.000", time: "Hace 2h" }
];

// Chart Data
const revenueData = [
   { name: 'Ene', ingresos: 65, costos: 40 },
   { name: 'Feb', ingresos: 59, costos: 38 },
   { name: 'Mar', ingresos: 80, costos: 45 },
   { name: 'Abr', ingresos: 81, costos: 42 },
   { name: 'May', ingresos: 56, costos: 48 },
   { name: 'Jun', ingresos: 95, costos: 50 },
   { name: 'Jul', ingresos: 84, costos: 45 },
];

const sparklineData = {
   fleet: [20, 22, 21, 24, 24, 25, 24],
   fuel: [3.0, 3.1, 3.2, 3.1, 3.3, 3.2, 3.2],
   maintenance: [2, 1, 3, 2, 4, 3, 3],
   revenue: [70, 75, 72, 80, 85, 82, 84]
};

const Dashboard: React.FC = () => {
   const [aiInsight, setAiInsight] = useState("Inicializando FleetTech AI...");
   const [dateRange, setDateRange] = useState('month');
   const [vehicles, setVehicles] = useState<Vehicle[]>([]);
   const [loadingVehicles, setLoadingVehicles] = useState(true);
   const [selectedProof, setSelectedProof] = useState<any>(null);
   const registeredRoutes = useStore((state) => state.registeredRoutes);

   // Cargar vehículos desde Supabase
   useEffect(() => {
      loadVehicles();
      
      // Escuchar cambios en tiempo real
      const handleVehicleChange = () => loadVehicles();
      window.addEventListener('vehicle-change', handleVehicleChange);
      
      return () => {
         window.removeEventListener('vehicle-change', handleVehicleChange);
      };
   }, []);

   const loadVehicles = async () => {
      setLoadingVehicles(true);
      try {
         const data = await vehicleService.getAll();
         setVehicles(data);
      } catch (error) {
         console.error('Error loading vehicles:', error);
      } finally {
         setLoadingVehicles(false);
      }
   };

   // FLOTA ACTIVA: Calcular vehículos activos vs total
   const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
   const totalVehicles = vehicles.length;
   const fleetChange = totalVehicles > 0 ? Math.round(((activeVehicles - totalVehicles * 0.9) / (totalVehicles * 0.9)) * 100) : 0;

   // EFICIENCIA: Calcular consumo promedio basado en nivel de combustible
   const avgFuelEfficiency = totalVehicles > 0 ? vehicles.reduce((sum, v) => sum + (v.fuelLevel || 0), 0) / totalVehicles / 100 * 4.5 : 0;
   const fuelEfficiency = avgFuelEfficiency.toFixed(1);
   const fuelVsTarget = (avgFuelEfficiency - 3.3).toFixed(1);

   // MANTENIMIENTO: Contar vehículos en mantenimiento y próximos servicios
   const maintenanceVehicles = vehicles.filter(v => v.status === 'Maintenance').length;
   const upcomingService = vehicles.filter(v => {
      const serviceDate = new Date(v.nextService);
      const today = new Date();
      const daysUntil = (serviceDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      return daysUntil <= 7 && daysUntil > 0;
   }).length;
   const totalPending = maintenanceVehicles + upcomingService;
   const criticalCount = vehicles.filter(v => (v.fuelLevel || 0) < 20 || v.status === 'Maintenance').length;

   // INGRESOS: Calcular desde rutas registradas
   const registeredRevenue = registeredRoutes.reduce((acc, route) => {
      const price = parseInt(route.estimatedPrice.replace(/[^0-9]/g, '')) || 0;
      return acc + price;
   }, 0);
   
   // Base revenue histórico + nuevas rutas
   const baseRevenue = 84000000;
   const totalRevenue = baseRevenue + registeredRevenue;
   const formattedRevenue = `$${(totalRevenue / 1000000).toFixed(1)}M`;
   const revenueGrowth = ((registeredRevenue / baseRevenue) * 100).toFixed(0);

   useEffect(() => {
      if (vehicles.length > 0 && !loadingVehicles) {
         const fetchInsight = async () => {
            const insight = await analyzeFleetHealth(vehicles);
            setAiInsight(insight);
         };
         fetchInsight();
      }
   }, [vehicles, loadingVehicles]);

   return (
      <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-10 bg-dark-950 text-slate-200">
         <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 animate-fade-in">
               <div>
                  <h2 className="text-3xl font-bold text-white mb-1">Centro de Mando</h2>
                  <p className="text-slate-500 text-sm">Resumen de operaciones, mantenimiento y salud financiera.</p>
               </div>
               <div className="flex gap-3 mt-4 md:mt-0">
                  <div className="relative">
                     <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="appearance-none bg-white/5 border border-white/10 text-white px-4 py-2 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                        aria-label="Seleccionar rango de fechas"
                     >
                        <option value="week">Últimos 7 días</option>
                        <option value="month">Este Mes</option>
                        <option value="year">Este Año</option>
                     </select>
                     <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                  </div>
                  <button className="px-4 py-2 bg-brand-600/20 text-brand-400 border border-brand-600/30 rounded-lg text-sm font-medium hover:bg-brand-600/30 transition-colors">
                     Exportar Reporte
                  </button>
               </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
               {/* Key Metrics */}
               <div className="glass-card p-6 rounded-2xl md:col-span-1 animate-slide-up relative overflow-hidden group hover-lift" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                     <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Flota Activa</span>
                     <div className="p-2 bg-brand-500/10 rounded-lg">
                        <TruckIcon className="text-brand-500 w-5 h-5" />
                     </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1 relative z-10">{activeVehicles}<span className="text-lg text-slate-500 font-normal">/{totalVehicles}</span></div>
                  <div className={`flex items-center gap-1 text-xs ${fleetChange >= 0 ? 'text-green-400' : 'text-red-400'} mb-4 relative z-10`}>
                     {fleetChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                     {Math.abs(fleetChange)}% vs semana anterior
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-50 transition-opacity">
                     <Sparkline data={sparklineData.fleet} color="#6366f1" />
                  </div>
               </div>

               <div className="glass-card p-6 rounded-2xl md:col-span-1 animate-slide-up relative overflow-hidden group hover-lift" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                     <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Vehículos Activos</span>
                     <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle2 className="text-green-500 w-5 h-5" />
                     </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1 relative z-10">{activeVehicles}<span className="text-lg text-slate-500 font-normal">/{totalVehicles}</span></div>
                  <div className={`flex items-center gap-1 text-xs ${fleetChange >= 0 ? 'text-green-400' : 'text-red-400'} mb-4 relative z-10`}>
                     {fleetChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                     {Math.abs(fleetChange)}% operacionales
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-50 transition-opacity">
                     <Sparkline data={sparklineData.fleet} color="#22c55e" />
                  </div>
               </div>

               <div className="glass-card p-6 rounded-2xl md:col-span-1 animate-slide-up relative overflow-hidden group hover-lift" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                     <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Mantenimiento</span>
                     <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Wrench className="text-orange-500 w-5 h-5" />
                     </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1 relative z-10">{totalPending}<span className="text-lg text-slate-500 font-normal"> Pendientes</span></div>
                  <div className="flex items-center gap-1 text-xs text-orange-400 mb-4 relative z-10">
                     <AlertCircle className="w-3 h-3" /> {criticalCount} Crítico{criticalCount !== 1 ? 's' : ''}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-50 transition-opacity">
                     <Sparkline data={sparklineData.maintenance} color="#f97316" />
                  </div>
               </div>

               <div className="glass-card p-6 rounded-2xl md:col-span-1 animate-slide-up relative overflow-hidden group hover-lift" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                     <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Ingresos</span>
                     <div className="p-2 bg-green-500/10 rounded-lg">
                        <BarChart3 className="text-green-500 w-5 h-5" />
                     </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1 relative z-10">{formattedRevenue}</div>
                  <div className="flex items-center gap-1 text-xs text-green-400 mb-4 relative z-10">
                     <ArrowUpRight className="w-3 h-3" /> +{revenueGrowth}% vs mes anterior
                  </div>
                  {registeredRoutes.length > 0 && (
                     <div className="text-[10px] text-slate-500 mb-2 relative z-10">
                        {registeredRoutes.length} ruta{registeredRoutes.length !== 1 ? 's' : ''} nueva{registeredRoutes.length !== 1 ? 's' : ''} (+${(registeredRevenue / 1000).toFixed(0)}K)
                     </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-50 transition-opacity">
                     <Sparkline data={sparklineData.revenue} color="#22c55e" />
                  </div>
               </div>
            </div>

            {/* Rutas Registradas Section */}
            <div className="glass-panel rounded-2xl border border-white/5 p-6 mb-8 animate-fade-in">
               <div className="flex items-center justify-between mb-6">
                  <div>
                     <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Package className="w-5 h-5 text-brand-500" />
                        Rutas Registradas
                     </h3>
                     <p className="text-slate-400 text-sm mt-1">
                        {registeredRoutes.length} {registeredRoutes.length === 1 ? 'ruta activa' : 'rutas activas'}
                     </p>
                  </div>
                  <div className="flex gap-2">
                     <button className="px-3 py-1.5 text-xs bg-white/5 text-slate-300 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                        Todas
                     </button>
                     <button className="px-3 py-1.5 text-xs bg-white/5 text-slate-300 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                        Pendientes
                     </button>
                     <button className="px-3 py-1.5 text-xs bg-white/5 text-slate-300 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                        En Progreso
                     </button>
                  </div>
               </div>

               {registeredRoutes.length === 0 ? (
                  <div className="text-center py-12">
                     <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                        <Package className="w-8 h-8 text-slate-500" />
                     </div>
                     <h4 className="text-white font-semibold mb-2">No hay rutas registradas</h4>
                     <p className="text-slate-400 text-sm mb-4">
                        Las rutas que registres desde el Planificador aparecerán aquí
                     </p>
                     <button
                        onClick={() => useStore.getState().setView(AppView.ROUTE_BUILDER)}
                        className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
                     >
                        Crear Nueva Ruta
                     </button>
                  </div>
               ) : (
                  <div className="overflow-x-auto -mx-6 px-6">
                     <table className="w-full min-w-[900px]">
                        <thead>
                           <tr className="border-b border-white/5">
                              <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                              <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Origen</th>
                              <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Destino</th>
                              <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Distancia</th>
                              <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Vehículo</th>
                              <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Precio</th>
                              <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                              <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">POD</th>
                           </tr>
                        </thead>
                        <tbody>
                           {registeredRoutes.map((route) => (
                              <tr key={route.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                 <td className="py-4 px-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${route.status === 'Completed'
                                       ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                       : route.status === 'In Progress'
                                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                          : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                       }`}>
                                       {route.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                                       {route.status === 'In Progress' && <Loader2 className="w-3 h-3 animate-spin" />}
                                       {route.status === 'Pending' && <Clock className="w-3 h-3" />}
                                       {route.status === 'Completed' ? 'Completada' : route.status === 'In Progress' ? 'En Progreso' : 'Pendiente'}
                                    </span>
                                 </td>
                                 <td className="py-4 px-4">
                                    <div className="flex items-start gap-2">
                                       <MapPin className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                                       <span className="text-white text-sm">{route.origin}</span>
                                    </div>
                                 </td>
                                 <td className="py-4 px-4">
                                    <div className="flex items-start gap-2">
                                       <MapPin className="w-4 h-4 text-accent-500 mt-0.5 shrink-0" />
                                       <span className="text-white text-sm">{route.destination}</span>
                                    </div>
                                 </td>
                                 <td className="py-4 px-4">
                                    <span className="text-slate-300 text-sm font-mono">{route.distance}</span>
                                 </td>
                                 <td className="py-4 px-4">
                                    <span className="text-slate-300 text-sm">{route.vehicleType}</span>
                                 </td>
                                 <td className="py-4 px-4">
                                    <span className="text-green-400 text-sm font-semibold">{route.estimatedPrice}</span>
                                 </td>
                                 <td className="py-4 px-4">
                                    <span className="text-slate-400 text-xs">
                                       {new Date(route.timestamp).toLocaleDateString('es-CL', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric'
                                       })}
                                    </span>
                                 </td>
                                 <td className="py-4 px-4 text-center">
                                    {route.deliveryProof ? (
                                       <button
                                          onClick={() => setSelectedProof(route.deliveryProof)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg text-xs font-medium hover:bg-brand-500/20 transition-colors"
                                       >
                                          <FileSignature className="w-3.5 h-3.5" />
                                          Ver
                                       </button>
                                    ) : route.status === 'Completed' ? (
                                       <span className="text-slate-500 text-xs">Sin firma</span>
                                    ) : (
                                       <span className="text-slate-600 text-xs">-</span>
                                    )}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>

            {/* Alerts & Map Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
               {/* Smart Alerts Feed */}
               <div className="lg:col-span-1 flex flex-col gap-6">
                  <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-slide-in-right h-full">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-white font-bold text-sm flex items-center gap-2">
                           <BellRing className="w-4 h-4 text-accent-500" /> Alertas Inteligentes
                        </h3>
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">3 NUEVAS</span>
                     </div>
                     <div className="space-y-4">
                        {smartAlerts.map((alert) => (
                           <div key={alert.id} className="group relative p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/10">
                              <div className="flex gap-3">
                                 <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${alert.type === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : alert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                 <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                       <span className={`text-[10px] font-bold uppercase tracking-wider ${alert.type === 'critical' ? 'text-red-400' : alert.type === 'warning' ? 'text-orange-400' : 'text-blue-400'}`}>
                                          {alert.type === 'critical' ? 'Crítico' : alert.type === 'warning' ? 'Advertencia' : 'Info'}
                                       </span>
                                       <span className="text-[10px] text-slate-500 font-mono">{alert.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-snug">{alert.msg}</p>
                                 </div>
                              </div>
                              <button
                                 className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20 rounded"
                                 aria-label="Cerrar alerta"
                              >
                                 <X className="w-3 h-3" aria-hidden="true" />
                              </button>
                           </div>
                        ))}
                     </div>
                     <button className="w-full mt-4 py-2 text-xs text-slate-400 hover:text-white border border-white/5 hover:border-white/10 rounded-lg transition-colors">
                        Ver todas las alertas
                     </button>
                  </div>
               </div>

               {/* Interactive Map with Leaflet - Lazy Loaded */}
               <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 p-1 relative min-h-[400px] overflow-hidden animate-fade-in">
                  <Suspense fallback={<MapSkeleton />}>
                     {loadingVehicles ? (
                        <MapSkeleton />
                     ) : (
                        <FleetMap vehicles={vehicles} />
                     )}
                  </Suspense>
               </div>
            </div>

         </div>

         {/* Delivery Proof Viewer Modal */}
         {selectedProof && (
            <DeliveryProofViewer 
               deliveryProof={selectedProof}
               onClose={() => setSelectedProof(null)}
            />
         )}
      </div>
   );
};

const TruckIcon = ({ className }: { className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 17h4V5H2v12h3" /><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" /><path d="M14 17h1" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
)

export default Dashboard;
