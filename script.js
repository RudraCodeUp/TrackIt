// Main data structure
let appData = {
    habits: [],
    theme: 'light',
    categories: [
        { id: 'health', name: 'Health & Fitness', color: '#4CAF50' },
        { id: 'productivity', name: 'Productivity', color: '#5C6AC4' },
        { id: 'self-care', name: 'Self Care', color: '#FF9800' },
        { id: 'learning', name: 'Learning', color: '#9C27B0' }
    ],
    settings: {
        layout: 'grid',
        weekStartsOn: 1, // 0 = Sunday, 1 = Monday
        reminderTime: '20:00',
        showReminders: true,
        showAchievements: true
    }
};

// DOM Elements
const domElements = {};

// Current page
let currentPage = '';

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Initialize the application
function initApp() {
    // Load saved data
    loadFromLocalStorage();
    
    // Identify current page
    currentPage = getCurrentPage();
    
    // Cache DOM elements
    cacheDOMElements();
    
    // Setup common elements across all pages
    setupCommonElements();
    
    // Setup page-specific functionality
    setupPageFunctionality();
    
    // Apply current theme
    applyTheme(appData.theme);
    
    console.log(`TrackIt app initialized on ${currentPage} page`);
}

// Get current page name
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page.replace('.html', '');
}

// Cache frequently used DOM elements
function cacheDOMElements() {
    // Common elements across all pages
    domElements.sidebar = document.getElementById('sidebar');
    domElements.sidebarToggle = document.getElementById('sidebar-toggle');
    domElements.themeToggle = document.getElementById('theme-toggle');
    domElements.toastContainer = document.getElementById('toast-container');
    
    // Page specific elements
    switch (currentPage) {
        case 'index':
            domElements.habitsContainer = document.getElementById('habits-container');
            domElements.emptyState = document.getElementById('empty-state-message');
            domElements.quickAddButton = document.getElementById('quick-add');
            domElements.quickAddModal = document.getElementById('quick-add-modal');
            domElements.streakCounter = document.getElementById('current-streak');
            domElements.completionRate = document.getElementById('completion-rate');
            domElements.totalHabits = document.getElementById('total-habits');
            break;
        case 'manage':
            domElements.habitsList = document.getElementById('habits-list');
            domElements.addHabitButton = document.getElementById('add-habit-btn');
            domElements.resetAllButton = document.getElementById('reset-all-btn');
            domElements.habitSearch = document.getElementById('habit-search');
            break;
        case 'analytics':
            // Analytics page DOM elements
            break;
        case 'settings':
            // Settings page DOM elements
            break;
        case 'about':
            // About page DOM elements
            break;
    }
    
    // Modal elements if they exist
    domElements.confirmationModal = document.getElementById('confirmation-modal');
}

// Setup elements common to all pages
function setupCommonElements() {
    // Setup theme toggle
    domElements.themeToggle = document.getElementById('theme-toggle');
    if (domElements.themeToggle) {
        // Apply current theme
        domElements.themeToggle.checked = appData.theme === 'dark';
        
        // Listen for changes
        domElements.themeToggle.addEventListener('change', () => {
            const theme = domElements.themeToggle.checked ? 'dark' : 'light';
            applyTheme(theme);
            appData.theme = theme;
            saveToLocalStorage();
        });
    }
    
    // Apply theme on page load
    applyTheme(appData.theme);
    
    // Set today's date if element exists (used in dashboard)
    const todayDateElement = document.getElementById('today-date');
    if (todayDateElement) {
        todayDateElement.textContent = formatDateLong(new Date());
    }
    
    // Setup mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
        const navbarMenu = document.getElementById('navbar-menu');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        
        if (navbarMenu && navbarMenu.classList.contains('show') && 
            event.target !== navbarMenu && 
            event.target !== mobileMenuToggle && 
            !navbarMenu.contains(event.target) && 
            !mobileMenuToggle.contains(event.target)) {
            navbarMenu.classList.remove('show');
        }
    });
}

