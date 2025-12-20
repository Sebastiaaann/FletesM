/**
 * useClerkAuth - Custom hook to integrate Clerk with existing app structure
 * Maintains compatibility with UserProfile interface
 */

import { useUser, useAuth as useClerkAuthHook } from '@clerk/clerk-react';
import { useMemo, useCallback } from 'react';
import type { UserProfile, AppRole } from '../types/auth.types';

export function useClerkAuth() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut: clerkSignOut } = useClerkAuthHook();

    // Transform Clerk user to UserProfile structure
    const profile: UserProfile | null = useMemo(() => {
        if (!user) return null;

        // Extract role from Clerk user metadata (publicMetadata)
        // Si no hay rol asignado, el usuario está en modo demo
        const role = (user.publicMetadata?.role as AppRole) || 'demo';

        return {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            full_name: user.fullName || user.firstName || '',
            role,
            created_at: user.createdAt?.toISOString() || new Date().toISOString(),
            updated_at: user.updatedAt?.toISOString() || new Date().toISOString(),
        };
    }, [user]);

    // Role checking function
    const hasRole = useCallback((role: AppRole | AppRole[]): boolean => {
        if (!profile) return false;
        if (Array.isArray(role)) return role.includes(profile.role);
        return profile.role === role;
    }, [profile]);

    // Demo user detection
    const isDemoUser = useCallback((): boolean => {
        return profile?.role === 'demo';
    }, [profile]);

    // Sign out wrapper
    const signOut = useCallback(async (): Promise<{ error: Error | null }> => {
        try {
            await clerkSignOut();
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    }, [clerkSignOut]);

    return {
        user,
        profile,
        loading: !isLoaded,
        isAuthenticated: isSignedIn || false,
        isDemoUser,
        signOut,
        hasRole,
        // Compatibility with old auth context
        session: user ? { user } : null,
    };
}
