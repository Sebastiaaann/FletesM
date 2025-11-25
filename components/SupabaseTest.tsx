import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { CheckCircle2, XCircle, Loader2, Database } from 'lucide-react';

const SupabaseTest: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [routesCount, setRoutesCount] = useState(0);
  const [vehiclesCount, setVehiclesCount] = useState(0);
  const [driversCount, setDriversCount] = useState(0);

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Probando conexión...');

    try {
      // Test 1: Conexión básica
      const { data: routes, error: routesError } = await supabase.from('routes').select('*');
      if (routesError) throw routesError;

      // Test 2: Contar vehículos
      const { data: vehicles, error: vehiclesError } = await supabase.from('vehicles').select('*');
      if (vehiclesError) throw vehiclesError;

      // Test 3: Contar conductores
      const { data: drivers, error: driversError } = await supabase.from('drivers').select('*');
      if (driversError) throw driversError;

      setRoutesCount(routes?.length || 0);
      setVehiclesCount(vehicles?.length || 0);
      setDriversCount(drivers?.length || 0);

      setStatus('success');
      setMessage('✅ Conexión exitosa a Supabase');
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Error: ${error.message}`);
      console.error('Supabase test error:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-dark-900 border border-white/10 rounded-xl p-4 shadow-2xl max-w-sm">
      <div className="flex items-center gap-3 mb-3">
        <Database className="w-5 h-5 text-brand-500" />
        <h3 className="text-white font-bold">Test Supabase</h3>
      </div>

      <button
        onClick={testConnection}
        disabled={status === 'testing'}
        className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 mb-3 transition-colors"
      >
        {status === 'testing' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Probando...
          </>
        ) : (
          'Probar Conexión'
        )}
      </button>

      {status !== 'idle' && (
        <div className="space-y-2">
          <div className={`flex items-center gap-2 text-sm ${
            status === 'success' ? 'text-green-400' : status === 'error' ? 'text-red-400' : 'text-slate-400'
          }`}>
            {status === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {status === 'error' && <XCircle className="w-4 h-4" />}
            {status === 'testing' && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{message}</span>
          </div>

          {status === 'success' && (
            <div className="mt-3 space-y-1 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Rutas:</span>
                <span className="text-white font-bold">{routesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Vehículos:</span>
                <span className="text-white font-bold">{vehiclesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Conductores:</span>
                <span className="text-white font-bold">{driversCount}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;