// Setup page-specific functionality
function setupPageFunctionality() {
    switch (currentPage) {
        case 'index':
            setupDashboardPage();
            break;
        case 'manage':
            setupManagePage();
            break;
        case 'analytics':
            setupAnalyticsPage();
            break;
        case 'settings':
            setupSettingsPage();
            break;
        case 'about':
            // No specific setup needed for about page
            break;
    }
}

// Toggle sidebar expanded/collapsed state
function toggleSidebar() {
    if (domElements.sidebar) {
        domElements.sidebar.classList.toggle('collapsed');
        
        // Store preference in localStorage
        const isCollapsed = domElements.sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }
}

// Add this function to handle the mobile menu toggle
function toggleMobileMenu() {
    const navbarMenu = document.getElementById('navbar-menu');
    if (navbarMenu) {
        navbarMenu.classList.toggle('show');
    }
}

// ===== DATA MANAGEMENT =====

function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('trackItData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Merge with default values to ensure all properties exist
            appData = {
                ...appData,
                ...parsedData
            };
        }
        
        // Load sidebar state
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed && domElements.sidebar) {
            domElements.sidebar.classList.add('collapsed');
        }
    } catch (error) {
        console.error('Error loading data from localStorage:', error);
        showToast('Error loading saved data', 'error');
        // Reset to defaults if there's an error
        resetToDefaultData();
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('trackItData', JSON.stringify(appData));
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
        showToast('Failed to save your data', 'error');
    }
}

function resetToDefaultData() {
    appData = {
        habits: [],
        theme: 'light',
        categories: [
            { id: 'health', name: 'Health & Fitness', color: '#4CAF50' },
            { id: 'productivity', name: 'Productivity', color: '#5C6AC4' },
            { id: 'self-care', name: 'Self Care', color: '#FF9800' },
            { id: 'learning', name: 'Learning', color: '#9C27B0' }
        ],
        settings: {
            layout: 'grid',
            weekStartsOn: 1,
            reminderTime: '20:00',
            showReminders: true,
            showAchievements: true
        }
    };
    
    saveToLocalStorage();
}

// ===== THEME MANAGEMENT =====

function applyTheme(theme) {
    const body = document.body;
    if (theme === 'dark') {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }
}

// ===== DASHBOARD PAGE =====

function setupDashboardPage() {
    renderDashboard();
    
    // Setup Quick Add button
    const quickAddButton = document.getElementById('quick-add');
    if (quickAddButton) {
        quickAddButton.addEventListener('click', showQuickAddModal);
    }
    
    // Setup Empty State Add button
    const emptyAddBtn = document.getElementById('empty-add-btn');
    if (emptyAddBtn) {
        emptyAddBtn.addEventListener('click', showQuickAddModal);
    }
    
    // Setup Quick Add Modal buttons
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', hideQuickAddModal);
    }
    
    const cancelAdd = document.getElementById('cancel-add');
    if (cancelAdd) {
        cancelAdd.addEventListener('click', hideQuickAddModal);
    }
    
    const confirmAdd = document.getElementById('confirm-add');
    if (confirmAdd) {
        confirmAdd.addEventListener('click', addHabitFromModal);
    }
    
    // Setup filter dropdown
    const dropdownToggle = document.getElementById('dropdown-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', (e) => {
            dropdownMenu.classList.toggle('show');
            e.stopPropagation();
        });
        
        // Close dropdown when clicking elsewhere
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
        
        // Setup filter options
        const filterOptions = document.querySelectorAll('.dropdown-item');
        filterOptions.forEach(option => {
            option.addEventListener('click', () => {
                const filterText = document.getElementById('filter-text');
                if (filterText) {
                    filterText.textContent = option.textContent;
                }
                
                // Apply filter
                filterHabits(option.dataset.filter);
                
                // Mark active
                filterOptions.forEach(op => op.classList.remove('active'));
                option.classList.add('active');
            });
        });
    }
    
    // Set today's date
    const todayElement = document.getElementById('today-date');
    if (todayElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        todayElement.textContent = new Date().toLocaleDateString('en-US', options);
    }
}

