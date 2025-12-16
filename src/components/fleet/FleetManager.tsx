import React, { useState, useEffect } from 'react';
import type { Driver, Vehicle, MaintenancePrediction } from '@/types';
import { predictMaintenance } from '@services/geminiService';
import { vehicleService, driverService } from '@services/databaseService';
import { getVehicleInfo, validateChileanPlate, TEST_PLATES } from '@services/vehicleInfoService';
import { Search, Plus, User, Truck, AlertTriangle, X, Save, Trash2, Edit2, Zap, Activity, Thermometer, FileText, Download, Paperclip, Eye } from 'lucide-react';
import { showToast } from '@components/common/Toast';
import LoadingButton from '@components/common/LoadingButton';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@utils/errorMessages';
import { VehicleCreateSchema, VehicleUpdateSchema, DriverCreateSchema, DriverUpdateSchema, DriverStatus } from '@/lib/validations';
import MaintenanceManager from './MaintenanceManager';
import { DriverFormCard, type DriverFormData } from '@/components/ui/driver-form-card';
import { useConfirm } from '@/components/common/ConfirmDialog';

// Helper: Chilean RUT Formatter
const formatRut = (rut: string) => {
  const clean = rut.replace(/[^0-9kK]/g, '');
  if (clean.length <= 1) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  return `${body}-${dv}`;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const FleetManager: React.FC = () => {
  const { confirm, ConfirmComponent } = useConfirm();
  const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers'>('vehicles');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingPlate, setIsSearchingPlate] = useState(false);
  const [previewFile, setPreviewFile] = useState<{url: string, type: string, name: string} | null>(null);

  // --- STATE MANAGEMENT ---
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Cargar datos desde Supabase al montar el componente
  useEffect(() => {
    loadData();

    // Escuchar cambios en tiempo real
    const handleVehicleChange = () => loadData();
    const handleDriverChange = () => loadData();

    window.addEventListener('vehicle-change', handleVehicleChange);
    window.addEventListener('driver-change', handleDriverChange);

    return () => {
      window.removeEventListener('vehicle-change', handleVehicleChange);
      window.removeEventListener('driver-change', handleDriverChange);
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vehiclesData, driversData] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll()
      ]);
      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch (error) {
      showToast.error('Error al cargar datos', error instanceof Error ? error.message : 'Intenta nuevamente');
    } finally {
      setIsLoading(false);
    }
  };

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // --- PREDICTIVE MAINT STATE ---
  const [predictiveData, setPredictiveData] = useState<MaintenancePrediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [selectedVehicleModel, setSelectedVehicleModel] = useState("");
  const [maintenanceVehicle, setMaintenanceVehicle] = useState<Vehicle | null>(null);

  // --- ACTIONS ---

  const handleOpenCreate = () => {
    setModalMode('create');
    // Establecer fecha por defecto para próximo servicio (3 meses adelante)
    const defaultNextService = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFormData(activeTab === 'vehicles'
      ? { plate: '', model: '', status: 'Active', mileage: 0, fuelLevel: 100, nextService: defaultNextService, city: '' }
      : { name: '', rut: '', licenseType: 'A1', licenseExpiry: '', status: 'Available' }
    );
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormData({ ...item });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleFileUpload = async (type: string, file: File) => {
    if (!file) return;

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Archivo muy grande', 'El archivo debe ser menor a 5MB');
      return;
    }

    // Validar tipo de archivo
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      showToast.error('Tipo de archivo no válido', 'Solo se permiten PDF, JPG o PNG');
      return;
    }

    try {
      // Convertir archivo a base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Actualizar documento con el archivo
      const currentDocs = formData.documents || [];
      const otherDocs = currentDocs.filter((d: any) => d.type !== type);
      const targetDoc = currentDocs.find((d: any) => d.type === type) || { type };
      
      setFormData({
        ...formData,
        documents: [...otherDocs, { 
          ...targetDoc, 
          url: base64,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }]
      });

      showToast.success('Archivo cargado', file.name);
    } catch (error) {
      showToast.error('Error al cargar archivo', 'No se pudo procesar el archivo');
    }
  };

  const handleDownloadDocument = (doc: any) => {
    if (!doc.url) return;
    
    try {
      // Crear un enlace temporal para descargar
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.fileName || `${doc.type}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast.success('Descargando archivo', doc.fileName || doc.type);
    } catch (error) {
      showToast.error('Error al descargar', 'No se pudo descargar el archivo');
    }
  };

  const handlePreviewDocument = (doc: any) => {
    if (!doc.url) return;
    setPreviewFile({
      url: doc.url,
      type: doc.fileType || 'application/pdf',
      name: doc.fileName || doc.type
    });
  };

  const handleSearchPlate = async () => {
    const plate = formData.plate?.trim();
    
    if (!plate) {
      showToast.warning('Ingresa una patente', 'Debes ingresar una patente para buscar');
      return;
    }

    if (!validateChileanPlate(plate)) {
      showToast.warning('Formato inválido', 'Formato válido: LLLLNN (ej: BCYT91) o LLNNNN (ej: AB1234)');
      return;
    }

    setIsSearchingPlate(true);
    
    try {
      const vehicleInfo = await getVehicleInfo(plate);
      
      // Auto-fill form with API data
      setFormData(prev => ({
        ...prev,
        plate: vehicleInfo.plate,
        model: `${vehicleInfo.make} ${vehicleInfo.model} (${vehicleInfo.year})`,
        // Keep other fields as they are
      }));
      
      showToast.success('Vehículo encontrado', `${vehicleInfo.make} ${vehicleInfo.model} - ${vehicleInfo.year}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'No se pudo obtener información';
      showToast.error('Error al buscar patente', errorMsg);
      
      // Show test plates hint if using test API
      if (errorMsg.includes('No se encontraron datos')) {
        showToast.info('Patentes de prueba disponibles', `Ejemplo: ${TEST_PLATES[0]}, ${TEST_PLATES[1]}, ${TEST_PLATES[2]}...`);
      }
    } finally {
      setIsSearchingPlate(false);
    }
  };

  const handleDelete = async (id: string) => {
    const itemName = activeTab === 'vehicles' ? 'vehículo' : 'conductor';
    const item = activeTab === 'vehicles'
      ? vehicles.find(v => v.id === id)
      : drivers.find(d => d.id === id);

    const itemLabel = activeTab === 'vehicles'
      ? (item as Vehicle)?.plate || id
      : (item as Driver)?.name || id;

    const title = activeTab === 'vehicles' ? 'Eliminar Vehículo' : 'Eliminar Conductor';
    const message = `¿Estás seguro de que deseas eliminar ${itemName} "${itemLabel}"?\n\nEsta acción no se puede deshacer.`;

    confirm(
      title,
      message,
      async () => {
        try {
          if (activeTab === 'vehicles') {
            await vehicleService.delete(id);
            setVehicles(prev => prev.filter(v => v.id !== id));
            showToast.success(`Vehículo ${itemLabel} eliminado`, 'El vehículo ha sido eliminado exitosamente');
          } else {
            await driverService.delete(id);
            setDrivers(prev => prev.filter(d => d.id !== id));
            showToast.success(`Conductor ${itemLabel} eliminado`, 'El conductor ha sido eliminado exitosamente');
          }
        } catch (error) {
          showToast.error('Error al eliminar', error instanceof Error ? error.message : 'Intenta nuevamente');
        }
      },
      'danger'
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Validate with Zod
      if (modalMode === 'create') {
        // Generar UUID válido
        const uuid = crypto.randomUUID();
        
        const newItem = {
          ...formData,
          id: uuid,
          status: formData.status || (activeTab === 'vehicles' ? 'Idle' : 'Available'),
          // Asegurar valores numéricos
          mileage: Number(formData.mileage) || 0,
          fuelLevel: Number(formData.fuelLevel) || 100,
          // Asegurar que nextService no esté vacío
          nextService: formData.nextService || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };

        if (activeTab === 'vehicles') {
          // Validate vehicle data
          const validationResult = VehicleCreateSchema.safeParse(newItem);

          if (!validationResult.success) {
            // Extract errors from Zod
            const zodErrors: any = {};
            const issues = (validationResult.error as any)?.issues ?? (validationResult.error as any)?.errors ?? [];
            console.error('Errores de validación:', issues);
            issues.forEach((err: any) => {
              const field = err.path[0] as string;
              zodErrors[field] = err.message;
            });
            setErrors(zodErrors);
            
            // Mostrar mensaje más detallado
            const errorFields = Object.keys(zodErrors).join(', ');
            showToast.warning('Errores en el formulario', `Campos con error: ${errorFields}`);
            console.log('Datos enviados:', newItem);
            console.log('Errores:', zodErrors);
            setIsSaving(false);
            return;
          }

          await vehicleService.create(validationResult.data);
          await loadData();
          showToast.success(SUCCESS_MESSAGES.VEHICLE_CREATED);
        } else {
          // Validate driver data
          const validationResult = DriverCreateSchema.safeParse(newItem);

          if (!validationResult.success) {
            // Extract errors from Zod
            const zodErrors: any = {};
            const issues = (validationResult.error as any)?.issues ?? (validationResult.error as any)?.errors ?? [];
            issues.forEach((err: any) => {
              const field = err.path[0] as string;
              zodErrors[field] = err.message;
            });
            setErrors(zodErrors);
            showToast.warning('Errores en el formulario', 'Por favor corrige los campos marcados');
            setIsSaving(false);
            return;
          }

          await driverService.create(validationResult.data);
          await loadData();
          showToast.success(SUCCESS_MESSAGES.DRIVER_CREATED);
        }
      } else {
        // Edit mode - use update schemas
        if (activeTab === 'vehicles') {
          const validationResult = VehicleUpdateSchema.safeParse(formData);

          if (!validationResult.success) {
            const zodErrors: any = {};
            const issues = (validationResult.error as any)?.issues ?? (validationResult.error as any)?.errors ?? [];
            issues.forEach((err: any) => {
              const field = err.path[0] as string;
              zodErrors[field] = err.message;
            });
            setErrors(zodErrors);
            showToast.warning('Por favor corrige los errores en el formulario');
            setIsSaving(false);
            return;
          }

          await vehicleService.update(editingId!, validationResult.data);
          await loadData();
          showToast.success(SUCCESS_MESSAGES.VEHICLE_UPDATED);
        } else {
          const validationResult = DriverUpdateSchema.safeParse(formData);

          if (!validationResult.success) {
            const zodErrors: any = {};
            const issues = (validationResult.error as any)?.issues ?? (validationResult.error as any)?.errors ?? [];
            issues.forEach((err: any) => {
              const field = err.path[0] as string;
              zodErrors[field] = err.message;
            });
            setErrors(zodErrors);
            showToast.warning('Por favor corrige los errores en el formulario');
            setIsSaving(false);
            return;
          }

          await driverService.update(editingId!, validationResult.data);
          await loadData();
          showToast.success(SUCCESS_MESSAGES.DRIVER_UPDATED);
        }
      }

      setIsModalOpen(false);
      setErrors({});
    } catch (error) {
      showToast.error('Error al guardar', error instanceof Error ? error.message : 'Intenta nuevamente');
    } finally {
      setIsSaving(false);
    }
  };

  const runPrediction = async (vehicle: Vehicle) => {
    setSelectedVehicleModel(vehicle.model);
    setIsPredicting(true);
    setShowPredictionModal(true);
    setPredictiveData(null);

    try {
      const data = await predictMaintenance(vehicle);
      setPredictiveData(data);
    } catch (error) {
      showToast.error("Error al obtener predicción", error instanceof Error ? error.message : 'Intenta nuevamente');
      setShowPredictionModal(false);
    } finally {
      setIsPredicting(false);
    }
  };

  // --- FILTERING ---
  const filteredVehicles = vehicles.filter(v =>
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.rut.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-dark-950 text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando datos desde Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-dark-950 text-slate-200 relative">
      <div className="max-w-7xl mx-auto animate-fade-in pb-20">

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Gestión del Equipo</h2>
            <p className="text-slate-500 text-sm">Administra activos, personal y documentación de cumplimiento.</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'vehicles' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Vehículos
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'drivers' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Conductores
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Buscar ${activeTab === 'vehicles' ? 'vehículo' : 'conductor'}...`}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
            />
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-white text-black px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            <Plus className="w-4 h-4" /> Agregar {activeTab === 'vehicles' ? 'Vehículo' : 'Conductor'}
          </button>
        </div>

        <div className="glass-panel border border-white/5 rounded-xl overflow-hidden min-h-[400px] animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="overflow-x-auto">
            {activeTab === 'drivers' ? (
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-slate-400 font-semibold tracking-wider">
                    <th className="p-4">Nombre / RUT</th>
                    <th className="p-4">Licencia</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Vencimiento</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{driver.name}</p>
                            <p className="text-slate-500 text-xs">{driver.rut}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-800 border border-slate-700 text-white text-xs px-2 py-1 rounded">{driver.licenseType}</span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={driver.status} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 text-sm">{driver.licenseExpiry}</span>
                          {new Date(driver.licenseExpiry) < new Date() && (
                            <span title="Vencido/Por vencer" className="text-red-500 animate-pulse">
                              <AlertTriangle className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(driver);
                            }} 
                            className="p-2 hover:bg-brand-500/20 rounded-lg text-slate-400 hover:text-brand-400 transition-colors"
                            title="Editar conductor"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(driver.id);
                            }} 
                            className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                            title="Eliminar conductor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-slate-400 font-semibold tracking-wider">
                    <th className="p-4">Patente / Modelo</th>
                    <th className="p-4">Kilometraje</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{vehicle.plate}</p>
                            <p className="text-slate-500 text-xs">{vehicle.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-300 font-mono">{vehicle.mileage.toLocaleString()} km</span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={vehicle.status} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMaintenanceVehicle(vehicle);
                            }}
                            className="p-2 hover:bg-brand-500/20 rounded-lg text-slate-400 hover:text-brand-400 transition-colors"
                            title="Historial de Mantenimiento"
                          >
                            <ToolsIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(vehicle);
                            }} 
                            className="p-2 hover:bg-brand-500/20 rounded-lg text-slate-400 hover:text-brand-400 transition-colors"
                            title="Editar vehículo"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(vehicle.id);
                            }} 
                            className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                            title="Eliminar vehículo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* --- CRUD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-dark-900 border border-white/10 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-slide-up my-8">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">
                {modalMode === 'create' ? 'Agregar' : 'Editar'} {activeTab === 'vehicles' ? 'Vehículo' : 'Conductor'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {activeTab === 'vehicles' ? (
                <>
                  {/* Grid de 2 columnas para expansión horizontal */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna Izquierda - Información Básica */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Truck className="w-4 h-4 text-brand-400" /> Información Básica
                      </h4>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Patente</label>
                        <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.plate || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, plate: e.target.value.toUpperCase() });
                          if (errors.plate) {
                            setErrors(prev => ({ ...prev, plate: undefined }));
                          }
                        }}
                        placeholder="Ej: BCYT91 o AB1234"
                        maxLength={6}
                        className={`flex-1 bg-dark-950 border ${errors.plate ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500 outline-none`}
                      />
                      <button
                        type="button"
                        onClick={handleSearchPlate}
                        disabled={isSearchingPlate || !formData.plate}
                        className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 min-w-[100px] justify-center"
                      >
                        {isSearchingPlate ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span className="text-sm">Buscando...</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            <span className="text-sm">Buscar</span>
                          </>
                        )}
                      </button>
                    </div>
                        {errors.plate && <p className="text-red-400 text-xs mt-1">{errors.plate}</p>}
                        <p className="text-slate-500 text-xs mt-1">Formato: LLLLNN (nuevo) o LLNNNN (antiguo)</p>
                      </div>
                      <Input label="Modelo" value={formData.model} onChange={(e: any) => setFormData({ ...formData, model: e.target.value })} error={errors.model} placeholder="Volvo FH16" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Kilometraje (km)" type="number" value={formData.mileage || 0} onChange={(e: any) => setFormData({ ...formData, mileage: Number(e.target.value) })} error={errors.mileage} />
                        <Input label="Nivel Combustible (%)" type="number" value={formData.fuelLevel || 100} onChange={(e: any) => setFormData({ ...formData, fuelLevel: Number(e.target.value) })} max={100} error={errors.fuelLevel} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Estado</label>
                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-dark-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500 outline-none">
                          <option value="Active">Activo</option>
                          <option value="Maintenance">En Mantenimiento</option>
                          <option value="Idle">Inactivo</option>
                        </select>
                      </div>
                      <Input label="Ciudad" value={formData.city || ''} onChange={(e: any) => setFormData({ ...formData, city: e.target.value })} placeholder="Ej: Puerto Montt" error={errors.city} />
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Próximo Servicio" type="date" value={formData.nextService || ''} onChange={(e: any) => setFormData({ ...formData, nextService: e.target.value })} error={errors.nextService} />
                        <Input label="Vencimiento Seguro" type="date" value={formData.insuranceExpiry || ''} onChange={(e: any) => setFormData({ ...formData, insuranceExpiry: e.target.value })} placeholder="Vencimiento Seguro" error={errors.insuranceExpiry} />
                      </div>
                    </div>

                    {/* Columna Derecha - Documentación */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                        <FileText className="w-4 h-4 text-brand-400" /> Documentación
                      </h4>

                    {/* Helper to update specific document type */}
                    {(() => {
                      const getDoc = (type: string) => (formData.documents || []).find((d: any) => d.type === type) || {};
                      const updateDoc = (type: string, field: string, value: string) => {
                        const currentDocs = formData.documents || [];
                        const otherDocs = currentDocs.filter((d: any) => d.type !== type);
                        const targetDoc = currentDocs.find((d: any) => d.type === type) || { type };
                        setFormData({
                          ...formData,
                          documents: [...otherDocs, { ...targetDoc, [field]: value }]
                        });
                      };

                      return (
                        <div className="space-y-4">
                          {/* Revisión Técnica */}
                          <div className="bg-gradient-to-br from-brand-500/10 to-brand-600/5 p-5 rounded-xl border border-brand-400/20 shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-brand-400" />
                              </div>
                              <h5 className="text-sm font-bold text-white">Revisión Técnica</h5>
                            </div>
                            <div className="space-y-4">
                              <Input
                                label="Vencimiento"
                                type="date"
                                value={getDoc('Revisión Técnica').expiry || ''}
                                onChange={(e: any) => updateDoc('Revisión Técnica', 'expiry', e.target.value)}
                              />
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Documento</label>
                                {!getDoc('Revisión Técnica').fileName ? (
                                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-brand-400/30 rounded-xl cursor-pointer bg-brand-500/5 hover:bg-brand-500/10 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <FileText className="w-10 h-10 text-brand-400 mb-2 group-hover:scale-110 transition-transform" />
                                      <p className="text-sm text-slate-300 font-medium">Click para adjuntar archivo</p>
                                      <p className="text-xs text-slate-500 mt-1">PDF, JPG o PNG (máx. 5MB)</p>
                                    </div>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload('Revisión Técnica', file);
                                      }}
                                    />
                                  </label>
                                ) : (
                                  <div className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                          <Paperclip className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-green-400 truncate">{getDoc('Revisión Técnica').fileName}</p>
                                          <p className="text-xs text-green-400/60 mt-1">Archivo adjunto correctamente</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => handlePreviewDocument(getDoc('Revisión Técnica'))}
                                          className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 transition-all"
                                          title="Vista previa"
                                        >
                                          <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDownloadDocument(getDoc('Revisión Técnica'))}
                                          className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 transition-all"
                                          title="Descargar archivo"
                                        >
                                          <Download className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Permiso de Circulación */}
                          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-5 rounded-xl border border-blue-400/20 shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-blue-400" />
                              </div>
                              <h5 className="text-sm font-bold text-white">Permiso de Circulación</h5>
                            </div>
                            <div className="space-y-4">
                              <Input
                                label="Vencimiento"
                                type="date"
                                value={getDoc('Permiso Circulación').expiry || ''}
                                onChange={(e: any) => updateDoc('Permiso Circulación', 'expiry', e.target.value)}
                              />
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Documento</label>
                                {!getDoc('Permiso Circulación').fileName ? (
                                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-400/30 rounded-xl cursor-pointer bg-blue-500/5 hover:bg-blue-500/10 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <FileText className="w-10 h-10 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                                      <p className="text-sm text-slate-300 font-medium">Click para adjuntar archivo</p>
                                      <p className="text-xs text-slate-500 mt-1">PDF, JPG o PNG (máx. 5MB)</p>
                                    </div>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload('Permiso Circulación', file);
                                      }}
                                    />
                                  </label>
                                ) : (
                                  <div className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                          <Paperclip className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-green-400 truncate">{getDoc('Permiso Circulación').fileName}</p>
                                          <p className="text-xs text-green-400/60 mt-1">Archivo adjunto correctamente</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => handlePreviewDocument(getDoc('Permiso Circulación'))}
                                          className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 transition-all"
                                          title="Vista previa"
                                        >
                                          <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDownloadDocument(getDoc('Permiso Circulación'))}
                                          className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 transition-all"
                                          title="Descargar archivo"
                                        >
                                          <Download className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center">
                  <DriverFormCard
                    initialData={{
                      fullName: formData.name || '',
                      rut: formData.rut || '',
                      licenseType: formData.licenseType || 'B',
                      licenseExpiration: formData.licenseExpiry || '',
                      imageUrl: formData.imageUrl
                    }}
                    onSubmit={async (data: DriverFormData) => {
                      setIsSaving(true);
                      try {
                        const driverData = {
                          id: crypto.randomUUID(),
                          name: data.fullName,
                          rut: data.rut,
                          licenseType: data.licenseType,
                          licenseExpiry: data.licenseExpiration,
                          status: (formData.status || 'Available') as DriverStatus
                        };

                        if (modalMode === 'create') {
                          const validation = DriverCreateSchema.safeParse(driverData);
                          if (!validation.success) {
                            const firstError = validation.error.issues[0];
                            showToast.error('Error de validación', firstError.message);
                            setIsSaving(false);
                            return;
                          }
                          const newDriver = await driverService.create(validation.data);
                          setDrivers([...drivers, newDriver]);
                          showToast.success(SUCCESS_MESSAGES.DRIVER_CREATED);
                          window.dispatchEvent(new Event('driver-change'));
                        } else if (editingId) {
                          const validation = DriverUpdateSchema.safeParse(driverData);
                          if (!validation.success) {
                            const firstError = validation.error.issues[0];
                            showToast.error('Error de validación', firstError.message);
                            setIsSaving(false);
                            return;
                          }
                          await driverService.update(editingId, validation.data);
                          setDrivers(drivers.map(d => d.id === editingId ? { ...d, ...validation.data } : d));
                          showToast.success(SUCCESS_MESSAGES.DRIVER_UPDATED);
                          window.dispatchEvent(new Event('driver-change'));
                        }
                        setIsModalOpen(false);
                      } catch (error) {
                        showToast.error('Error al guardar', error instanceof Error ? error.message : 'Intenta nuevamente');
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    onCancel={() => setIsModalOpen(false)}
                    className="max-w-2xl"
                  />
                </div>
              )}
            </div>
            {activeTab === 'vehicles' && (
              <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium">Cancelar</button>
                <LoadingButton
                  onClick={handleSave}
                  loading={isSaving}
                  loadingText="Guardando..."
                  icon={<Save className="w-4 h-4" />}
                >
                  Guardar
                </LoadingButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- PREDICTIVE AI MODAL --- */}
      {showPredictionModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={() => setShowPredictionModal(false)}></div>
          <div className="relative bg-dark-900 border border-accent-500/30 w-full max-w-lg rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.2)] overflow-hidden animate-slide-up">

            {isPredicting ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-accent-500/30 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-accent-400 rounded-full border-t-transparent animate-spin"></div>
                  <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Analizando Telemetría</h3>
                <p className="text-slate-400">Consultando modelos predictivos para {selectedVehicleModel}...</p>
              </div>
            ) : predictiveData ? (
              <div>
                <div className="bg-gradient-to-br from-accent-600 to-accent-900 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6" /> Diagnóstico IA
                      </h2>
                      <p className="opacity-80 text-sm mt-1">{selectedVehicleModel} - Mantenimiento Predictivo</p>
                    </div>
                    <button onClick={() => setShowPredictionModal(false)} className="bg-black/20 p-2 rounded-full hover:bg-black/40 transition-colors"><X className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path className={`${predictiveData.healthScore > 70 ? 'text-green-500' : predictiveData.healthScore > 40 ? 'text-orange-500' : 'text-red-500'}`} strokeDasharray={`${predictiveData.healthScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-bold text-white">{predictiveData.healthScore}%</span>
                        <span className="text-[10px] text-slate-500 uppercase">SALUD</span>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2">
                        <span className="text-slate-400 text-xs uppercase tracking-wider">Riesgo Detectado</span>
                        <h4 className="text-white font-semibold text-lg">{predictiveData.predictedFailure}</h4>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${predictiveData.urgency === 'Critical' || predictiveData.urgency === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          Urgencia: {predictiveData.urgency}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          Est. {predictiveData.estimatedCost}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h5 className="text-slate-300 text-sm font-bold mb-2 flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-accent-400" /> Acción Recomendada
                    </h5>
                    <p className="text-slate-400 text-sm">{predictiveData.recommendedAction}</p>
                  </div>

                  <button onClick={() => setShowPredictionModal(false)} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors">
                    Programar Taller
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* --- MAINTENANCE MANAGER MODAL --- */}
      {maintenanceVehicle && (
        <MaintenanceManager
          vehicle={maintenanceVehicle}
          onClose={() => setMaintenanceVehicle(null)}
        />
      )}

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
                    onClick={() => handleDownloadDocument({ url: previewFile.url, fileName: previewFile.name })}
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

      {/* Confirm Dialog */}
      <ConfirmComponent />
    </div>
  );
};

const ToolsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStyles = (s: string) => {
    switch (s) {
      case 'Active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'On Route': return 'bg-brand-500/10 text-brand-400 border-brand-500/20';
      case 'Maintenance': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Available': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Idle': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
    }
  }
  const getLabel = (s: string) => {
    const labels: Record<string, string> = { 'Active': 'Activo', 'On Route': 'En Ruta', 'Maintenance': 'Mantenimiento', 'Available': 'Disponible', 'Idle': 'Inactivo', 'Off Duty': 'Fuera de Servicio' };
    return labels[s] || s;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStyles(status)}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' || status === 'On Route' ? 'bg-current animate-pulse' : 'bg-current'}`}></span>
      {getLabel(status)}
    </span>
  );
};

const Input = ({ label, error, ...props }: any) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
    <input
      {...props}
      className={`w-full bg-dark-950 border rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-colors ${error ? 'border-red-500/50' : 'border-white/10'}`}
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

export default FleetManager;
