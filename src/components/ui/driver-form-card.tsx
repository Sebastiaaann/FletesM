import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Info, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Validation
import { validateChileanRut } from "@/utils/validationRules";
import { LicenseType } from "@/lib/validations/driver.schema";

// --- Component Props Interface ---
export interface DriverFormData {
  fullName: string;
  rut: string;
  licenseType: LicenseType;
  licenseExpiration: string;
  imageUrl?: string;
}

interface DriverFormCardProps {
  initialData?: Partial<DriverFormData>;
  onSubmit: (data: DriverFormData) => void;
  onCancel: () => void;
  className?: string;
}

// Chilean license types
const LICENSE_TYPES: LicenseType[] = ['A1', 'A2', 'A3', 'A4', 'A5', 'B', 'C', 'D', 'E', 'F'];

// --- Main Component ---
export const DriverFormCard: React.FC<DriverFormCardProps> = ({
  initialData,
  onSubmit,
  onCancel,
  className,
}) => {
  const [fullName, setFullName] = React.useState(initialData?.fullName || "");
  const [rut, setRut] = React.useState(initialData?.rut || "");
  const [licenseType, setLicenseType] = React.useState<LicenseType>(initialData?.licenseType || 'B');
  const [licenseExpiration, setLicenseExpiration] = React.useState(initialData?.licenseExpiration || "");
  const [imageUrl, setImageUrl] = React.useState<string | undefined>(initialData?.imageUrl);
  
  // Validation errors
  const [rutError, setRutError] = React.useState<string | null>(null);
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [expirationError, setExpirationError] = React.useState<string | null>(null);

  // Format RUT as user types
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9kK]/g, '');
    
    if (value.length > 1) {
      const body = value.slice(0, -1);
      const dv = value.slice(-1);
      value = `${body}-${dv}`;
    }
    
    setRut(value);
    setRutError(null);
  };

  // Validate RUT on blur
  const handleRutBlur = () => {
    const error = validateChileanRut(rut);
    setRutError(error);
  };

  // Validate expiration date
  const validateExpiration = (date: string): string | null => {
    if (!date) return "Fecha de vencimiento es requerida";
    
    const expirationDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (expirationDate < today) {
      return "La licencia está vencida";
    }
    
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const rutValidation = validateChileanRut(rut);
    const expirationValidation = validateExpiration(licenseExpiration);
    const nameValidation = !fullName.trim() ? "Nombre completo es requerido" : null;
    
    setRutError(rutValidation);
    setExpirationError(expirationValidation);
    setNameError(nameValidation);
    
    if (rutValidation || expirationValidation || nameValidation) {
      return;
    }
    
    onSubmit({ 
      fullName: fullName.trim(), 
      rut, 
      licenseType, 
      licenseExpiration,
      imageUrl 
    });
  };

  // --- Animation Variants for Framer Motion ---
  const FADE_IN_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      } 
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.15,
          },
        },
      }}
      className={cn(
        "relative w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-xl",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h3 variants={FADE_IN_VARIANTS} className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Agregar Conductor
        </motion.h3>
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Cerrar">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* --- Image Upload Section --- */}
        <motion.div variants={FADE_IN_VARIANTS} className="flex flex-col items-center gap-3 md:col-span-1">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-dashed border-slate-300 dark:border-slate-700">
              <AvatarImage src={imageUrl} alt={fullName || "Conductor"} />
              <AvatarFallback className="bg-slate-100 dark:bg-slate-800">
                <User className="h-8 w-8 text-slate-400" />
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Subir Imagen"
            >
              <Plus className="h-4 w-4 text-slate-500" />
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Foto del Conductor</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Máx. 1MB</p>
          </div>
          <Button type="button" variant="outline" size="sm" className="w-full">
            Agregar Imagen
          </Button>
        </motion.div>

        {/* --- Form Fields Section --- */}
        <div className="flex flex-col gap-4 md:col-span-2">
          {/* Nombre Completo */}
          <motion.div variants={FADE_IN_VARIANTS} className="grid w-full items-center gap-1.5">
            <Label htmlFor="fullName">
              Nombre Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="fullName"
              placeholder="Juan Pérez González"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setNameError(null);
              }}
              className={nameError ? "border-red-500" : ""}
              required
            />
            {nameError && (
              <p className="text-xs text-red-500 mt-1">{nameError}</p>
            )}
          </motion.div>

          {/* RUT */}
          <motion.div variants={FADE_IN_VARIANTS} className="grid w-full items-center gap-1.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="rut">
                RUT <span className="text-red-500">*</span>
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 cursor-pointer text-slate-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Formato: 12345678-9</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              type="text"
              id="rut"
              placeholder="12345678-9"
              value={rut}
              onChange={handleRutChange}
              onBlur={handleRutBlur}
              maxLength={10}
              className={rutError ? "border-red-500" : ""}
              required
            />
            {rutError && (
              <p className="text-xs text-red-500 mt-1">{rutError}</p>
            )}
          </motion.div>

          {/* Tipo de Licencia */}
          <motion.div variants={FADE_IN_VARIANTS} className="grid w-full items-center gap-1.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="licenseType">
                Tipo de Licencia <span className="text-red-500">*</span>
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 cursor-pointer text-slate-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clases A-F según normativa chilena</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              id="licenseType"
              value={licenseType}
              onChange={(e) => setLicenseType(e.target.value as LicenseType)}
              required
            >
              {LICENSE_TYPES.map((type) => (
                <option key={type} value={type}>
                  Clase {type}
                </option>
              ))}
            </Select>
          </motion.div>

          {/* Vencimiento de Licencia */}
          <motion.div variants={FADE_IN_VARIANTS} className="grid w-full items-center gap-1.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="licenseExpiration">
                Vencimiento Licencia <span className="text-red-500">*</span>
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 cursor-pointer text-slate-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Fecha de vencimiento de la licencia</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              type="date"
              id="licenseExpiration"
              value={licenseExpiration}
              onChange={(e) => {
                setLicenseExpiration(e.target.value);
                setExpirationError(null);
              }}
              min={new Date().toISOString().split('T')[0]}
              className={expirationError ? "border-red-500" : ""}
              required
            />
            {expirationError && (
              <p className="text-xs text-red-500 mt-1">{expirationError}</p>
            )}
          </motion.div>
        </div>

        {/* --- Form Actions --- */}
        <motion.div variants={FADE_IN_VARIANTS} className="flex justify-end gap-3 md:col-span-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Guardar Conductor
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};