function renderDashboard() {
    if (!domElements.habitsContainer || !domElements.emptyState) return;
    
    // Update stats first
    updateDashboardStats();
    
    // Clear existing habits
    domElements.habitsContainer.innerHTML = '';
    
    if (appData.habits.length === 0) {
        // Show empty state if no habits
        domElements.emptyState.classList.remove('hidden');
        domElements.habitsContainer.classList.add('hidden');
    } else {
        // Hide empty state and show habits
        domElements.emptyState.classList.add('hidden');
        domElements.habitsContainer.classList.remove('hidden');
        
        // Render each habit
        appData.habits.forEach(habit => {
            const habitCard = createHabitCard(habit);
            domElements.habitsContainer.appendChild(habitCard);
        });
    }
}

function updateDashboardStats() {
    // Update stats display
    if (domElements.totalHabits) {
        domElements.totalHabits.textContent = appData.habits.length;
    }
    
    if (domElements.streakCounter) {
        const bestStreak = calculateBestStreak();
        domElements.streakCounter.textContent = bestStreak;
    }
    
    if (domElements.completionRate) {
        const rate = calculateCompletionRate();
        domElements.completionRate.textContent = `${rate}%`;
    }
}

function calculateBestStreak() {
    if (appData.habits.length === 0) return 0;
    
    // Find the best streak among all habits
    let bestStreak = 0;
    appData.habits.forEach(habit => {
        const habitStreak = calculateHabitStreak(habit);
        if (habitStreak > bestStreak) {
            bestStreak = habitStreak;
        }
    });
    
    return bestStreak;
}

function calculateHabitStreak(habit) {
    if (!habit.history) return 0;
    
    // Get dates in descending order (most recent first)
    const dates = Object.keys(habit.history)
        .filter(date => habit.history[date])
        .sort((a, b) => new Date(b) - new Date(a));
    
    if (dates.length === 0) return 0;
    
    // Check if completed today
    const today = formatDate(new Date());
    const completedToday = dates.includes(today);
    
    // If not completed today, check if completed yesterday
    if (!completedToday) {
        const yesterday = formatDate(new Date(Date.now() - 86400000));
        if (!dates.includes(yesterday)) {
            return 0; // Streak broken
        }
    }
    
    // Count consecutive days
    let streak = completedToday ? 1 : 0;
    const startIndex = completedToday ? 1 : 0;
    
    for (let i = startIndex; i < dates.length; i++) {
        const currentDate = new Date(dates[i]);
        const prevDate = i > 0 ? new Date(dates[i-1]) : new Date();
        
        const differenceInDays = Math.round((prevDate - currentDate) / 86400000);
        
        if (differenceInDays === 1) {
            streak++;
        } else if (differenceInDays > 1) {
            break; // Streak broken
        }
    }
    
    return streak;
}

function calculateCompletionRate() {
    if (appData.habits.length === 0) return 0;
    
    // Get last 7 days
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(formatDate(date));
    }
    
    // Count total possible completions (habits × days)
    const totalPossible = appData.habits.length * 7;
    
    // Count actual completions
    let completed = 0;
    appData.habits.forEach(habit => {
        if (!habit.history) return;
        
        last7Days.forEach(date => {
            if (habit.history[date]) {
                completed++;
            }
        });
    });
    
    // Calculate percentage
    const rate = Math.round((completed / totalPossible) * 100);
    return isNaN(rate) ? 0 : rate;
}

