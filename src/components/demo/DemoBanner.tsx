/**
 * DemoBanner - Banner informativo para usuarios en modo demo
 * Se muestra en la parte superior de la aplicación
 */

import { AlertCircle, Send } from 'lucide-react';
import { useClerkAuth } from '@hooks/useClerkAuth';
import { useStore } from '@store/useStore';
import { AppView } from '@/types';

export function DemoBanner() {
    const { isDemoUser, profile } = useClerkAuth();
    const { setView } = useStore();

    if (!isDemoUser()) return null;

    const handleRequestAccess = () => {
        setView(AppView.REQUEST_ACCESS);
    };

    return (
        <div className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-sm border-b border-amber-600/50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="text-sm font-semibold text-white">
                                Modo Demo Activo
                            </span>
                            <span className="text-xs text-amber-50">
                                Acceso limitado. Solicita acceso completo para usar todas las funcionalidades.
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleRequestAccess}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap hover:scale-105 active:scale-95"
                    >
                        <Send className="w-4 h-4" />
                        <span>Solicitar Acceso</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
