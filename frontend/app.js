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
            if (appState.socket) {
                appState.socket.disconnect();
            }
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

// Socket Manager
class SocketManager {
    static connect() {
        // Check if io is available
        if (typeof io === 'undefined') {
            console.warn('Socket.io not available - real-time features disabled');
            return;
        }

        if (!appState.socket) {
            appState.socket = io(CONFIG.SOCKET_URL, {
                auth: {
                    token: appState.getToken()
                }
            });

            appState.socket.on('connect', () => {
                console.log('Connected to server');
            });

            appState.socket.on('taskCreated', (task) => {
                appState.addTask(task);
                updateTaskDisplay();
                showToast('New task created!', 'success');
            });

            appState.socket.on('taskUpdated', (task) => {
                appState.updateTask(task);
                updateTaskDisplay();
                showToast('Task updated!', 'info');
            });

            appState.socket.on('taskDeleted', (taskId) => {
                appState.removeTask(taskId);
                updateTaskDisplay();
                showToast('Task deleted!', 'warning');
            });

            appState.socket.on('disconnect', () => {
                console.log('Disconnected from server');
            });
        }
    }

    static disconnect() {
        if (appState.socket) {
            appState.socket.disconnect();
            appState.socket = null;
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
        setTimeout(() => container.removeChild(toast), 300);
    }, 5000);

    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => container.removeChild(toast), 300);
    });
}

