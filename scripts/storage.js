import { supabase } from './supabase.js';

const STORAGE_KEY = 'metas_app_data';

/**
 * @typedef {Object} Goal
 * @property {string} id - Unique identifier (syncs with Supabase as UUID)
 * @property {string} user_id - Supabase user ID (cloud only)
 * @property {string} title - Goal name
 * @property {string} description - The 'Why' (purpose)
 * @property {number} target - Days per week (1-7)
 * @property {Object} weekly_progress - { weekId: [days] } (using snake_case to match DB)
 * @property {number} createdAt - Timestamp
 */

export const storage = {
    /**
     * Get all data from storage
     */
    getData: () => {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : { goals: [], settings: {} };
    },

    /**
     * Save data to local storage
     */
    _saveLocal: (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        storage._syncToCloud(data);
    },

    /**
     * Save goal
     */
    saveGoal: (goal) => {
        const data = storage.getData();
        const newGoal = {
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            weekly_progress: {},
            ...goal
        };
        data.goals.push(newGoal);
        storage._saveLocal(data);
        return data.goals;
    },

    /**
     * Update progress
     */
    updateProgress: (goalId, weekId, dayIndex, completed) => {
        const data = storage.getData();
        const goal = data.goals.find(g => g.id === goalId);
        if (goal) {
            if (!goal.weekly_progress[weekId]) {
                goal.weekly_progress[weekId] = Array(7).fill(false);
            }
            goal.weekly_progress[weekId][dayIndex] = completed;
            storage._saveLocal(data);
        }
        return data.goals;
    },

    /**
     * Delete a goal
     */
    deleteGoal: (goalId) => {
        const data = storage.getData();
        data.goals = data.goals.filter(g => g.id !== goalId);
        storage._saveLocal(data);
        storage._deleteFromCloud(goalId);
        return data.goals;
    },

    /**
     * Sync local state to Supabase
     */
    _syncToCloud: async (data) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Upsert all goals to Supabase
        const goalsToSync = data.goals.map(g => ({
            id: g.id,
            user_id: user.id,
            title: g.title,
            description: g.description,
            target: g.target,
            weekly_progress: g.weekly_progress
        }));

        const { error } = await supabase.from('goals').upsert(goalsToSync);
        if (error) console.error('Cloud Sync Error:', error);
    },

    /**
     * Delete from Supabase
     */
    _deleteFromCloud: async (goalId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('goals').delete().eq('id', goalId);
        if (error) console.error('Cloud Delete Error:', error);
    },

    /**
     * Pull all data from Supabase to Local
     */
    syncFromCloud: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase.from('goals').select('*');
        if (error) {
            console.error('Cloud Pull Error:', error);
            return;
        }

        if (data) {
            const localData = storage.getData();
            localData.goals = data; // Simple overwrite for now
            localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
        }
    },


    /**
     * Export all data as a JSON string
     */
    exportData: () => {
        const data = storage.getData();
        return JSON.stringify(data, null, 2);
    },

    /**
     * Import data from a JSON string
     */
    importData: (jsonString) => {
        try {
            const data = JSON.parse(jsonString);
            if (data && Array.isArray(data.goals)) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                return true;
            }
        } catch (e) {
            console.error('Error importing data:', e);
        }
        return false;
    }
};

