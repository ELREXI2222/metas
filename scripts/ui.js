/**
 * UI Module
 * Handles DOM manipulation and template rendering.
 */
import { logic } from './logic.js';

export const ui = {
    /**
     * Render the list of goals
     */
    renderGoals: (goals, container) => {
        const weekId = logic.getCurrentWeekId();

        if (goals.length === 0) {
            container.innerHTML = `
                <div class="card fade-in" style="text-align: center; padding: 3rem 1.5rem;">
                    <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Aún no tienes metas registradas.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('btn-add').click()">
                        Crear mi primera meta
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = goals.map(goal => {
            const { completedCount, target, percentage } = logic.calculateGoalProgress(goal, weekId);
            const progress = goal.weeklyProgress[weekId] || Array(7).fill(false);
            const dayNames = logic.getDayNames();

            return `
                <div class="card meta-card fade-in" data-id="${goal.id}">
                    <div class="meta-header">
                        <div style="flex: 1">
                            <h3 class="meta-title">${goal.title}</h3>
                            <p class="meta-why">${goal.description}</p>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem">
                            <span style="font-size: 0.85rem; font-weight: 600; color: var(--secondary)">
                                ${completedCount}/${target}
                            </span>
                            <button class="btn-delete" data-id="${goal.id}" aria-label="Eliminar meta" style="background: none; border: none; font-size: 1rem; cursor: pointer; padding: 4px; color: rgba(239, 68, 68, 0.4)">✕</button>
                        </div>
                    </div>


                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${percentage}%"></div>
                    </div>

                    <div class="days-grid">
                        ${progress.map((checked, index) => `
                            <div class="day-item">
                                <span class="day-label">${dayNames[index]}</span>
                                <div class="day-check ${checked ? 'checked' : ''}" 
                                     data-goal-id="${goal.id}" 
                                     data-day-index="${index}">
                                    ${checked ? '✓' : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Show the "Add Goal" modal
     */
    showAddModal: (onSave, onCancel) => {
        const modal = document.createElement('div');
        modal.className = 'modal fade-in';
        modal.innerHTML = `
            <div class="card modal-content slide-up">
                <h2 style="margin-bottom: 1.5rem; text-align: center">Nueva Meta</h2>
                <form id="goal-form">
                    <div class="form-group">
                        <label>¿Qué quieres lograr?</label>
                        <input type="text" id="goal-title" placeholder="Ej: Correr" required>
                    </div>
                    <div class="form-group">
                        <label>¿Para qué quieres lograrlo?</label>
                        <textarea id="goal-description" placeholder="Ej: Para tener mejor salud" rows="2" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Frecuencia semanal (días)</label>
                        <select id="goal-target">
                            <option value="1">1 día</option>
                            <option value="2">2 días</option>
                            <option value="3" selected>3 días</option>
                            <option value="4">4 días</option>
                            <option value="5">5 días</option>
                            <option value="6">6 días</option>
                            <option value="7">7 días</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                        <button type="button" class="btn btn-ghost" id="btn-cancel">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#goal-form').onsubmit = (e) => {
            e.preventDefault();
            const goal = {
                title: modal.querySelector('#goal-title').value,
                description: modal.querySelector('#goal-description').value,
                target: parseInt(modal.querySelector('#goal-target').value)
            };
            onSave(goal);
            modal.remove();
        };

        modal.querySelector('#btn-cancel').onclick = () => {
            modal.remove();
            if (onCancel) onCancel();
        };
    },

    /**
     * Update the total weekly score in the header
     */
    updateHeaderScore: (score) => {
        const scoreEl = document.getElementById('total-score');
        if (scoreEl) {
            scoreEl.innerText = score;
        }
    },

    /**
     * Render the settings/stats view
     */
    renderSettings: (container, user) => {
        container.innerHTML = `
            <div class="card fade-in">
                <h2 style="margin-bottom: 1rem">Cuenta y Sincronización</h2>
                
                ${user ? `
                    <div style="background: rgba(139, 92, 246, 0.1); padding: 1rem; border-radius: 0.75rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 40px; height: 40px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                            ${user.email[0].toUpperCase()}
                        </div>
                        <div style="flex: 1">
                            <p style="font-size: 0.9rem; font-weight: 600;">${user.email}</p>
                            <p style="font-size: 0.75rem; color: var(--text-muted);">Sincronización activa</p>
                        </div>
                        <button id="btn-logout" class="btn btn-ghost" style="width: auto; padding: 0.5rem 1rem; color: var(--accent-red)">Salir</button>
                    </div>
                ` : `
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 0.75rem; margin-bottom: 1.5rem; text-align: center;">
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
                            Inicia sesión para sincronizar tus metas entre dispositivos.
                        </p>
                        <button id="btn-login-trigger" class="btn btn-primary">Iniciar Sesión / Registro</button>
                    </div>
                `}

                <h3 style="margin-bottom: 1rem; font-size: 1rem;">Respaldo Manual</h3>
                <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 1rem;">
                    Incluso con la nube, te recomendamos exportar tus datos ocasionalmente.
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <button id="btn-export" class="btn btn-ghost" style="border: 1px solid var(--glass-border)">
                        💾 Exportar Mis Datos (JSON)
                    </button>
                    
                    <div style="position: relative;">
                        <button id="btn-import-trigger" class="btn btn-ghost" style="border: 1px dashed var(--glass-border)">
                            📂 Importar Datos
                        </button>
                        <input type="file" id="import-file" style="display: none;" accept=".json">
                    </div>
                </div>

                <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--glass-border)">
                    <p style="font-size: 0.75rem; color: var(--text-muted); text-align: center;">
                        Versión 1.2 - Cloud Sync Enabled
                    </p>
                </div>
            </div>
        `;
    },

    /**
     * Show the Auth modal
     */
    showAuthModal: (onSignUp, onSignIn) => {
        const modal = document.createElement('div');
        modal.className = 'modal fade-in';
        modal.innerHTML = `
            <div class="card modal-content slide-up">
                <h2 id="auth-title" style="margin-bottom: 1.5rem; text-align: center">Iniciar Sesión</h2>
                <form id="auth-form">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="auth-email" placeholder="tu@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" id="auth-password" placeholder="••••••••" required minlength="6">
                    </div>
                    <div id="auth-error" style="color: var(--accent-red); font-size: 0.8rem; margin-bottom: 1rem; display: none;"></div>
                    
                    <button type="submit" class="btn btn-primary" id="btn-auth-submit">Entrar</button>
                    <button type="button" class="btn btn-ghost" id="btn-auth-toggle" style="margin-top: 0.5rem; font-size: 0.85rem">
                        ¿No tienes cuenta? Regístrate
                    </button>
                    <button type="button" class="btn btn-ghost" id="btn-auth-cancel" style="margin-top: 1rem">Cancelar</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        let isLogin = true;
        const toggleBtn = modal.querySelector('#btn-auth-toggle');
        const title = modal.querySelector('#auth-title');
        const submitBtn = modal.querySelector('#btn-auth-submit');
        const errorEl = modal.querySelector('#auth-error');

        toggleBtn.onclick = () => {
            isLogin = !isLogin;
            title.innerText = isLogin ? 'Iniciar Sesión' : 'Crear Cuenta';
            submitBtn.innerText = isLogin ? 'Entrar' : 'Registrarse';
            toggleBtn.innerText = isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra';
        };

        modal.querySelector('#auth-form').onsubmit = async (e) => {
            e.preventDefault();
            const email = modal.querySelector('#auth-email').value;
            const password = modal.querySelector('#auth-password').value;

            errorEl.style.display = 'none';
            submitBtn.disabled = true;
            submitBtn.innerText = 'Procesando...';

            try {
                if (isLogin) {
                    await onSignIn(email, password);
                } else {
                    await onSignUp(email, password);
                }
                modal.remove();
            } catch (err) {
                errorEl.innerText = err.message || 'Ocurrió un error';
                errorEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.innerText = isLogin ? 'Entrar' : 'Registrarse';
            }
        };

        modal.querySelector('#btn-auth-cancel').onclick = () => modal.remove();
    }
};