function createHabitCard(habit) {
    const template = document.getElementById('habit-card-template');
    if (!template) return document.createElement('div');
    
    // Clone the template content
    const habitCard = document.importNode(template.content, true).querySelector('.habit-card');
    
    // Set card data
    habitCard.dataset.id = habit.id;
    
    // Set habit name
    const nameElement = habitCard.querySelector('.habit-name');
    if (nameElement) {
        nameElement.textContent = habit.name;
    }
    
    // Set category badge if exists
    const categoryBadge = habitCard.querySelector('.habit-category-badge');
    if (categoryBadge && habit.category) {
        const category = appData.categories.find(c => c.id === habit.category);
        if (category) {
            categoryBadge.textContent = category.name;
            categoryBadge.style.backgroundColor = `${category.color}20`; // Add 20 for transparency
            categoryBadge.style.color = category.color;
        } else {
            categoryBadge.textContent = ''; // Clear text if category not found
            categoryBadge.style.backgroundColor = ''; // Reset background
            categoryBadge.style.color = ''; // Reset text color
        }
    }
    
    // Set today's checkbox - FIXED: added null check
    const today = formatDate(new Date());
    const checkbox = habitCard.querySelector('.today-checkbox input');
    if (checkbox) { // Add this check to prevent null errors
        checkbox.checked = habit.history && habit.history[today] || false;
        checkbox.addEventListener('change', () => {
            toggleHabitCompletion(habit.id, today);
        });
    }
    
    // Set streak count - FIXED: added null check
    const streakElement = habitCard.querySelector('.streak-count');
    if (streakElement) {
        const streakCount = calculateStreak(habit);
        streakElement.textContent = streakCount;
    }
    
    // Render week tracker - FIXED: added null check
    const dayDots = habitCard.querySelector('.day-dots');
    if (dayDots) {
        const weekDates = getLastSevenDays();
        
        // Clear existing dots
        dayDots.innerHTML = '';
        
        weekDates.forEach(date => {
            const dot = document.createElement('div');
            dot.classList.add('day-dot');
            
            if (habit.history && habit.history[date]) {
                dot.classList.add('completed');
            }
            
            dot.addEventListener('click', () => {
                toggleHabitCompletion(habit.id, date);
            });
            
            dayDots.appendChild(dot);
        });
    }
    
    return habitCard;
}

function toggleHabitCompletion(habitId, dateStr) {
    const habit = appData.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    // Initialize history object if it doesn't exist
    if (!habit.history) habit.history = {};
    
    // Toggle completion
    habit.history[dateStr] = !habit.history[dateStr];
    
    saveToLocalStorage();
    renderDashboard();
}

// ===== MANAGE HABITS PAGE =====

function setupManagePage() {
    // Set up add habit form
    const addButton = document.getElementById('add-new-habit-btn');
    const habitInput = document.getElementById('new-habit-input');
    
    if (addButton && habitInput) {
        addButton.addEventListener('click', () => addNewHabit(habitInput.value));
        habitInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') addNewHabit(habitInput.value);
        });
    }
    
    // Set up reset button
    const resetButton = document.getElementById('reset-all-btn');
    if (resetButton) {
        resetButton.addEventListener('click', confirmResetHabits);
    }
    
    // Render habits list
    renderHabitsList();
    
    // Set up modal
    setupConfirmationModal();
}

function renderHabitsList() {
    const habitsList = document.getElementById('habits-list');
    if (!habitsList) return;
    
    habitsList.innerHTML = '';
    
    if (appData.habits.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.classList.add('empty-state');
        emptyState.textContent = 'No habits added yet.';
        habitsList.appendChild(emptyState);
        return;
    }
    
    appData.habits.forEach(habit => {
        const habitItem = createHabitItem(habit);
        habitsList.appendChild(habitItem);
    });
}

function createHabitItem(habit) {
    const template = document.getElementById('habit-item-template');
    if (!template) {
        const div = document.createElement('div');
        div.textContent = habit.name;
        return div;
    }
    
    const habitItem = document.importNode(template.content, true).querySelector('.habit-item');
    
    habitItem.querySelector('.habit-name').textContent = habit.name;
    
    // Setup edit button
    habitItem.querySelector('.edit-btn').addEventListener('click', () => {
        const newName = prompt('Enter new name for the habit:', habit.name);
        if (newName && newName.trim()) {
            editHabit(habit.id, newName.trim());
        }
    });
    
    // Setup delete button
    habitItem.querySelector('.delete-btn').addEventListener('click', () => {
        showConfirmationModal(
            `Are you sure you want to delete "${habit.name}"?`,
            () => deleteHabit(habit.id)
        );
    });
    
    return habitItem;
}

