/**
 * Auth Module
 * Handles login, logout, and auth state management.
 */
import { supabase } from './supabase.js';

export const auth = {
    /**
     * Get current session/user
     */
    getUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    /**
     * Sign up a new user
     */
    signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data.user;
    },

    /**
     * Sign in an existing user
     */
    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data.user;
    },

    /**
     * Sign out
     */
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /**
     * Listen for auth changes
     */
    onAuthStateChange: (callback) => {
        supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session?.user || null);
        });
    }
};
