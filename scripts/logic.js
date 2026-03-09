/**
 * Logic Module
 * Handles progress calculations and date helper functions.
 */

export const logic = {
    /**
     * Get current week identifier (YYYY-WW)
     */
    getCurrentWeekId: () => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now - startOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
        return `${now.getFullYear()}-W${weekNum}`;
    },

    /**
     * Calculate progress for a single goal in a specific week
     */
    calculateGoalProgress: (goal, weekId) => {
        const progress = goal.weeklyProgress[weekId] || Array(7).fill(false);
        const completedCount = progress.filter(Boolean).length;
        const percentage = Math.min((completedCount / goal.target) * 100, 100);
        return {
            completedCount,
            target: goal.target,
            percentage: Math.round(percentage)
        };
    },

    /**
     * Calculate total weekly score (0-100)
     */
    calculateTotalScore: (goals, weekId) => {
        if (goals.length === 0) return 0;

        let totalWeightedProgress = 0;
        goals.forEach(goal => {
            const { percentage } = logic.calculateGoalProgress(goal, weekId);
            totalWeightedProgress += percentage;
        });

        return Math.round(totalWeightedProgress / goals.length);
    },

    /**
     * Day names for the grid
     */
    getDayNames: () => ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
};