function addNewHabit(name) {
    const habitName = name.trim();
    if (!habitName) return;
    
    const newHabit = {
        id: Date.now().toString(),
        name: habitName,
        history: {}
    };
    
    appData.habits.push(newHabit);
    saveToLocalStorage();
    
    // Clear input and refresh list
    const habitInput = document.getElementById('new-habit-input');
    if (habitInput) habitInput.value = '';
    
    renderHabitsList();
}

function editHabit(habitId, newName) {
    const habit = appData.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    habit.name = newName;
    saveToLocalStorage();
    renderHabitsList();
}

function deleteHabit(habitId) {
    appData.habits = appData.habits.filter(h => h.id !== habitId);
    saveToLocalStorage();
    renderHabitsList();
}

function confirmResetHabits() {
    showConfirmationModal(
        'Are you sure you want to delete all habits? This action cannot be undone.',
        () => {
            appData.habits = [];
            saveToLocalStorage();
            renderHabitsList();
        }
    );
}

// ===== ANALYTICS PAGE =====

function renderAnalytics() {
    if (appData.habits.length === 0) {
        showEmptyAnalytics();
        return;
    }
    
    renderWeeklyChart();
    renderMonthlyChart();
    renderSummary();
    renderMotivationalQuote();
}

function showEmptyAnalytics() {
    const emptyState = '<div class="empty-state">Add some habits and track your progress to see analytics.</div>';
    
    const weeklyChart = document.getElementById('weekly-chart');
    if (weeklyChart) weeklyChart.innerHTML = emptyState;
    
    const monthlyChart = document.getElementById('monthly-chart');
    if (monthlyChart) monthlyChart.innerHTML = emptyState;
    
    const summaryContainer = document.getElementById('summary-container');
    if (summaryContainer) summaryContainer.innerHTML = emptyState;
}

function renderWeeklyChart() {
    const weeklyChart = document.getElementById('weekly-chart');
    if (!weeklyChart) return;
    
    weeklyChart.innerHTML = '';
    
    const chartContainer = document.createElement('div');
    chartContainer.classList.add('bar-chart');
    
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekDates = getLastSevenDays();
    
    weekDays.forEach((day, index) => {
        const date = weekDates[index];
        const completedCount = appData.habits.filter(h => h.history && h.history[date]).length;
        const percentage = appData.habits.length > 0 
            ? (completedCount / appData.habits.length) * 100 
            : 0;
        
        const column = document.createElement('div');
        column.classList.add('chart-column');
        
        column.innerHTML = `
            <div class="chart-bar-container">
                <div class="chart-bar" style="height: ${percentage}%"></div>
            </div>
            <div class="chart-label">${day}</div>
        `;
        
        chartContainer.appendChild(column);
    });
    
    weeklyChart.appendChild(chartContainer);
}

