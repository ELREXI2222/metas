/**
 * Main Application Module
 * Orchestrates other modules and handles events.
 */
import { storage } from './storage.js';
import { logic } from './logic.js';
import { ui } from './ui.js';

const elements = {
    mainContent: document.getElementById('main-content'),
    btnAdd: document.getElementById('btn-add'),
    totalScore: document.getElementById('total-score')
};

/**
 * Initialize the application
 */
function init() {
    renderApp();
    setupEventListeners();
}

/**
 * Main render function
 */
function renderApp() {
    const data = storage.getData();
    const weekId = logic.getCurrentWeekId();

    // Render Goals
    ui.renderGoals(data.goals, elements.mainContent);

    // Update Score
    const score = logic.calculateTotalScore(data.goals, weekId);
    ui.updateHeaderScore(score);
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
    // Add Meta Button
    elements.btnAdd.addEventListener('click', () => {
        ui.showAddModal((newGoal) => {
            storage.saveGoal(newGoal);
            renderApp();
        });
    });

    // Delegated Event for Day Checkboxes & Delete
    elements.mainContent.addEventListener('click', (e) => {
        const dayCheck = e.target.closest('.day-check');
        const deleteBtn = e.target.closest('.btn-delete');

        if (dayCheck) {
            const goalId = dayCheck.dataset.goalId;
            const dayIndex = parseInt(dayCheck.dataset.dayIndex);
            const isChecked = dayCheck.classList.contains('checked');
            const weekId = logic.getCurrentWeekId();

            storage.updateProgress(goalId, weekId, dayIndex, !isChecked);
            renderApp();
        }

        if (deleteBtn) {
            if (confirm('¿Estás seguro de que quieres eliminar esta meta?')) {
                storage.deleteGoal(deleteBtn.dataset.id);
                renderApp();
            }
        }
    });


    // Navigation (Demo/Future)
    document.querySelectorAll('.nav-item:not(.primary)').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Logic for switching tabs could go here
        });
    });
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
