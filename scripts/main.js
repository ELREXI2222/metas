/**
 * Main Application Module
 * Orchestrates other modules and handles events.
 */
import { storage } from './storage.js';
import { logic } from './logic.js';
import { ui } from './ui.js';
import { auth } from './auth.js';

const elements = {
    mainContent: document.getElementById('main-content'),
    btnAdd: document.getElementById('btn-add'),
    totalScore: document.getElementById('total-score')
};

let currentUser = null;
let currentTab = 'btn-home';

/**
 * Initialize the application
 */
async function init() {
    setupEventListeners();

    // Listen for auth changes
    auth.onAuthStateChange(async (event, user) => {
        currentUser = user;
        if (event === 'SIGNED_IN') {
            await storage.syncFromCloud();
        }
        renderApp();
    });

    // Initial user check
    currentUser = await auth.getUser();
    renderApp();
}

/**
 * Main render function
 */
function renderApp() {
    const data = storage.getData();
    const weekId = logic.getCurrentWeekId();

    if (currentTab === 'btn-home') {
        ui.renderGoals(data.goals, elements.mainContent);
    } else {
        ui.renderSettings(elements.mainContent, currentUser);
        setupSettingsEvents();
    }

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

    // Navigation
    document.getElementById('btn-home').addEventListener('click', (e) => {
        currentTab = 'btn-home';
        setActiveTab('btn-home');
        renderApp();
    });

    document.getElementById('btn-stats').addEventListener('click', (e) => {
        currentTab = 'btn-stats';
        setActiveTab('btn-stats');
        renderApp();
    });
}

function setActiveTab(id) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function setupSettingsEvents() {
    const btnExport = document.getElementById('btn-export');
    const btnImportTrigger = document.getElementById('btn-import-trigger');
    const importFile = document.getElementById('import-file');
    const btnLoginTrigger = document.getElementById('btn-login-trigger');
    const btnLogout = document.getElementById('btn-logout');

    if (btnLoginTrigger) {
        btnLoginTrigger.onclick = () => {
            ui.showAuthModal(
                (email, pass) => auth.signUp(email, pass),
                (email, pass) => auth.signIn(email, pass)
            );
        };
    }

    if (btnLogout) {
        btnLogout.onclick = () => auth.signOut();
    }

    if (btnExport) {
        btnExport.onclick = () => {
            const data = storage.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `metas_respaldo_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        };
    }

    if (btnImportTrigger && importFile) {
        btnImportTrigger.onclick = () => importFile.click();
        importFile.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const success = storage.importData(event.target.result);
                    if (success) {
                        alert('¡Datos importados con éxito!');
                        document.getElementById('btn-home').click();
                    } else {
                        alert('Error al importar el archivo. Verifica el formato.');
                    }
                };
                reader.readAsText(file);
            }
        };
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