function renderMonthlyChart() {
    const canvas = document.getElementById('monthly-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas and set dimensions
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    
    // Get dates for the last 30 days
    const dates = getLastThirtyDays();
    
    // Calculate completion rates
    const completionRates = dates.map(date => {
        const completedCount = appData.habits.filter(h => h.history && h.history[date]).length;
        return appData.habits.length > 0 
            ? (completedCount / appData.habits.length) * 100 
            : 0;
    });
    
    // Draw line chart
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim();
    ctx.lineWidth = 2;
    
    const padding = 20;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--border')
        .trim();
    ctx.lineWidth = 1;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw data line
    ctx.beginPath();
    ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim();
    ctx.lineWidth = 2;
    
    completionRates.forEach((rate, index) => {
        const x = padding + (chartWidth * (index / (completionRates.length - 1)));
        const y = canvas.height - padding - (chartHeight * (rate / 100));
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Optional: Add data points
    completionRates.forEach((rate, index) => {
        const x = padding + (chartWidth * (index / (completionRates.length - 1)));
        const y = canvas.height - padding - (chartHeight * (rate / 100));
        
        ctx.beginPath();
        ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent-light')
            .trim();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function renderSummary() {
    const summary = document.getElementById('summary-container');
    if (!summary) return;
    
    // Calculate overall completion
    let totalDays = 0;
    let completedDays = 0;
    
    const habits = appData.habits;
    const dates = getLastThirtyDays();
    
    habits.forEach(habit => {
        dates.forEach(date => {
            totalDays++;
            if (habit.history && habit.history[date]) completedDays++;
        });
    });
    
    const completionRate = totalDays > 0 
        ? Math.round((completedDays / totalDays) * 100) 
        : 0;
    
    // Find longest streak
    let longestStreak = 0;
    habits.forEach(habit => {
        const streak = calculateStreak(habit);
        if (streak > longestStreak) longestStreak = streak;
    });
    
    // Find best habit
    let bestHabit = '';
    let bestHabitCompletion = 0;
    
    habits.forEach(habit => {
        let habitCompletedDays = 0;
        dates.forEach(date => {
            if (habit.history && habit.history[date]) habitCompletedDays++;
        });
        
        const habitCompletionRate = habitCompletedDays / dates.length;
        
        if (habitCompletionRate > bestHabitCompletion) {
            bestHabitCompletion = habitCompletionRate;
            bestHabit = habit.name;
        }
    });
    
    summary.innerHTML = `
        <p>✅ <strong>${completionRate}%</strong> overall consistency this month</p>
        <p>🔥 Longest streak: <strong>${longestStreak}</strong> days</p>
        ${bestHabit ? `<p>🏆 Best habit: <strong>${bestHabit}</strong></p>` : ''}
    `;
}

function renderMotivationalQuote() {
    const quoteElement = document.getElementById('motivation-quote');
    if (!quoteElement) return;
    
    const quotes = [
        "Consistency is the key to achieving and maintaining momentum.",
        "Small habits compound into remarkable results.",
        "Progress is progress, no matter how small.",
        "The only bad workout is the one that didn't happen.",
        "Success isn't always about greatness. It's about consistency.",
        "It's not what we do once in a while that shapes our lives, but what we do consistently.",
        "Motivation is what gets you started. Habit is what keeps you going.",
        "The chains of habit are too light to be felt until they are too heavy to be broken.",
        "Excellence is not an act, but a habit.",
        "You'll never change your life until you change something you do daily."
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteElement.textContent = `"${randomQuote}"`;
}

// ===== SETTINGS PAGE =====

function setupSettingsPage() {
    // Theme buttons
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            applyTheme(theme);
            appData.theme = theme;
            saveToLocalStorage();
            
            // Update active state
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update theme toggle checkbox if it exists
            if (domElements.themeToggle) {
                domElements.themeToggle.checked = theme === 'dark';
            }
        });
        
        // Set active state based on current theme
        if (btn.dataset.theme === appData.theme) {
            btn.classList.add('active');
        }
    });
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Import button and file input
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
            importFile.click();
        });
        importFile.addEventListener('change', importData);
    }
    
    // Clear data button
    const clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            showConfirmationModal(
                'Are you sure you want to clear all data? This action cannot be undone.',
                clearAllData
            );
        });
    }
    
    // Setup confirmation modal
    setupConfirmationModal();
}

// Show quick add modal
function showQuickAddModal() {
    const modal = document.getElementById('quick-add-modal');
    if (modal) {
        modal.classList.add('show');
        
        // Reset form fields
        const nameInput = document.getElementById('habit-name');
        if (nameInput) {
            nameInput.value = '';
            nameInput.focus();
        }
        
        const categorySelect = document.getElementById('habit-category');
        if (categorySelect) {
            categorySelect.value = '';
        }
    }
}

