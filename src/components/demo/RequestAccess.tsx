/**
 * RequestAccess - Vista para que usuarios demo soliciten acceso completo
 */

import { useState } from 'react';
import { useClerkAuth } from '@hooks/useClerkAuth';
import { Send, CheckCircle, ArrowLeft } from 'lucide-react';
import { showToast } from '@components/common/Toast';
import { useStore } from '@store/useStore';
import { AppView } from '@/types';

export function RequestAccess() {
    const { profile } = useClerkAuth();
    const { setView } = useStore();
    const [formData, setFormData] = useState({
        requestedRole: 'fleet_manager',
        company: '',
        reason: '',
        phone: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Aquí se enviaría la solicitud a tu backend
            // Por ahora, simulamos el envío
            await new Promise(resolve => setTimeout(resolve, 1500));

            // En producción, esto enviaría un email al admin o crearía un registro en la DB
            console.log('Solicitud de acceso:', {
                userId: profile?.id,
                email: profile?.email,
                ...formData,
            });

            setSubmitted(true);
            showToast.success(
                'Solicitud Enviada',
                'Tu solicitud ha sido enviada. Te contactaremos pronto.'
            );
        } catch (error) {
            showToast.error('Error', 'No se pudo enviar la solicitud. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">¡Solicitud Enviada!</h2>
                        <p className="text-slate-400">
                            Hemos recibido tu solicitud de acceso. Un administrador la revisará pronto y te contactará.
                        </p>
                    </div>

                    <button
                        onClick={() => setView(AppView.DASHBOARD)}
                        className="flex items-center gap-2 mx-auto px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-all duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-950 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => setView(AppView.DASHBOARD)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </button>

                    <h1 className="text-3xl font-bold text-white mb-2">
                        Solicitar Acceso Completo
                    </h1>
                    <p className="text-slate-400">
                        Completa el formulario para solicitar acceso completo a FleetesM
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-dark-900 rounded-2xl border border-white/10 p-6 space-y-6">
                    {/* User Info (Read-only) */}
                    <div className="bg-dark-800/50 rounded-lg p-4 border border-white/5">
                        <h3 className="text-sm font-semibold text-slate-400 mb-3">Tu Información</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Nombre:</span>
                                <span className="text-white font-medium">{profile?.full_name || 'No especificado'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Email:</span>
                                <span className="text-white font-medium">{profile?.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Requested Role */}
                    <div>
                        <label htmlFor="requestedRole" className="block text-sm font-medium text-slate-300 mb-2">
                            Rol Solicitado *
                        </label>
                        <select
                            id="requestedRole"
                            name="requestedRole"
                            value={formData.requestedRole}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        >
                            <option value="fleet_manager">Gestor de Flota</option>
                            <option value="driver">Conductor</option>
                            <option value="admin">Administrador</option>
                        </select>
                        <p className="mt-1 text-xs text-slate-500">
                            Selecciona el rol que mejor se ajuste a tus necesidades
                        </p>
                    </div>

                    {/* Company */}
                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-2">
                            Empresa *
                        </label>
                        <input
                            type="text"
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            required
                            placeholder="Nombre de tu empresa"
                            className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                            Teléfono *
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="+56 9 1234 5678"
                            className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-slate-300 mb-2">
                            Motivo de la Solicitud *
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            required
                            rows={4}
                            placeholder="Cuéntanos por qué necesitas acceso completo a FleetesM..."
                            className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Mínimo 20 caracteres
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || formData.reason.length < 20}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Enviar Solicitud
                            </>
                        )}
                    </button>
                </form>

                {/* Info Box */}
                <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm text-blue-300">
                        <strong>Nota:</strong> Un administrador revisará tu solicitud en un plazo de 24-48 horas.
                        Recibirás un email cuando tu acceso sea aprobado.
                    </p>
                </div>
            </div>
        </div>
    );
}
