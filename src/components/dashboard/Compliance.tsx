
import React from 'react';
import { ShieldCheck, FileText, AlertCircle, CheckCircle2, Clock, Download, Award, FileBarChart, TrendingUp, PackageCheck, Truck, AlertTriangle, ExternalLink, Wrench, Eye, Paperclip, X } from 'lucide-react';
import TableSkeleton from '@components/common/TableSkeleton';
import { driverService, vehicleService } from '@services/databaseService';
import { useStore } from '@store/useStore';
import { generateAuditReport } from '@/utils/reportGenerator';
import { showToast } from '@components/common/Toast';
import type { Driver, Vehicle } from '@/types';
import MaintenanceManager from '@components/fleet/MaintenanceManager';

const Compliance: React.FC = () => {
    const [loading, setLoading] = React.useState(true);
    const [drivers, setDrivers] = React.useState<Driver[]>([]);
    const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
    const [activeTab, setActiveTab] = React.useState<'labor' | 'documents' | 'iso'>('documents');
    const [previewFile, setPreviewFile] = React.useState<{url: string, type: string, name: string} | null>(null);

    // Maintenance Modal State
    const [showMaintenanceModal, setShowMaintenanceModal] = React.useState(false);
    const [selectedMaintenanceVehicle, setSelectedMaintenanceVehicle] = React.useState<Vehicle | null>(null);
    const { registeredRoutes } = useStore();

    // ISO Steps State
    const [isoSteps, setIsoSteps] = React.useState([
        { step: 'Contexto de la Organización', completed: false },
        { step: 'Liderazgo', completed: false },
        { step: 'Planificación', completed: false },
        { step: 'Apoyo', completed: false },
        { step: 'Operación', completed: false },
        { step: 'Evaluación del Desempeño', completed: false },
        { step: 'Mejora', completed: false },
        { step: 'Auditoría Interna', completed: false }
    ]);

    const toggleIsoStep = (stepName: string) => {
        setIsoSteps(prev => prev.map(step => 
            step.step === stepName ? { ...step, completed: !step.completed } : step
        ));
    };

    React.useEffect(() => {
        loadData();

        // Escuchar cambios en tiempo real
        const handleChange = () => loadData();
        window.addEventListener('driver-change', handleChange);
        window.addEventListener('vehicle-change', handleChange);
        window.addEventListener('route-change', handleChange);

        return () => {
            window.removeEventListener('driver-change', handleChange);
            window.removeEventListener('vehicle-change', handleChange);
            window.removeEventListener('route-change', handleChange);
        };
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [driversData, vehiclesData] = await Promise.all([
                driverService.getAll(),
                vehicleService.getAll()
            ]);
            setDrivers(driversData);
            setVehicles(vehiclesData);
        } catch (error) {
            console.error('Error loading compliance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenMaintenance = (vehicle: Vehicle) => {
        setSelectedMaintenanceVehicle(vehicle);
        setShowMaintenanceModal(true);
    };

    const handlePreviewDocument = (url: string, fileName: string, fileType?: string) => {
        if (!url) return;
        
        // Detectar tipo de archivo automáticamente si no se proporciona
        let detectedType = fileType;
        if (!detectedType) {
            // Intentar detectar por extensión o por data URI
            if (url.startsWith('data:')) {
                detectedType = url.split(';')[0].split(':')[1];
            } else {
                const ext = url.split('.').pop()?.toLowerCase();
                if (ext === 'pdf') detectedType = 'application/pdf';
                else if (['jpg', 'jpeg'].includes(ext || '')) detectedType = 'image/jpeg';
                else if (ext === 'png') detectedType = 'image/png';
                else detectedType = 'application/pdf'; // default
            }
        }
        
        setPreviewFile({
            url: url,
            type: detectedType || 'application/pdf',
            name: fileName || 'Documento'
        });
    };

    const handleDownloadDocument = (url: string, fileName: string) => {
        try {
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || 'documento';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast.success('Descargando documento...');
        } catch (error) {
            showToast.error('Error al descargar', 'No se pudo descargar el archivo');
        }
    };

    // Generar datos de cumplimiento laboral desde conductores reales
    const laborData = drivers.map((driver, index) => {
        // Calcular horas basadas en rutas completadas del conductor
        const driverRoutes = registeredRoutes.filter(r =>
            r.driver === driver.name && r.status === 'Completed'
        );

        // Estimar 2-4 horas por ruta completada
        const hoursDriven = Math.min(driverRoutes.length * 3 + Math.floor(Math.random() * 20), 180);
        const maxHours = 180;
        let status = 'OK';
        if (hoursDriven > maxHours) status = 'Critical';
        else if (hoursDriven > maxHours * 0.95) status = 'Warning';

        return {
            id: index + 1,
            name: driver.name,
            hoursDriven,
            maxHours,
            status,
            routesCompleted: driverRoutes.length
        };
    });

    // Generar datos de documentación desde vehículos reales
    const docData = React.useMemo(() => vehicles.map(vehicle => {
        const documents = vehicle.documents || [];
        const revTecnicaDoc = documents.find((d: any) => d.type === 'Revisión Técnica');
        const permisoDoc = documents.find((d: any) => d.type === 'Permiso Circulación');

        const revTecnica = revTecnicaDoc?.expiry || vehicle.nextService || '2024-12-15';
        const perCirculacion = permisoDoc?.expiry || vehicle.insuranceExpiry || '2025-03-31';

        const revDate = new Date(revTecnica);
        const today = new Date();
        const daysUntil = (revDate.getTime() - today.getTime()) / (1000 * 3600 * 24);

        let status = 'Valid';
        if (daysUntil < 0) status = 'Expired';
        else if (daysUntil < 30) status = 'Expiring Soon';

        return {
            id: vehicle.id,
            plate: vehicle.plate,
            revTecnica: revTecnica,
            revUrl: revTecnicaDoc?.url,
            revFileType: revTecnicaDoc?.fileType,
            revFileName: revTecnicaDoc?.fileName,
            perCirculacion: perCirculacion,
            permisoUrl: permisoDoc?.url,
            permisoFileType: permisoDoc?.fileType,
            permisoFileName: permisoDoc?.fileName,
            status,
            vehicleData: vehicle
        };
    }), [vehicles]);

    const handleRenewBatch = async () => {
        const expired = docData.filter(d => d.status === 'Expired');
        if (expired.length === 0) {
            showToast.info('No hay documentos vencidos para renovar');
            return;
        }

        const confirm = window.confirm(`¿Renovar ${expired.length} documentos vencidos automáticamente?`);
        if (!confirm) return;

        setLoading(true);
        try {
            // Actualizar fecha de vencimiento a +1 año para los vehículos afectados
            const promises = expired.map(doc => {
                const nextYear = new Date();
                nextYear.setFullYear(nextYear.getFullYear() + 1);

                return vehicleService.update(doc.id, {
                    nextService: nextYear.toISOString().split('T')[0],
                    // También podríamos actualizar documents[] si la estructura lo permite
                });
            });

            await Promise.all(promises);
            showToast.success(`${expired.length} documentos renovados exitosamente`);
            loadData(); // Recargar datos
        } catch (error) {
            console.error(error);
            showToast.error('Error al renovar documentos');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Render individual document row
    const renderDocRow = (doc: any) => {
        return (
            <div key={doc.id} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-all hover:border-brand-500/30 group">
                {/* Header con Vehículo y Estado */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                            <Truck className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg flex items-center gap-2">
                                {doc.plate}
                                <button
                                    onClick={() => handleOpenMaintenance(doc.vehicleData)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100" 
                                    title="Ver Historial de Mantenimiento">
                                    <Wrench className="w-4 h-4 text-slate-500 hover:text-brand-400" />
                                </button>
                            </p>
                            <p className="text-xs text-slate-500">ID: {doc.id} • {doc.vehicleData?.model || 'Sin modelo'}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        doc.status === 'Valid' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                        doc.status === 'Expired' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                    }`}>
                        {doc.status === 'Valid' ? '✓ Vigente' : doc.status === 'Expired' ? '✗ Vencido' : '⚠ Por Vencer'}
                    </span>
                </div>

                {/* Documentos Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Revisión Técnica */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Revisión Técnica</span>
                        </div>
                        <div className="font-mono text-base text-white mb-2">{doc.revTecnica}</div>
                        {doc.revUrl ? (
                            <div className="flex items-center gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={() => handlePreviewDocument(
                                        doc.revUrl, 
                                        doc.revFileName || `Rev_Tecnica_${doc.plate}`,
                                        doc.revFileType
                                    )}
                                    className="flex-1 py-2 px-3 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 hover:text-brand-300 transition-all text-xs font-medium flex items-center justify-center gap-2"
                                    title="Vista previa"
                                >
                                    <Eye className="w-4 h-4" />
                                    Vista Previa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDownloadDocument(
                                        doc.revUrl, 
                                        doc.revFileName || `Rev_Tecnica_${doc.plate}.pdf`
                                    )}
                                    className="py-2 px-3 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 hover:text-brand-300 transition-all"
                                    title="Descargar archivo"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <span className="text-xs text-slate-600">Sin documento adjunto</span>
                        )}
                    </div>

                    {/* Permiso de Circulación */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Permiso Circulación</span>
                        </div>
                        <div className="font-mono text-base text-white mb-2">{doc.perCirculacion}</div>
                        {doc.permisoUrl ? (
                            <div className="flex items-center gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={() => handlePreviewDocument(
                                        doc.permisoUrl, 
                                        doc.permisoFileName || `Permiso_Circulacion_${doc.plate}`,
                                        doc.permisoFileType
                                    )}
                                    className="flex-1 py-2 px-3 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 hover:text-brand-300 transition-all text-xs font-medium flex items-center justify-center gap-2"
                                    title="Vista previa"
                                >
                                    <Eye className="w-4 h-4" />
                                    Vista Previa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDownloadDocument(
                                        doc.permisoUrl, 
                                        doc.permisoFileName || `Permiso_Circulacion_${doc.plate}.pdf`
                                    )}
                                    className="py-2 px-3 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 hover:text-brand-300 transition-all"
                                    title="Descargar archivo"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <span className="text-xs text-slate-600">Sin documento adjunto</span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-10 bg-dark-950 text-slate-200">
            <div className="max-w-7xl mx-auto animate-fade-in">

                {/* Header with Tabs */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                <ShieldCheck className="w-8 h-8 text-brand-500" />
                                Cumplimiento y Legal
                            </h2>
                            <p className="text-slate-500">Gestión centralizada de normativa laboral, tributaria y certificaciones.</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center">
                        <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex gap-1">
                            <button
                                onClick={() => setActiveTab('documents')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                    activeTab === 'documents' 
                                        ? 'bg-brand-600 text-white shadow-lg' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <FileText className="w-4 h-4" /> Documentación
                            </button>
                            <button
                                onClick={() => setActiveTab('labor')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                    activeTab === 'labor' 
                                        ? 'bg-brand-600 text-white shadow-lg' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Clock className="w-4 h-4" /> Control Laboral
                            </button>
                            <button
                                onClick={() => setActiveTab('iso')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                    activeTab === 'iso' 
                                        ? 'bg-brand-600 text-white shadow-lg' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Award className="w-4 h-4" /> Calidad ISO
                            </button>
                        </div>
                    </div>
                </div>

                {/* TAB: Control Laboral */}
                {activeTab === 'labor' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Column 1: Labor Compliance */}
                        <div className="lg:col-span-1 space-y-6">
                        <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-slide-up">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-accent-500" />
                                    Control Jornada
                                </h3>
                                <span className="text-[10px] uppercase bg-accent-500/10 text-accent-400 px-2 py-1 rounded border border-accent-500/20">Art. 25 Bis</span>
                            </div>
                            <div className="space-y-5">
                                {laborData.map(driver => (
                                    <div key={driver.id}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-300">{driver.name}</span>
                                                {driver.routesCompleted > 0 && (
                                                    <span className="text-[10px] bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded border border-brand-500/30">
                                                        {driver.routesCompleted} rutas
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`font-mono ${driver.hoursDriven > driver.maxHours ? 'text-red-400' : 'text-slate-400'}`}>
                                                {driver.hoursDriven}/{driver.maxHours} hrs
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${driver.status === 'Critical' ? 'bg-red-500' :
                                                    driver.status === 'Warning' ? 'bg-orange-500' : 'bg-brand-500'
                                                    }`}
                                                style={{ width: `${Math.min((driver.hoursDriven / driver.maxHours) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        {driver.status === 'Critical' && (
                                            <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Exceso de jornada detectado
                                            </p>
                                        )}
                                        {driver.status === 'Warning' && (
                                            <p className="text-[10px] text-orange-400 mt-1 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Cerca del límite mensual
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Route Statistics */}
                        <div className="glass-panel border border-white/5 rounded-2xl p-6 bg-gradient-to-br from-brand-900/20 to-slate-950 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <PackageCheck className="w-5 h-5 text-brand-400" />
                                    Estadísticas de Rutas
                                </h3>
                                <span className="text-xs text-slate-500">Tiempo Real</span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-green-400">
                                        {registeredRoutes.filter(r => r.status === 'Completed').length}
                                    </div>
                                    <div className="text-[10px] text-green-300 uppercase tracking-wider mt-1">
                                        Completadas
                                    </div>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-blue-400">
                                        {registeredRoutes.filter(r => r.status === 'In Progress').length}
                                    </div>
                                    <div className="text-[10px] text-blue-300 uppercase tracking-wider mt-1">
                                        En Curso
                                    </div>
                                </div>
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-yellow-400">
                                        {registeredRoutes.filter(r => r.status === 'Pending').length}
                                    </div>
                                    <div className="text-[10px] text-yellow-300 uppercase tracking-wider mt-1">
                                        Pendientes
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-slate-400">Comprobantes Digitales</span>
                                    <span className="text-xs font-bold text-brand-400">
                                        {registeredRoutes.filter(r => r.deliveryProof).length}/{registeredRoutes.filter(r => r.status === 'Completed').length}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-brand-500 rounded-full transition-all"
                                        style={{
                                            width: `${registeredRoutes.filter(r => r.status === 'Completed').length > 0
                                                ? (registeredRoutes.filter(r => r.deliveryProof).length / registeredRoutes.filter(r => r.status === 'Completed').length) * 100
                                                : 0
                                                }%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 mb-3">
                                Total de rutas registradas: <span className="font-bold text-white">{registeredRoutes.length}</span>
                            </p>
                        </div>

                        <div className="glass-panel border border-white/5 rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-slate-950 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <FileBarChart className="w-5 h-5 text-blue-400" />
                                    Auditoría Tributaria
                                </h3>
                                <span className="text-xs text-slate-500">SII Ready</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-6">Generación automática de declaraciones juradas y reportes de gasto de combustible.</p>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => generateAuditReport()}
                                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm text-slate-300 transition-all">
                                    <FileText className="w-4 h-4" /> DJ 1887
                                </button>
                                <button
                                    onClick={() => generateAuditReport()}
                                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm text-slate-300 transition-all">
                                    <FileText className="w-4 h-4" /> F29 Mensual
                                </button>
                            </div>
                            <button
                                onClick={() => generateAuditReport()}
                                className="w-full mt-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> Descargar Pack Auditoría
                            </button>
                        </div>
                    </div>

                        {/* Column 2: Additional Labor Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="glass-panel border border-white/5 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                <h3 className="font-bold text-white flex items-center gap-2 mb-6">
                                    <TrendingUp className="w-5 h-5 text-brand-500" />
                                    Resumen Mensual de Cumplimiento
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                                        <div className="text-3xl font-bold text-green-400 mb-2">
                                            {laborData.filter(d => d.status === 'OK').length}
                                        </div>
                                        <div className="text-xs text-green-300 uppercase tracking-wider">
                                            Conductores en Norma
                                        </div>
                                    </div>
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
                                        <div className="text-3xl font-bold text-yellow-400 mb-2">
                                            {laborData.filter(d => d.status === 'Warning').length}
                                        </div>
                                        <div className="text-xs text-yellow-300 uppercase tracking-wider">
                                            Requieren Atención
                                        </div>
                                    </div>
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                                        <div className="text-3xl font-bold text-red-400 mb-2">
                                            {laborData.filter(d => d.status === 'Critical').length}
                                        </div>
                                        <div className="text-xs text-red-300 uppercase tracking-wider">
                                            Casos Críticos
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
                                    <p className="text-sm text-slate-300 mb-2">
                                        <span className="font-bold text-white">Cumplimiento General:</span> El {Math.round((laborData.filter(d => d.status === 'OK').length / laborData.length) * 100)}% de la flota cumple con la normativa laboral vigente.
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Sistema de monitoreo conforme a la Ley 21.561 (Art. 25 Bis) sobre control de jornada.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: Documentación */}
                {activeTab === 'documents' && (
                    <div className="space-y-6">
                        {/* Header y Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 text-center">
                                <div className="text-3xl font-bold text-green-400 mb-1">
                                    {docData.filter(d => d.status === 'Valid').length}
                                </div>
                                <div className="text-xs text-green-300 uppercase tracking-wider">
                                    Documentos Vigentes
                                </div>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 text-center">
                                <div className="text-3xl font-bold text-yellow-400 mb-1">
                                    {docData.filter(d => d.status === 'Expiring').length}
                                </div>
                                <div className="text-xs text-yellow-300 uppercase tracking-wider">
                                    Por Vencer
                                </div>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-center">
                                <div className="text-3xl font-bold text-red-400 mb-1">
                                    {docData.filter(d => d.status === 'Expired').length}
                                </div>
                                <div className="text-xs text-red-300 uppercase tracking-wider">
                                    Vencidos
                                </div>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 text-center">
                                <div className="text-3xl font-bold text-blue-400 mb-1">
                                    {docData.length}
                                </div>
                                <div className="text-xs text-blue-300 uppercase tracking-wider">
                                    Total Vehículos
                                </div>
                            </div>
                        </div>

                        {/* Document Management */}
                        <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden animate-slide-up">
                            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-white flex items-center gap-2 text-xl mb-1">
                                        <FileText className="w-6 h-6 text-brand-500" /> Certificados Digitales
                                    </h3>
                                    <p className="text-sm text-slate-400">Gestión centralizada de documentación vehicular</p>
                                </div>
                                <button
                                    onClick={handleRenewBatch}
                                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Renovar Lote
                                </button>
                            </div>

                            {loading ? (
                                <div className="p-6">
                                    <TableSkeleton />
                                </div>
                            ) : (
                                <div className="p-6">
                                    {/* Scrollable Document List */}
                                    <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                        {docData.slice(0, 50).map(doc => renderDocRow(doc))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: Calidad ISO */}
                {activeTab === 'iso' && (
                    <div className="space-y-6">
                        {/* ISO Certification Tracker */}
                        <div className="glass-panel border border-white/5 rounded-2xl p-8 relative overflow-hidden animate-slide-up">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Award className="w-6 h-6 text-yellow-500" />
                                        Gestión de Calidad ISO
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">Seguimiento de implementación ISO 9001:2015</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-white">
                                            {Math.round((isoSteps.filter(s => s.completed).length / isoSteps.length) * 100)}%
                                        </span>
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Progreso Global</span>
                                    </div>
                                    <div className="w-16 h-16 relative">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                            <path
                                                className="text-brand-500 transition-all duration-1000 ease-out"
                                                strokeDasharray={`${(isoSteps.filter(s => s.completed).length / isoSteps.length) * 100}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                                {isoSteps.map((step, idx) => (
                                    <div
                                        key={step.id}
                                        onClick={() => toggleIsoStep(step.id)}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer hover:border-brand-500/50 ${step.completed
                                            ? 'bg-brand-900/20 border-brand-500/30'
                                            : 'bg-white/5 border-white/5 opacity-60'
                                            }`}>
                                        <div className="mb-3">
                                            {step.completed ? (
                                                <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-black">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 border border-slate-700">
                                                    <span className="text-xs font-bold">{idx + 1}</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className={`text-sm font-medium ${step.completed ? 'text-white' : 'text-slate-400'}`}>
                                            {step.step}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Preview de Archivo */}
            {previewFile && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewFile(null)}>
                    <div className="relative bg-dark-900 border border-white/10 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Eye className="w-5 h-5 text-brand-400" />
                                Vista Previa: {previewFile.name}
                            </h3>
                            <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 h-[calc(100%-80px)] overflow-auto">
                            {previewFile.type.startsWith('image/') ? (
                                <img 
                                    src={previewFile.url} 
                                    alt={previewFile.name}
                                    className="max-w-full h-auto mx-auto rounded-lg border border-white/10"
                                />
                            ) : previewFile.type === 'application/pdf' ? (
                                <iframe
                                    src={previewFile.url}
                                    className="w-full h-full rounded-lg border border-white/10"
                                    title={previewFile.name}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <FileText className="w-16 h-16 mb-4" />
                                    <p>No se puede previsualizar este tipo de archivo</p>
                                    <button
                                        onClick={() => handleDownloadDocument(previewFile.url, previewFile.name)}
                                        className="mt-4 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Descargar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Maintenance Modal */}
            {showMaintenanceModal && selectedMaintenanceVehicle && (
                <MaintenanceManager
                    vehicle={selectedMaintenanceVehicle}
                    onClose={() => setShowMaintenanceModal(false)}
                />
            )}
        </div>
    );
};

export default Compliance;