// Hide quick add modal
function hideQuickAddModal() {
    const modal = document.getElementById('quick-add-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Add habit from modal
function addHabitFromModal() {
    const nameInput = document.getElementById('habit-name');
    const categorySelect = document.getElementById('habit-category');
    
    if (!nameInput) return;
    
    const name = nameInput.value.trim();
    if (!name) {
        showToast('Please enter a habit name', 'error');
        return;
    }
    
    // Create new habit
    const newHabit = {
        id: Date.now().toString(),
        name: name,
        category: categorySelect ? categorySelect.value : '',
        history: {},
        createdAt: new Date().toISOString()
    };
    
    // Add to habits array
    appData.habits.push(newHabit);
    saveToLocalStorage();
    hideQuickAddModal();
    renderDashboard();
    
    showToast(`Habit "${name}" added successfully!`, 'success');
}

// Toast notification function
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    
    let icon = 'info';
    switch (type) {
        case 'success': icon = 'check_circle'; break;
        case 'error': icon = 'error'; break;
        case 'warning': icon = 'warning'; break;
    }
    
    toast.innerHTML = `
        <div class="toast-icon">
            <span class="material-icons-round">${icon}</span>
        </div>
        <div class="toast-content">
            <p class="toast-message">${message}</p>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode === toastContainer) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Filter habits by completion status
function filterHabits(filter) {
    const habitsContainer = document.getElementById('habits-container');
    if (!habitsContainer) return;
    
    const habitCards = habitsContainer.querySelectorAll('.habit-card');
    const today = formatDate(new Date());
    
    habitCards.forEach(card => {
        const habitId = card.dataset.id;
        const habit = appData.habits.find(h => h.id === habitId);
        
        if (!habit) return;
        
        const isCompleted = habit.history && habit.history[today];
        
        switch (filter) {
            case 'completed':
                card.style.display = isCompleted ? 'block' : 'none';
                break;
            case 'pending':
                card.style.display = !isCompleted ? 'block' : 'none';
                break;
            default: // 'all'
                card.style.display = 'block';
                break;
        }
    });
}

// Utility function for date formatting
function formatDate(date) {
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

// Format date in long readable format (e.g., "Monday, October 20, 2025")
function formatDateLong(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Get last seven days for week tracker
function getLastSevenDays() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(formatDate(date));
    }
    return days;
}

// Get last thirty days for analytics
function getLastThirtyDays() {
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(formatDate(date));
    }
    return days;
}

// Calculate streak for a habit
function calculateStreak(habit) {
    if (!habit.history) return 0;
    
    let streak = 0;
    const today = formatDate(new Date());
    const yesterday = formatDate(new Date(Date.now() - 86400000));
    
    if (habit.history[today]) {
        // If completed today, start counting from today
        streak = 1;
        let currentDate = new Date();
        
        while (true) {
            currentDate.setDate(currentDate.getDate() - 1);
            const dateStr = formatDate(currentDate);
            
            if (habit.history[dateStr]) {
                streak++;
            } else {
                break;
            }
        }
    } else if (habit.history[yesterday]) {
        // If not completed today but completed yesterday, start counting from yesterday
        let currentDate = new Date(Date.now() - 86400000); // yesterday
        
        while (true) {
            const dateStr = formatDate(currentDate);
            
            if (habit.history[dateStr]) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
    }
    
    return streak;
}

// Setup confirmation modal
function setupConfirmationModal() {
    const closeModalBtn = document.getElementById('close-confirm-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            const modal = document.getElementById('confirmation-modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    }
    
    const cancelBtn = document.getElementById('modal-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            const modal = document.getElementById('confirmation-modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    }
}

// Show confirmation modal
function showConfirmationModal(message, confirmCallback) {
    const modal = document.getElementById('confirmation-modal');
    const messageElem = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm');
    
    if (!modal || !messageElem || !confirmBtn) return;
    
    messageElem.textContent = message;
    
    // Remove old event listener and add new one
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    const newConfirmBtn = document.getElementById('modal-confirm');
    
    newConfirmBtn.addEventListener('click', () => {
        confirmCallback();
        modal.classList.remove('show');
    });
    
    modal.classList.add('show');
}