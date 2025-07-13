// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:3002/api',
    SOCKET_URL: 'http://localhost:3002'
};

// Application State
class AppState {
    constructor() {
        this.user = null;
        this.tasks = [];
        this.socket = null;
        this.theme = localStorage.getItem('theme') || 'light';
        this.currentSection = 'dashboard';
    }

    setUser(user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    }

    getUser() {
        if (!this.user) {
            const stored = localStorage.getItem('user');
            if (stored) {
                this.user = JSON.parse(stored);
            }
        }
        return this.user;
    }

    getToken() {
        return localStorage.getItem('token');
    }

    setToken(token) {
        localStorage.setItem('token', token);
    }

    clearAuth() {
        this.user = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    setTasks(tasks) {
        this.tasks = tasks;
    }

    addTask(task) {
        this.tasks.push(task);
    }

    updateTask(updatedTask) {
        const index = this.tasks.findIndex(t => t._id === updatedTask._id);
        if (index !== -1) {
            this.tasks[index] = updatedTask;
        }
    }

    removeTask(taskId) {
        this.tasks = this.tasks.filter(t => t._id !== taskId);
    }

    getTaskStats() {
        return {
            total: this.tasks.length,
            pending: this.tasks.filter(t => t.status === 'pending').length,
            'in-progress': this.tasks.filter(t => t.status === 'in-progress').length,
            completed: this.tasks.filter(t => t.status === 'completed').length
        };
    }
}

// Initialize app state
const appState = new AppState();

// API Helper
class API {
    static async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const token = appState.getToken();
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint);
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// Authentication Manager
class AuthManager {
    static async login(email, password) {
        try {
            const response = await API.post('/auth/login', { email, password });
            appState.setToken(response.token);
            appState.setUser(response.user);
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async register(userData) {
        try {
            const response = await API.post('/auth/register', userData);
            appState.setToken(response.token);
            appState.setUser(response.user);
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async logout() {
        try {
            appState.clearAuth();
            showSection('dashboard');
            showAuthModal();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    static async getProfile() {
        try {
            const response = await API.get('/auth/profile');
            appState.setUser(response.user);
            return response;
        } catch (error) {
            throw error;
        }
    }

    static isAuthenticated() {
        return !!appState.getToken() && !!appState.getUser();
    }
}

// Task Manager
class TaskManager {
    static async getAllTasks() {
        try {
            const response = await API.get('/tasks');
            appState.setTasks(response.tasks);
            return response.tasks;
        } catch (error) {
            throw error;
        }
    }

    static async createTask(taskData) {
        try {
            const response = await API.post('/tasks', taskData);
            appState.addTask(response.task);
            return response.task;
        } catch (error) {
            throw error;
        }
    }

    static async updateTask(taskId, updateData) {
        try {
            const response = await API.put(`/tasks/${taskId}`, updateData);
            appState.updateTask(response.task);
            return response.task;
        } catch (error) {
            throw error;
        }
    }

    static async deleteTask(taskId) {
        try {
            await API.delete(`/tasks/${taskId}`);
            appState.removeTask(taskId);
        } catch (error) {
            throw error;
        }
    }
}

// UI Utilities
function showLoading() {
    document.getElementById('loading-overlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('show');
}

function showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-title">${title || type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <button class="toast-close">&times;</button>
        </div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 5000);

    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    });
}

function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const navLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }

    // Update sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');

    appState.currentSection = sectionName;

    // Load section data
    switch (sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'motivation':
            loadMotivation();
            break;
    }
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function showAuthModal() {
    showModal('auth-modal');
}

// Dashboard Functions
async function loadDashboard() {
    try {
        if (!AuthManager.isAuthenticated()) {
            showAuthModal();
            return;
        }

        showLoading();
        
        // Load tasks and update stats
        await TaskManager.getAllTasks();
        updateStatsDisplay();
        updateRecentTasks();
        
        // Load daily quote
        loadDailyQuote();
        
        hideLoading();
    } catch (error) {
        hideLoading();
        showToast('Failed to load dashboard', 'error');
        console.error('Dashboard error:', error);
    }
}

function updateStatsDisplay() {
    const stats = appState.getTaskStats();
    
    document.getElementById('total-tasks').textContent = stats.total;
    document.getElementById('pending-tasks').textContent = stats.pending;
    document.getElementById('in-progress-tasks').textContent = stats['in-progress'];
    document.getElementById('completed-tasks').textContent = stats.completed;
}

function updateRecentTasks() {
    const recentTasks = appState.tasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const container = document.getElementById('recent-tasks');
    
    if (recentTasks.length === 0) {
        container.innerHTML = '<p class="text-muted">No tasks yet. Create your first task!</p>';
        return;
    }

    container.innerHTML = recentTasks.map(task => `
        <div class="task-card" data-task-id="${task._id}">
            <div class="task-header">
                <h4 class="task-title">${task.title}</h4>
                <span class="task-priority ${task.priority}">${task.priority}</span>
            </div>
            ${task.description ? `<p class="task-description">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>` : ''}
            <div class="task-meta">
                <div class="task-tags">
                    ${task.tags.map(tag => `<span class="task-tag">${tag}</span>`).join('')}
                </div>
                ${task.dueDate ? `<span class="task-due-date ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}">
                    <i class="fas fa-calendar"></i> ${formatDate(task.dueDate)}
                </span>` : ''}
            </div>
        </div>
    `).join('');
}

async function loadDailyQuote() {
    try {
        const response = await API.get('/quotes/daily');
        displayQuote(response.quote, 'daily-quote');
    } catch (error) {
        document.getElementById('daily-quote').innerHTML = '<p class="text-muted">Failed to load quote</p>';
        console.error('Quote error:', error);
    }
}

function displayQuote(quote, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="quote-text">"${quote.text}"</div>
        <div class="quote-author">— ${quote.author}</div>
    `;
}

// Task Functions
async function loadTasks() {
    try {
        if (!AuthManager.isAuthenticated()) {
            showAuthModal();
            return;
        }

        showLoading();
        await TaskManager.getAllTasks();
        updateTaskDisplay();
        hideLoading();
    } catch (error) {
        hideLoading();
        showToast('Failed to load tasks', 'error');
        console.error('Tasks error:', error);
    }
}

function updateTaskDisplay() {
    const pendingList = document.getElementById('pending-list');
    const inProgressList = document.getElementById('in-progress-list');
    const completedList = document.getElementById('completed-list');

    // Clear lists
    [pendingList, inProgressList, completedList].forEach(list => {
        if (list) list.innerHTML = '';
    });

    // Filter tasks
    const statusFilter = document.getElementById('status-filter')?.value || '';
    const priorityFilter = document.getElementById('priority-filter')?.value || '';
    const searchQuery = document.getElementById('task-search')?.value.toLowerCase() || '';

    let filteredTasks = appState.tasks;

    if (statusFilter) {
        filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }

    if (priorityFilter) {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }

    // Apply search filter
    if (searchQuery) {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchQuery) ||
            task.description.toLowerCase().includes(searchQuery) ||
            (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchQuery)))
        );
    }

    // Group by status
    const tasksByStatus = {
        pending: filteredTasks.filter(task => task.status === 'pending'),
        'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
        completed: filteredTasks.filter(task => task.status === 'completed')
    };

    // Update counts
    const pendingCount = document.getElementById('pending-count');
    const inProgressCount = document.getElementById('in-progress-count');
    const completedCount = document.getElementById('completed-count');

    if (pendingCount) pendingCount.textContent = tasksByStatus.pending.length;
    if (inProgressCount) inProgressCount.textContent = tasksByStatus['in-progress'].length;
    if (completedCount) completedCount.textContent = tasksByStatus.completed.length;

    // Render tasks
    Object.entries(tasksByStatus).forEach(([status, tasks]) => {
        const listId = status === 'in-progress' ? 'in-progress-list' : `${status}-list`;
        const list = document.getElementById(listId);
        
        if (!list) return;
        
        if (tasks.length === 0) {
            list.innerHTML = '<p class="text-muted">No tasks</p>';
            return;
        }

        list.innerHTML = tasks.map(task => createTaskCard(task)).join('');
    });
}

// Helper functions for task status management
function getNextStatus(currentStatus) {
    const statusFlow = {
        'pending': 'in-progress',
        'in-progress': 'completed',
        'completed': 'pending'
    };
    return statusFlow[currentStatus] || 'in-progress';
}

function getNextStatusLabel(currentStatus) {
    const statusLabels = {
        'pending': 'In Progress',
        'in-progress': 'Completed',
        'completed': 'Pending'
    };
    return statusLabels[currentStatus] || 'In Progress';
}

function createTaskCard(task) {
    return `
        <div class="task-card" data-task-id="${task._id}" draggable="true">
            <div class="task-header">
                <h4 class="task-title">${task.title}</h4>
                <span class="task-priority ${task.priority}">${task.priority}</span>
            </div>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
            <div class="task-meta">
                <div class="task-tags">
                    ${task.tags.map(tag => `<span class="task-tag">${tag}</span>`).join('')}
                </div>
                ${task.dueDate ? `<span class="task-due-date ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}">
                    <i class="fas fa-calendar"></i> ${formatDate(task.dueDate)}
                </span>` : ''}
            </div>
            <div class="task-actions">
                <div class="action-group-left">
                    <button class="task-action-btn" onclick="duplicateTask('${task._id}')" title="Duplicate Task">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="task-action-btn" onclick="moveTaskTo('${task._id}', '${getNextStatus(task.status)}')" title="Move to ${getNextStatusLabel(task.status)}">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                <div class="action-group-right">
                    <button class="task-action-btn" onclick="editTask('${task._id}')" title="Edit Task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn task-delete-btn" onclick="deleteTask('${task._id}')" title="Delete Task">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${task.status !== 'completed' ? `
                        <button class="task-action-btn task-complete-btn" onclick="markComplete('${task._id}')" title="Mark as Complete">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : `
                        <button class="task-action-btn task-undo-btn" onclick="moveTaskTo('${task._id}', 'in-progress')" title="Move back to In Progress">
                            <i class="fas fa-undo"></i>
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}

async function createTask(taskData) {
    try {
        showLoading();
        const task = await TaskManager.createTask(taskData);
        updateTaskDisplay();
        if (appState.currentSection === 'dashboard') {
            updateStatsDisplay();
            updateRecentTasks();
        }
        hideLoading();
        showToast('Task created successfully!', 'success');
        return task;
    } catch (error) {
        hideLoading();
        showToast('Failed to create task', 'error');
        throw error;
    }
}

async function editTask(taskId) {
    const task = appState.tasks.find(t => t._id == taskId);
    if (!task) return;

    // Populate form
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-due-date').value = task.dueDate ? task.dueDate.split('T')[0] : '';
    document.getElementById('task-tags').value = task.tags.join(', ');

    // Update modal
    document.getElementById('task-modal-title').textContent = 'Edit Task';
    document.getElementById('save-task').textContent = 'Update Task';
    document.getElementById('task-form').dataset.taskId = taskId;

    showModal('task-modal');
}

async function deleteTask(taskId) {
    const task = appState.tasks.find(t => t._id == taskId);
    if (!task) {
        showToast('Task not found', 'error');
        return;
    }

    // Create a more user-friendly confirmation dialog
    const confirmed = confirm(`Are you sure you want to delete the task "${task.title}"?\n\nThis action cannot be undone.`);
    if (!confirmed) return;

    try {
        showLoading();
        await TaskManager.deleteTask(taskId);
        updateTaskDisplay();
        if (appState.currentSection === 'dashboard') {
            updateStatsDisplay();
            updateRecentTasks();
        }
        hideLoading();
        showToast(`Task "${task.title}" deleted successfully!`, 'success');
    } catch (error) {
        hideLoading();
        showToast('Failed to delete task', 'error');
        console.error('Delete error:', error);
    }
}

async function markComplete(taskId) {
    try {
        showLoading();
        await TaskManager.updateTask(taskId, { status: 'completed' });
        updateTaskDisplay();
        if (appState.currentSection === 'dashboard') {
            updateStatsDisplay();
            updateRecentTasks();
        }
        hideLoading();
        showToast('Task marked as complete!', 'success');
    } catch (error) {
        hideLoading();
        showToast('Failed to update task', 'error');
        console.error('Update error:', error);
    }
}

// Profile Functions
async function loadProfile() {
    try {
        if (!AuthManager.isAuthenticated()) {
            showAuthModal();
            return;
        }

        const user = appState.getUser();
        document.getElementById('profile-name').value = user.name || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-role').value = user.role || '';
    } catch (error) {
        showToast('Failed to load profile', 'error');
        console.error('Profile error:', error);
    }
}

// Motivation Functions
async function loadMotivation() {
    try {
        if (!AuthManager.isAuthenticated()) {
            showAuthModal();
            return;
        }

        loadMotivationQuote();
        loadAITip();
    } catch (error) {
        showToast('Failed to load motivation content', 'error');
        console.error('Motivation error:', error);
    }
}

async function loadMotivationQuote() {
    try {
        const response = await API.get('/quotes/random');
        displayQuote(response.quote, 'motivation-quote');
    } catch (error) {
        document.getElementById('motivation-quote').innerHTML = '<p class="text-muted">Failed to load quote</p>';
        console.error('Quote error:', error);
    }
}

async function loadAITip() {
    try {
        const response = await API.get('/ai/tip');
        document.getElementById('ai-tip').innerHTML = `
            <div class="tip-text">${response.tip}</div>
        `;
    } catch (error) {
        document.getElementById('ai-tip').innerHTML = '<p class="text-muted">Failed to load AI tip</p>';
        console.error('AI tip error:', error);
    }
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function toggleTheme() {
    const currentTheme = appState.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    appState.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    
    // Update theme toggle icon
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function switchAuthTab(tabType) {
    // Update tabs
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = document.querySelector(`[data-tab="${tabType}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Update form
    const nameGroup = document.getElementById('name-group');
    const roleGroup = document.getElementById('role-group');
    const authTitle = document.getElementById('auth-title');
    const authSubmit = document.getElementById('auth-submit');
    const authSwitch = document.getElementById('auth-switch');

    if (tabType === 'register') {
        if (nameGroup) nameGroup.style.display = 'block';
        if (roleGroup) roleGroup.style.display = 'block';
        if (authTitle) authTitle.textContent = 'Create Account';
        if (authSubmit) authSubmit.textContent = 'Sign Up';
        if (authSwitch) authSwitch.innerHTML = 'Already have an account? <a href="#" id="switch-auth">Sign in</a>';
    } else {
        if (nameGroup) nameGroup.style.display = 'none';
        if (roleGroup) roleGroup.style.display = 'none';
        if (authTitle) authTitle.textContent = 'Welcome Back';
        if (authSubmit) authSubmit.textContent = 'Login';
        if (authSwitch) authSwitch.innerHTML = 'Don\'t have an account? <a href="#" id="switch-auth">Sign up</a>';
    }

    // Re-attach event listener to new switch link
    const switchAuthLink = document.getElementById('switch-auth');
    if (switchAuthLink) {
        switchAuthLink.addEventListener('click', (e) => {
            e.preventDefault();
            const currentTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'login';
            const newTab = currentTab === 'login' ? 'register' : 'login';
            switchAuthTab(newTab);
        });
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', appState.theme);
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = appState.theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
        });
    });

    // View All link handling
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href === '#tasks') {
                showSection('tasks');
            }
        });
    });

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // User menu
    const userAvatar = document.getElementById('user-avatar');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (userAvatar && dropdownMenu) {
        userAvatar.addEventListener('click', () => {
            dropdownMenu.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userAvatar.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AuthManager.logout();
        });
    }

    // Auth modal
    const authModal = document.getElementById('auth-modal');
    const closeAuthBtn = document.getElementById('close-auth');
    const authTabs = document.querySelectorAll('.tab-btn');
    const authForm = document.getElementById('auth-form');
    const switchAuthLink = document.getElementById('switch-auth');

    if (closeAuthBtn) {
        closeAuthBtn.addEventListener('click', () => {
            hideModal('auth-modal');
        });
    }

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.dataset.tab;
            switchAuthTab(tabType);
        });
    });

    if (switchAuthLink) {
        switchAuthLink.addEventListener('click', (e) => {
            e.preventDefault();
            const currentTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'login';
            const newTab = currentTab === 'login' ? 'register' : 'login';
            switchAuthTab(newTab);
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(authForm);
            const currentTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'login';

            try {
                showLoading();

                if (currentTab === 'login') {
                    await AuthManager.login(
                        formData.get('email'),
                        formData.get('password')
                    );
                } else {
                    await AuthManager.register({
                        name: formData.get('name'),
                        email: formData.get('email'),
                        password: formData.get('password'),
                        role: formData.get('role')
                    });
                }

                hideModal('auth-modal');
                showSection('dashboard');
                showToast(`${currentTab === 'login' ? 'Login' : 'Registration'} successful!`, 'success');
                hideLoading();
            } catch (error) {
                hideLoading();
                showToast(error.message, 'error');
            }
        });
    }

    // Task modal
    const taskModal = document.getElementById('task-modal');
    const addTaskBtn = document.getElementById('add-task-btn');
    const quickAddTaskBtn = document.getElementById('quick-add-task');
    const closeTaskModalBtn = document.getElementById('close-task-modal');
    const cancelTaskBtn = document.getElementById('cancel-task');
    const taskForm = document.getElementById('task-form');

    [addTaskBtn, quickAddTaskBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                // Reset form
                if (taskForm) {
                    taskForm.reset();
                    delete taskForm.dataset.taskId;
                }
                const taskModalTitle = document.getElementById('task-modal-title');
                const saveTaskBtn = document.getElementById('save-task');
                if (taskModalTitle) taskModalTitle.textContent = 'Add New Task';
                if (saveTaskBtn) saveTaskBtn.textContent = 'Save Task';
                showModal('task-modal');
            });
        }
    });

    [closeTaskModalBtn, cancelTaskBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                hideModal('task-modal');
            });
        }
    });

    if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(taskForm);
            const taskId = taskForm.dataset.taskId;

            const taskData = {
                title: formData.get('title'),
                description: formData.get('description'),
                priority: formData.get('priority'),
                status: formData.get('status'),
                dueDate: formData.get('dueDate') || null,
                tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            try {
                if (taskId) {
                    await TaskManager.updateTask(taskId, taskData);
                    showToast('Task updated successfully!', 'success');
                } else {
                    await createTask(taskData);
                }

                hideModal('task-modal');
                updateTaskDisplay();
                if (appState.currentSection === 'dashboard') {
                    updateStatsDisplay();
                    updateRecentTasks();
                }
            } catch (error) {
                showToast('Failed to save task', 'error');
            }
        });
    }

    // Filter change handlers
    const statusFilter = document.getElementById('status-filter');
    const priorityFilter = document.getElementById('priority-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', updateTaskDisplay);
    }
    if (priorityFilter) {
        priorityFilter.addEventListener('change', updateTaskDisplay);
    }

    // Refresh buttons
    const refreshQuote = document.getElementById('refresh-quote');
    const refreshMotivationQuote = document.getElementById('refresh-motivation-quote');
    const refreshAITip = document.getElementById('refresh-ai-tip');
    
    if (refreshQuote) refreshQuote.addEventListener('click', loadDailyQuote);
    if (refreshMotivationQuote) refreshMotivationQuote.addEventListener('click', loadMotivationQuote);
    if (refreshAITip) refreshAITip.addEventListener('click', loadAITip);

    // Modal backdrop clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Setup task search
    setupTaskSearch();

    // Make functions globally accessible
    window.duplicateTask = duplicateTask;
    window.moveTaskTo = moveTaskTo;
    window.editTask = editTask;
    window.deleteTask = deleteTask;
    window.markComplete = markComplete;
    window.viewAllTasks = viewAllTasks;
    window.quickAddTask = quickAddTask;
    window.clearSearch = clearSearch;
    window.exportTasks = exportTasks;
    window.updateProfile = updateProfile;
    window.changePassword = changePassword;
    window.clearAllFilters = clearAllFilters;

    // Profile form handling
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updateProfile();
        });
    }

    // Password form handling
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            changePassword();
        });
    }

    // Initialize app
    if (AuthManager.isAuthenticated()) {
        showSection('dashboard');
    } else {
        showAuthModal();
    }
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
});

// Additional Button Functions
async function viewAllTasks() {
    showSection('tasks');
}

async function quickAddTask() {
    // Reset form
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.reset();
        delete taskForm.dataset.taskId;
    }
    const taskModalTitle = document.getElementById('task-modal-title');
    const saveTaskBtn = document.getElementById('save-task');
    if (taskModalTitle) taskModalTitle.textContent = 'Quick Add Task';
    if (saveTaskBtn) saveTaskBtn.textContent = 'Save Task';
    showModal('task-modal');
}

async function filterByStatus(status) {
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.value = status;
        updateTaskDisplay();
    }
}

async function filterByPriority(priority) {
    const priorityFilter = document.getElementById('priority-filter');
    if (priorityFilter) {
        priorityFilter.value = priority;
        updateTaskDisplay();
    }
}

async function clearAllFilters() {
    const statusFilter = document.getElementById('status-filter');
    const priorityFilter = document.getElementById('priority-filter');
    if (statusFilter) statusFilter.value = '';
    if (priorityFilter) priorityFilter.value = '';
    updateTaskDisplay();
}

async function duplicateTask(taskId) {
    const task = appState.tasks.find(t => t._id == taskId);
    if (!task) {
        showToast('Task not found', 'error');
        return;
    }

    const duplicatedTask = {
        title: `Copy of ${task.title}`,
        description: task.description,
        priority: task.priority,
        status: 'pending', // Always start duplicated tasks as pending
        dueDate: task.dueDate,
        tags: [...(task.tags || [])] // Handle case where tags might be undefined
    };

    try {
        showLoading();
        await createTask(duplicatedTask);
        hideLoading();
        showToast('Task duplicated successfully!', 'success');
    } catch (error) {
        hideLoading();
        showToast('Failed to duplicate task', 'error');
        console.error('Duplicate task error:', error);
    }
}

async function moveTaskTo(taskId, newStatus) {
    try {
        showLoading();
        const task = appState.tasks.find(t => t._id == taskId);
        if (!task) {
            hideLoading();
            showToast('Task not found', 'error');
            return;
        }

        await TaskManager.updateTask(taskId, { status: newStatus });
        updateTaskDisplay();
        if (appState.currentSection === 'dashboard') {
            updateStatsDisplay();
            updateRecentTasks();
        }
        hideLoading();
        
        // Better status display names
        const statusNames = {
            'pending': 'Pending',
            'in-progress': 'In Progress',
            'completed': 'Completed'
        };
        
        showToast(`Task moved to ${statusNames[newStatus] || newStatus}!`, 'success');
    } catch (error) {
        hideLoading();
        showToast('Failed to move task', 'error');
        console.error('Move task error:', error);
    }
}

async function changePriority(taskId, newPriority) {
    try {
        showLoading();
        const task = appState.tasks.find(t => t._id == taskId);
        if (!task) {
            hideLoading();
            showToast('Task not found', 'error');
            return;
        }

        await TaskManager.updateTask(taskId, { priority: newPriority });
        updateTaskDisplay();
        if (appState.currentSection === 'dashboard') {
            updateStatsDisplay();
            updateRecentTasks();
        }
        hideLoading();
        
        // Better priority display names
        const priorityNames = {
            'low': 'Low',
            'medium': 'Medium', 
            'high': 'High',
            'urgent': 'Urgent'
        };
        
        showToast(`Priority changed to ${priorityNames[newPriority] || newPriority}!`, 'success');
    } catch (error) {
        hideLoading();
        showToast('Failed to change priority', 'error');
        console.error('Change priority error:', error);
    }
}

// Enhanced Profile Functions
async function updateProfile() {
    const nameInput = document.getElementById('profile-name');
    const name = nameInput?.value;
    
    if (name && name !== appState.user.name) {
        // Update user in state (in real app, this would call API)
        appState.user.name = name;
        appState.setUser(appState.user);
        showToast('Profile updated successfully!', 'success');
    }
}

async function changePassword() {
    const currentPassword = document.getElementById('current-password')?.value;
    const newPassword = document.getElementById('new-password')?.value;
    const confirmPassword = document.getElementById('confirm-password')?.value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('All password fields are required', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    // In a real app, this would call the API
    showToast('Password changed successfully!', 'success');
    
    // Clear form
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

// Enhanced Theme Functions
function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    appState.theme = themeName;
    localStorage.setItem('theme', themeName);
    
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = themeName === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    showToast(`Switched to ${themeName} theme`, 'info');
}

// Search and Export Functions
function clearSearch() {
    const searchInput = document.getElementById('task-search');
    if (searchInput) {
        searchInput.value = '';
        updateTaskDisplay();
    }
}

async function exportTasks() {
    const tasks = appState.tasks;
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Title,Description,Status,Priority,Due Date,Created Date\n"
        + tasks.map(task => {
            const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '';
            const createdDate = task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '';
            return `"${task.title}","${task.description}","${task.status}","${task.priority}","${dueDate}","${createdDate}"`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tasks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Tasks exported successfully!', 'success');
}

// Enhanced Search Functionality
function setupTaskSearch() {
    const searchInput = document.getElementById('task-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            updateTaskDisplay();
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                clearSearch();
            }
        });
    }
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when user is typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            // Allow some shortcuts even in input fields
            if (e.key === 'Escape') {
                e.target.blur(); // Remove focus from input
                document.querySelectorAll('.modal.show').forEach(modal => {
                    modal.classList.remove('show');
                });
            }
            return;
        }
        
        // Ctrl+N or Cmd+N - New Task
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            quickAddTask();
        }
        
        // Ctrl+/ - Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            const searchInput = document.getElementById('task-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Ctrl+E - Export tasks
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportTasks();
        }
        
        // Ctrl+F - Focus search (alternative)
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('task-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Number keys for quick navigation
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    showSection('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    showSection('tasks');
                    break;
                case '3':
                    e.preventDefault();
                    showSection('profile');
                    break;
            }
        }
        
        // Escape - Close modals and clear search
        if (e.key === 'Escape') {
            // Close modals first
            const openModals = document.querySelectorAll('.modal.show');
            if (openModals.length > 0) {
                openModals.forEach(modal => {
                    modal.classList.remove('show');
                });
            } else {
                // If no modals are open, clear search
                clearSearch();
            }
        }
        
        // Delete key - Delete selected task (if implemented)
        if (e.key === 'Delete' && e.ctrlKey) {
            e.preventDefault();
            // This could be enhanced to work with selected tasks
            showToast('Tip: Use the delete button on individual tasks', 'info');
        }
    });
}