function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');

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
        list.innerHTML = '';
    });

    // Filter tasks
    const statusFilter = document.getElementById('status-filter')?.value || '';
    const priorityFilter = document.getElementById('priority-filter')?.value || '';

    let filteredTasks = appState.tasks;

    if (statusFilter) {
        filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }

    if (priorityFilter) {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }

    // Group by status
    const tasksByStatus = {
        pending: filteredTasks.filter(task => task.status === 'pending'),
        'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
        completed: filteredTasks.filter(task => task.status === 'completed')
    };

    // Update counts
    document.getElementById('pending-count').textContent = tasksByStatus.pending.length;
    document.getElementById('in-progress-count').textContent = tasksByStatus['in-progress'].length;
    document.getElementById('completed-count').textContent = tasksByStatus.completed.length;

    // Render tasks
    Object.entries(tasksByStatus).forEach(([status, tasks]) => {
        const listId = status === 'in-progress' ? 'in-progress-list' : `${status}-list`;
        const list = document.getElementById(listId);
        
        if (tasks.length === 0) {
            list.innerHTML = '<p class="text-muted">No tasks</p>';
            return;
        }

        list.innerHTML = tasks.map(task => createTaskCard(task)).join('');
    });
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
                <button class="task-action-btn" onclick="editTask('${task._id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn" onclick="deleteTask('${task._id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
                ${task.status !== 'completed' ? `
                    <button class="task-action-btn" onclick="markComplete('${task._id}')" title="Mark Complete">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
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
    const task = appState.tasks.find(t => t._id === taskId);
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
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        showLoading();
        await TaskManager.deleteTask(taskId);
        updateTaskDisplay();
        if (appState.currentSection === 'dashboard') {
            updateStatsDisplay();
            updateRecentTasks();
        }
        hideLoading();
        showToast('Task deleted successfully!', 'success');
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
    icon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', appState.theme);
    const themeIcon = document.querySelector('#theme-toggle i');
    themeIcon.className = appState.theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
        });
    });

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // User menu
    const userAvatar = document.getElementById('user-avatar');
    const dropdownMenu = document.getElementById('dropdown-menu');

    userAvatar.addEventListener('click', () => {
        dropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userAvatar.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        AuthManager.logout();
    });

    // Auth modal
    const authModal = document.getElementById('auth-modal');
    const closeAuthBtn = document.getElementById('close-auth');
    const authTabs = document.querySelectorAll('.tab-btn');
    const authForm = document.getElementById('auth-form');
    const switchAuthLink = document.getElementById('switch-auth');

    closeAuthBtn.addEventListener('click', () => {
        hideModal('auth-modal');
    });

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.dataset.tab;
            switchAuthTab(tabType);
        });
    });

    switchAuthLink.addEventListener('click', (e) => {
        e.preventDefault();
        const currentTab = document.querySelector('.tab-btn.active').dataset.tab;
        const newTab = currentTab === 'login' ? 'register' : 'login';
        switchAuthTab(newTab);
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(authForm);
        const currentTab = document.querySelector('.tab-btn.active').dataset.tab;

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
            SocketManager.connect();
            showSection('dashboard');
            showToast(`${currentTab === 'login' ? 'Login' : 'Registration'} successful!`, 'success');
            hideLoading();
        } catch (error) {
            hideLoading();
            showToast(error.message, 'error');
        }
    });

    // Task modal
    const taskModal = document.getElementById('task-modal');
    const addTaskBtn = document.getElementById('add-task-btn');
    const quickAddTaskBtn = document.getElementById('quick-add-task');
    const closeTaskModalBtn = document.getElementById('close-task-modal');
    const cancelTaskBtn = document.getElementById('cancel-task');
    const taskForm = document.getElementById('task-form');

    [addTaskBtn, quickAddTaskBtn].forEach(btn => {
        btn?.addEventListener('click', () => {
            // Reset form
            taskForm.reset();
            delete taskForm.dataset.taskId;
            document.getElementById('task-modal-title').textContent = 'Add New Task';
            document.getElementById('save-task').textContent = 'Save Task';
            showModal('task-modal');
        });
    });

    [closeTaskModalBtn, cancelTaskBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal('task-modal');
        });
    });

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

    // Filter change handlers
    document.getElementById('status-filter')?.addEventListener('change', updateTaskDisplay);
    document.getElementById('priority-filter')?.addEventListener('change', updateTaskDisplay);

    // Refresh buttons
    document.getElementById('refresh-quote')?.addEventListener('click', loadDailyQuote);
    document.getElementById('refresh-motivation-quote')?.addEventListener('click', loadMotivationQuote);
    document.getElementById('refresh-ai-tip')?.addEventListener('click', loadAITip);

    // Modal backdrop clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Initialize app
    if (AuthManager.isAuthenticated()) {
        SocketManager.connect();
        showSection('dashboard');
    } else {
        showAuthModal();
    }
});

function switchAuthTab(tabType) {
    // Update tabs
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');

    // Update form
    const nameGroup = document.getElementById('name-group');
    const roleGroup = document.getElementById('role-group');
    const authTitle = document.getElementById('auth-title');
    const authSubmit = document.getElementById('auth-submit');
    const authSwitch = document.getElementById('auth-switch');
    const switchAuthLink = document.getElementById('switch-auth');

    if (tabType === 'register') {
        nameGroup.style.display = 'block';
        roleGroup.style.display = 'block';
        authTitle.textContent = 'Create Account';
        authSubmit.textContent = 'Sign Up';
        authSwitch.innerHTML = 'Already have an account? <a href="#" id="switch-auth">Sign in</a>';
    } else {
        nameGroup.style.display = 'none';
        roleGroup.style.display = 'none';
        authTitle.textContent = 'Welcome Back';
        authSubmit.textContent = 'Login';
        authSwitch.innerHTML = 'Don\'t have an account? <a href="#" id="switch-auth">Sign up</a>';
    }

    // Re-attach event listener to new switch link
    document.getElementById('switch-auth').addEventListener('click', (e) => {
        e.preventDefault();
        const currentTab = document.querySelector('.tab-btn.active').dataset.tab;
        const newTab = currentTab === 'login' ? 'register' : 'login';
        switchAuthTab(newTab);
    });
}

// Drag and drop functionality
let draggedTask = null;

document.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('task-card')) {
        draggedTask = e.target;
        e.target.classList.add('dragging');
    }
});

document.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('task-card')) {
        e.target.classList.remove('dragging');
        draggedTask = null;
    }
});

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    const taskColumn = e.target.closest('.task-column');
    if (taskColumn) {
        taskColumn.classList.add('drag-over');
    }
});

document.addEventListener('dragleave', (e) => {
    const taskColumn = e.target.closest('.task-column');
    if (taskColumn && !taskColumn.contains(e.relatedTarget)) {
        taskColumn.classList.remove('drag-over');
    }
});

document.addEventListener('drop', async (e) => {
    e.preventDefault();
    const taskColumn = e.target.closest('.task-column');
    
    if (taskColumn && draggedTask) {
        const newStatus = taskColumn.dataset.status;
        const taskId = draggedTask.dataset.taskId;
        
        try {
            await TaskManager.updateTask(taskId, { status: newStatus });
            updateTaskDisplay();
            if (appState.currentSection === 'dashboard') {
                updateStatsDisplay();
                updateRecentTasks();
            }
            showToast('Task status updated!', 'success');
        } catch (error) {
            showToast('Failed to update task status', 'error');
        }
    }
    
    document.querySelectorAll('.task-column').forEach(column => {
        column.classList.remove('drag-over');
    });
});
