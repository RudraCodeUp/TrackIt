// Main data structure
let appData = {
    habits: [],
    theme: 'light'
};

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setupPageHandlers();
});

// Set up page-specific handlers
function setupPageHandlers() {
    // Determine current page
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';

    // Common elements across pages
    setupThemeToggle();

    // Page-specific setup
    switch (pageName) {
        case 'index.html':
            renderDashboard();
            break;
        case 'manage.html':
            setupManagePage();
            break;
        case 'analytics.html':
            renderAnalytics();
            break;
        case 'settings.html':
            setupSettingsPage();
            break;
        case '':  // Default page (index)
            renderDashboard();
            break;
    }
}

// ===== DATA MANAGEMENT =====

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('trackItData');
    if (savedData) {
        try {
            appData = JSON.parse(savedData);
            applyTheme(appData.theme);
        } catch (e) {
            console.error('Error loading data:', e);
            // Initialize with default data if loading fails
            resetToDefaultData();
        }
    } else {
        resetToDefaultData();
    }
}

function saveToLocalStorage() {
    localStorage.setItem('trackItData', JSON.stringify(appData));
}

function resetToDefaultData() {
    appData = {
        habits: [],
        theme: 'light'
    };
    saveToLocalStorage();
}

// ===== THEME MANAGEMENT =====

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = appData.theme === 'light' ? '🌞' : '🌙';
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Theme buttons in settings
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                applyTheme(btn.dataset.theme);
                appData.theme = btn.dataset.theme;
                saveToLocalStorage();
            });
        }
    });
}

function toggleTheme() {
    const newTheme = appData.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    appData.theme = newTheme;
    saveToLocalStorage();
}

function applyTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'light' ? '🌞' : '🌙';
    }
}

// ===== DASHBOARD PAGE =====

function renderDashboard() {
    const habitsContainer = document.getElementById('habits-container');
    if (!habitsContainer) return;

    habitsContainer.innerHTML = '';
    
    // Show empty state if no habits
    if (appData.habits.length === 0) {
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.classList.remove('hidden');
            habitsContainer.appendChild(emptyState);
        }
        return;
    }

    // Render each habit card
    appData.habits.forEach(habit => {
        const habitCard = createHabitCard(habit);
        habitsContainer.appendChild(habitCard);
    });
}

function createHabitCard(habit) {
    const template = document.getElementById('habit-card-template');
    if (!template) return document.createElement('div');
    
    const habitCard = document.importNode(template.content, true).querySelector('.habit-card');
    
    // Set habit name
    habitCard.querySelector('.habit-name').textContent = habit.name;
    
    // Set today's checkbox
    const today = formatDate(new Date());
    const checkbox = habitCard.querySelector('.today-checkbox input');
    checkbox.checked = habit.history && habit.history[today] || false;
    checkbox.addEventListener('change', () => {
        toggleHabitCompletion(habit.id, today);
    });
    
    // Set streak count
    const streakCount = calculateStreak(habit);
    habitCard.querySelector('.streak-count').textContent = streakCount;
    
    // Render week tracker
    const dayDots = habitCard.querySelector('.day-dots');
    const weekDates = getLastSevenDays();
    
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
    const clearBtn = document.getElementById('clear-data-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            showConfirmationModal(
                'Are you sure you want to clear all data? This action cannot be undone.',
                clearAllData
            );
        });
    }
    
    // Setup modal
    setupConfirmationModal();
}

function exportData() {
    const dataStr = JSON.stringify(appData);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `trackit-backup-${formatDate(new Date())}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!importedData.habits || !Array.isArray(importedData.habits)) {
                throw new Error('Invalid data format');
            }
            
            appData = importedData;
            saveToLocalStorage();
            applyTheme(appData.theme);
            
            alert('Data imported successfully!');
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    resetToDefaultData();
    applyTheme('light');
    alert('All data has been cleared.');
}

// ===== MODAL FUNCTIONALITY =====

function setupConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    if (!modal) return;
    
    const cancelBtn = document.getElementById('modal-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideConfirmationModal);
    }
}

function showConfirmationModal(message, confirmCallback) {
    const modal = document.getElementById('confirmation-modal');
    const messageEl = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm');
    
    if (!modal || !messageEl || !confirmBtn) return;
    
    messageEl.textContent = message;
    
    // Remove previous event listeners and add new one
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        confirmCallback();
        hideConfirmationModal();
    });
    
    modal.classList.remove('hidden');
}

function hideConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    if (modal) modal.classList.add('hidden');
}

// ===== UTILITY FUNCTIONS =====

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getLastSevenDays() {
    const dates = [];
    const today = new Date();
    
    // Start from 6 days ago to include today
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dates.push(formatDate(date));
    }
    
    return dates;
}

function getLastThirtyDays() {
    const dates = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dates.push(formatDate(date));
    }
    
    return dates;
}

function calculateStreak(habit) {
    if (!habit || !habit.history) return 0;
    
    let streak = 0;
    const today = new Date();
    
    // Check today first
    let currentDate = new Date(today);
    let currentDateStr = formatDate(currentDate);
    
    // If today is completed, count it and look backward
    if (habit.history[currentDateStr]) {
        streak = 1;
        
        // Look back one day at a time
        let daysBack = 1;
        while (true) {
            currentDate = new Date(today);
            currentDate.setDate(today.getDate() - daysBack);
            currentDateStr = formatDate(currentDate);
            
            if (habit.history[currentDateStr]) {
                streak++;
                daysBack++;
            } else {
                break;
            }
        }
    }
    
    return streak;
}