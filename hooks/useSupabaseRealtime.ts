import { useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import toast from 'react-hot-toast';

export const useSupabaseRealtime = () => {
    useEffect(() => {
        const channel = supabase
            .channel('public:vehicles')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'vehicles',
                },
                (payload) => {
                    console.log('Change received!', payload);
                    if (payload.eventType === 'INSERT') {
                        toast.success('Nuevo vehículo añadido');
                    } else if (payload.eventType === 'UPDATE') {
                        toast('Vehículo actualizado', { icon: '🔄' });
                    } else if (payload.eventType === 'DELETE') {
                        toast.error('Vehículo eliminado');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);
};
