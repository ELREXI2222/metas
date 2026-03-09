/**
 * Storage Module
 * Handles persistence of goals and progress using localStorage.
 */

const STORAGE_KEY = 'metas_app_data';

/**
 * @typedef {Object} Goal
 * @property {string} id - Unique identifier
 * @property {string} title - Goal name
 * @property {string} description - The 'Why' (purpose)
 * @property {number} target - Days per week (1-7)
 * @property {Object} weeklyProgress - { weekId: [days] }
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
     * Save goal to storage
     */
    saveGoal: (goal) => {
        const data = storage.getData();
        data.goals.push({
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            weeklyProgress: {},
            ...goal
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data.goals;
    },

    /**
     * Update progress for a specific goal and week
     */
    updateProgress: (goalId, weekId, dayIndex, completed) => {
        const data = storage.getData();
        const goal = data.goals.find(g => g.id === goalId);
        if (goal) {
            if (!goal.weeklyProgress[weekId]) {
                goal.weeklyProgress[weekId] = Array(7).fill(false);
            }
            goal.weeklyProgress[weekId][dayIndex] = completed;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        return data.goals;
    },

    /**
     * Delete a goal
     */
    deleteGoal: (goalId) => {
        const data = storage.getData();
        data.goals = data.goals.filter(g => g.id !== goalId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data.goals;
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

