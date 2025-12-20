/**
 * Demo Restrictions Utilities
 * Funciones para restringir acciones y datos en modo demo
 */

import { showToast } from '@components/common/Toast';
import type { AppRole } from '@/types/auth.types';

/**
 * Verifica si el usuario está en modo demo
 */
export function isDemoMode(role?: AppRole): boolean {
    return role === 'demo';
}

/**
 * Previene que usuarios demo realicen acciones
 * Retorna true si la acción fue bloqueada
 */
export function preventDemoAction(
    role?: AppRole,
    actionName: string = 'esta acción'
): boolean {
    if (isDemoMode(role)) {
        showToast.warning(
            'Modo Demo',
            `No puedes realizar ${actionName} en modo demo. Solicita acceso completo.`
        );
        return true; // Acción bloqueada
    }
    return false; // Acción permitida
}

/**
 * Retorna datos de demo o datos reales según el rol
 */
export function getDemoData<T>(realData: T, demoData: T, role?: AppRole): T {
    return isDemoMode(role) ? demoData : realData;
}

/**
 * Wrapper para funciones que no deben ejecutarse en modo demo
 */
export function withDemoCheck<T extends (...args: any[]) => any>(
    fn: T,
    role?: AppRole,
    actionName?: string
): T {
    return ((...args: Parameters<T>) => {
        if (preventDemoAction(role, actionName)) {
            return;
        }
        return fn(...args);
    }) as T;
}
