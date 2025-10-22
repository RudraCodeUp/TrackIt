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
    },
    achievements: []
};

// DOM Elements
const domElements = {};

// Current page
let currentPage = '';

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded, initializing app");
    
    // Cache DOM elements
    cacheDOMElements();
    
    // Initialize the application
    initApp();
    
    // Setup common elements for all pages
    setupCommonElements();
});

// Initialize the application
function initApp() {
    // Load data from local storage
    loadFromLocalStorage();
    
    // Initialize theme
    const storedTheme = appData.theme || 'light';
    document.body.classList.toggle('dark-theme', storedTheme === 'dark');
    
    // Set up theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = storedTheme === 'dark';
        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'dark' : 'light';
            document.body.classList.toggle('dark-theme', themeToggle.checked);
            appData.theme = newTheme;
            saveToLocalStorage();
        });
    }
    
    // Set up mobile menu toggle - replace the existing code in initApp
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navbarMenu = document.getElementById('navbar-menu');
    if (mobileMenuToggle && navbarMenu) {
        console.log("Setting up mobile menu toggle");
        
        // Remove any existing listeners to prevent duplicates
        const newMobileMenuToggle = mobileMenuToggle.cloneNode(true);
        mobileMenuToggle.parentNode.replaceChild(newMobileMenuToggle, mobileMenuToggle);
        
        // Add click listener
        newMobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Mobile menu button clicked");
            toggleMobileMenu();
        });
        
        // Add touchstart for better mobile response
        newMobileMenuToggle.addEventListener('touchstart', function(e) {
            e.preventDefault();
            toggleMobileMenu();
        }, { passive: false });
    }
    
    // Determine the current page and call appropriate setup function
    const pageName = getCurrentPage();
    console.log(`Current page: ${pageName}`);
    currentPage = pageName;
    setupPageFunctionality(pageName);
    
    // Add example data if no habits exist
    if (appData.habits.length === 0 && isLocalStorageEmpty()) {
        addExampleHabits();
    }
    
    // Make sure add habit buttons work
    ensureAddHabitButtonsWork();
}

// Check if localStorage is empty (first time user)
function isLocalStorageEmpty() {
    return localStorage.getItem('trackitAppData') === null;
}

// Add example habits for first-time users
function addExampleHabits() {
    const today = formatDate(new Date());
    const yesterday = formatDate(new Date(Date.now() - 86400000));
    const twoDaysAgo = formatDate(new Date(Date.now() - 2 * 86400000));
    
    const exampleHabits = [
        {
            id: 'habit_example1',
            name: 'Morning Meditation',
            category: 'self-care',
            createdAt: new Date().toISOString(),
            history: {
                [today]: true,
                [yesterday]: true,
                [twoDaysAgo]: true
            },
            trackDays: [0, 1, 2, 3, 4, 5, 6] // All days
        },
        {
            id: 'habit_example2',
            name: 'Exercise',
            category: 'health',
            createdAt: new Date().toISOString(),
            history: {
                [today]: false,
                [yesterday]: true
            },
            trackDays: [1, 3, 5] // Monday, Wednesday, Friday
        },
        {
            id: 'habit_example3',
            name: 'Read 30 minutes',
            category: 'learning',
            createdAt: new Date().toISOString(),
            history: {
                [yesterday]: true
            },
            trackDays: [0, 1, 2, 3, 4, 5, 6] // All days
        }
    ];
    
    appData.habits = exampleHabits;
    saveToLocalStorage();
    showToast('Example habits added to get you started!', 'info');
}

// Set up page functionality based on current page
function setupPageFunctionality(pageName) {
    switch (pageName) {
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
            // No special setup needed
            break;
        default:
            console.warn(`No setup function for page: ${pageName}`);
            // Default to dashboard setup if we're on a page that contains habits container
            if (document.getElementById('habits-container')) {
                setupDashboardPage();
            }
    }
}

// Get current page name
function getCurrentPage() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop().split('.')[0];
    return pageName || 'index';
}

// Cache frequently used DOM elements
function cacheDOMElements() {
    // Common elements across all pages
    domElements.body = document.body;
    domElements.navbar = document.getElementById('top-navbar');
    domElements.navbarMenu = document.getElementById('navbar-menu');
    domElements.themeToggle = document.getElementById('theme-toggle');
    domElements.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    domElements.toastContainer = document.getElementById('toast-container');
    
    // Page specific elements
    const pageName = getCurrentPage();
    
    switch (pageName) {
        case 'index':
            domElements.habitsContainer = document.getElementById('habits-container');
            domElements.emptyState = document.getElementById('empty-state-message');
            domElements.quickAddButton = document.getElementById('quick-add');
            domElements.quickAddModal = document.getElementById('quick-add-modal');
            domElements.habitNameInput = document.getElementById('habit-name');
            domElements.habitCategorySelect = document.getElementById('habit-category');
            domElements.confirmAddBtn = document.getElementById('confirm-add');
            domElements.cancelAddBtn = document.getElementById('cancel-add');
            domElements.closeModalBtn = document.getElementById('close-modal');
            domElements.streakCounter = document.getElementById('current-streak');
            domElements.completionRate = document.getElementById('completion-rate');
            domElements.totalHabits = document.getElementById('total-habits');
            domElements.todayDate = document.getElementById('today-date');
            domElements.filterDropdown = document.getElementById('dropdown-toggle');
            domElements.dropdownMenu = document.getElementById('dropdown-menu');
            domElements.emptyAddBtn = document.getElementById('empty-add-btn');
            break;
            
        case 'manage':
            domElements.habitsList = document.getElementById('habits-list');
            domElements.addHabitButton = document.getElementById('add-habit-btn');
            domElements.newHabitInput = document.getElementById('new-habit-input');
            domElements.addNewHabitBtn = document.getElementById('add-new-habit-btn');
            domElements.resetAllButton = document.getElementById('reset-all-btn');
            domElements.habitSearch = document.getElementById('habit-search');
            break;
            
        case 'analytics':
            domElements.totalHabitsCount = document.getElementById('total-habits-count');
            domElements.bestStreakElement = document.getElementById('best-streak');
            domElements.completionRateElement = document.getElementById('completion-rate');
            domElements.weeklyChart = document.getElementById('weekly-chart');
            domElements.monthlyChart = document.getElementById('monthly-chart');
            domElements.mostConsistentElement = document.getElementById('most-consistent');
            domElements.mostActiveDayElement = document.getElementById('most-active-day');
            domElements.currentStreakValue = document.getElementById('current-streak-value');
            domElements.motivationQuote = document.getElementById('motivation-quote');
            domElements.printAnalytics = document.getElementById('print-analytics');
            break;
            
        case 'settings':
            domElements.themeOptions = document.querySelectorAll('input[name="theme"]');
            domElements.layoutOptions = document.querySelectorAll('input[name="layout"]');
            domElements.colorOptions = document.querySelectorAll('input[name="color"]');
            domElements.weekStartOptions = document.querySelectorAll('input[name="weekStart"]');
            domElements.showRemindersToggle = document.getElementById('show-reminders');
            domElements.showAchievementsToggle = document.getElementById('show-achievements');
            domElements.exportBtn = document.getElementById('export-btn');
            domElements.importBtn = document.getElementById('import-btn');
            domElements.importFile = document.getElementById('import-file');
            domElements.clearDataBtn = document.getElementById('clear-data-btn');
            domElements.settingsNav = document.querySelectorAll('.settings-nav-item');
            break;
    }
    
    // Modal elements if they exist
    domElements.confirmationModal = document.getElementById('confirmation-modal');
    domElements.modalMessage = document.getElementById('modal-message');
    domElements.modalConfirm = document.getElementById('modal-confirm');
    domElements.modalCancel = document.getElementById('modal-cancel');
    domElements.closeConfirmModal = document.getElementById('close-confirm-modal');
    
    // Achievement popup
    domElements.achievementPopup = document.getElementById('achievement-popup');
    domElements.achievementTitle = document.getElementById('achievement-title');
    domElements.achievementMessage = document.getElementById('achievement-message');
    domElements.closeAchievement = document.getElementById('close-achievement');
}

// Setup elements common to all pages
function setupCommonElements() {
    // Apply theme on page load
    applyTheme(appData.theme);
    
    // Set today's date if element exists (used in dashboard)
    if (domElements.todayDate) {
        domElements.todayDate.textContent = formatDateLong(new Date());
    }
    
    // Setup mobile menu toggle
    if (domElements.mobileMenuToggle && domElements.navbarMenu) {
        domElements.mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
        if (domElements.navbarMenu && 
            domElements.navbarMenu.classList.contains('mobile-active') && 
            event.target !== domElements.navbarMenu && 
            event.target !== domElements.mobileMenuToggle && 
            !domElements.navbarMenu.contains(event.target) && 
            !domElements.mobileMenuToggle.contains(event.target)) {
            
            domElements.navbarMenu.classList.remove('mobile-active');
        }
    });
    
    // Setup confirmation modal
    setupConfirmationModal();
    
    // Setup achievement popup close button
    if (domElements.closeAchievement) {
        domElements.closeAchievement.addEventListener('click', () => {
            domElements.achievementPopup.classList.remove('show');
        });
    }
}

// Enhanced mobile menu toggle function
function toggleMobileMenu() {
    console.log("Toggle mobile menu called");
    const navbarMenu = document.getElementById('navbar-menu');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    
    if (!navbarMenu) {
        console.error("Navbar menu element not found");
        return;
    }
    
    // Toggle the active class
    navbarMenu.classList.toggle('mobile-active');
    
    // Update aria-expanded attribute for accessibility
    if (mobileToggle) {
        mobileToggle.setAttribute('aria-expanded', 
            navbarMenu.classList.contains('mobile-active') ? 'true' : 'false');
    }
    
    // If mobile menu is now active, show it with animation
    if (navbarMenu.classList.contains('mobile-active')) {
        console.log("Opening mobile menu");
        navbarMenu.style.display = 'flex';
        navbarMenu.style.flexDirection = 'column';
        navbarMenu.style.opacity = '0';
        navbarMenu.style.transform = 'translateY(-10px)';
        
        // Force browser reflow to ensure animation works
        void navbarMenu.offsetWidth;
        
        // Apply animation
        navbarMenu.style.opacity = '1';
        navbarMenu.style.transform = 'translateY(0)';
    } else {
        console.log("Closing mobile menu");
        // Hide menu with animation
        navbarMenu.style.opacity = '0';
        navbarMenu.style.transform = 'translateY(-10px)';
        
        // After animation completes, hide the menu
        setTimeout(() => {
            if (!navbarMenu.classList.contains('mobile-active')) {
                navbarMenu.style.display = '';
            }
        }, 300); // Match the CSS transition time
    }
}

// ===== DATA MANAGEMENT =====

function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('trackitAppData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            // Merge the saved data with default values for any new properties
            appData = {
                ...appData,
                ...parsedData
            };
            
            console.log('Data loaded from localStorage:', appData);
        } else {
            console.log('No saved data found in localStorage');
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        showToast('Error loading your data. Some features may not work correctly.', 'error');
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('trackitAppData', JSON.stringify(appData));
        console.log('Data saved to localStorage');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showToast('Error saving your data. Please export your data to prevent loss.', 'error');
    }
}

function clearAllData() {
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
        },
        achievements: []
    };
    
    saveToLocalStorage();
    showToast('All data has been cleared.', 'info');
    
    // Reload the page to reflect changes
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

function exportData() {
    try {
        const dataStr = JSON.stringify(appData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const downloadLink = document.createElement('a');
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        downloadLink.href = url;
        downloadLink.download = `trackit-backup-${date}.json`;
        
        // Append to body, click, and remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up the URL
        URL.revokeObjectURL(url);
        
        showToast('Data exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting data:', error);
        showToast('Error exporting data. Please try again.', 'error');
    }
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate the imported data
            if (!importedData.habits || !Array.isArray(importedData.habits)) {
                throw new Error('Invalid data format: Missing habits array');
            }
            
            // Merge with current data structure to ensure all properties exist
            appData = {
                ...appData,
                ...importedData
            };
            
            saveToLocalStorage();
            showToast('Data imported successfully!', 'success');
            
            // Reload the page to apply imported data
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error importing data:', error);
            showToast('Error importing data: ' + error.message, 'error');
        }
    };
    
    reader.onerror = function() {
        showToast('Error reading the file. Please try again.', 'error');
    };
    
    reader.readAsText(file);
}

// ===== THEME MANAGEMENT =====

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// ===== DASHBOARD PAGE =====

function setupDashboardPage() {
    console.log("Setting up dashboard page");
    
    // Set up today's date display
    if (domElements.todayDate) {
        domElements.todayDate.textContent = formatDateLong(new Date());
    }
    
    // Set up filter dropdown
    setupFilterDropdown();
    
    // Set up quick add button and modal
    setupQuickAddModal();
    
    // Ensure categories are populated in dropdown
    populateCategoryDropdown();
    
    // Setup empty state add button
    if (domElements.emptyAddBtn) {
        domElements.emptyAddBtn.addEventListener('click', () => {
            showQuickAddModal();
        });
    }
    
    // Render habits list
    renderDashboardHabits();
    
    // Setup weekday selector in the quick add modal
    setupWeekdaySelector();
    
    // Show welcome toast for first time users
    if (isLocalStorageEmpty()) {
        setTimeout(() => {
            showToast('Welcome to TrackIt! We\'ve added some example habits to help you get started.', 'info', 5000);
        }, 1000);
    }
    
    // Setup responsive layout
    setupResponsiveLayout();
    
    // Enhance mobile interactions
    enhanceMobileInteractions();
}

// Setup weekday selector in quick add modal
function setupWeekdaySelector() {
    const weekdayButtons = document.querySelectorAll('.weekday-btn');
    if (weekdayButtons) {
        weekdayButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
            });
        });
    }
}

// Render habits on dashboard
function renderDashboardHabits() {
    console.log("Rendering dashboard habits");
    
    if (!domElements.habitsContainer || !domElements.emptyState) {
        console.error("Required DOM elements not found");
        return;
    }
    
    // Clear existing habits
    domElements.habitsContainer.innerHTML = '';
    
    // Show/hide empty state based on habits length
    if (appData.habits.length === 0) {
        domElements.emptyState.style.display = 'flex';
        domElements.habitsContainer.style.display = 'none';
        return;
    } else {
        domElements.emptyState.style.display = 'none';
        domElements.habitsContainer.style.display = 'grid';
    }
    
    // Get today's date for filtering
    const today = formatDate(new Date());
    
    // Get selected filter
    const filterText = document.getElementById('filter-text');
    const filter = filterText ? filterText.getAttribute('data-filter') || 'all' : 'all';
    
    // Filter habits based on selected filter
    let filteredHabits = appData.habits;
    if (filter === 'completed') {
        filteredHabits = appData.habits.filter(habit => habit.history && habit.history[today]);
    } else if (filter === 'pending') {
        filteredHabits = appData.habits.filter(habit => !habit.history || !habit.history[today]);
    }
    
    console.log(`Rendering ${filteredHabits.length} habits with filter: ${filter}`);
    
    // Render habit cards from template
    const template = document.getElementById('habit-card-template');
    
    if (!template) {
        console.error('Habit card template not found');
        return;
    }
    
    filteredHabits.forEach(habit => {
        const habitCard = document.importNode(template.content, true);
        
        // Set habit name
        const habitName = habitCard.querySelector('.habit-name');
        if (habitName) habitName.textContent = habit.name;
        
        // Set category badge
        const categoryBadge = habitCard.querySelector('.habit-category-badge');
        if (categoryBadge) {
            const category = appData.categories.find(c => c.id === habit.category);
            if (category) {
                categoryBadge.textContent = category.name;
                categoryBadge.style.backgroundColor = category.color;
                categoryBadge.style.display = 'inline-block';
            } else {
                categoryBadge.style.display = 'none';
            }
        }
        
        // Set today's checkbox
        const todayCheckbox = habitCard.querySelector('input[type="checkbox"]');
        const todayLabel = habitCard.querySelector('label');
        
        if (todayCheckbox && todayLabel) {
            // Generate unique ID for the checkbox
            const checkboxId = `checkbox-${habit.id}`;
            todayCheckbox.id = checkboxId;
            todayLabel.setAttribute('for', checkboxId);
            
            // Set checked state based on habit history
            todayCheckbox.checked = habit.history && habit.history[today];
            
            // Add event listener for checkbox
            todayCheckbox.addEventListener('change', () => {
                toggleHabitCompletion(habit.id, today, todayCheckbox.checked);
            });
        }
        
        // Set streak count
        const streakCount = habitCard.querySelector('.streak-count');
        if (streakCount) {
            const streak = calculateStreak(habit);
            streakCount.textContent = streak;
        }
        
        // Set streak label (singular/plural)
        const streakLabel = habitCard.querySelector('.streak-label');
        if (streakLabel) {
            const streak = calculateStreak(habit);
            streakLabel.textContent = streak === 1 ? 'day streak' : 'day streak';
        }
        
        // Render week tracker
        const weekTracker = habitCard.querySelector('.day-dots');
        if (weekTracker) {
            const lastSevenDays = getLastSevenDays();
            
            lastSevenDays.forEach(date => {
                const dot = document.createElement('div');
                dot.className = 'day-dot';
                
                if (habit.history && habit.history[date]) {
                    dot.classList.add('completed');
                }
                
                const dateObj = new Date(date + 'T00:00:00');
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                dot.setAttribute('data-tooltip', `${dayName} ${date.split('-')[2]}`);
                
                // Make dots clickable to toggle past days
                dot.addEventListener('click', () => {
                    // Don't allow toggling future days
                    const currentDate = new Date();
                    currentDate.setHours(0, 0, 0, 0);
                    
                    const dotDate = new Date(date);
                    dotDate.setHours(0, 0, 0, 0);
                    
                    if (dotDate <= currentDate) {
                        const isCompleted = habit.history && habit.history[date];
                        toggleHabitCompletion(habit.id, date, !isCompleted);
                        
                        // Update the dot's appearance
                        dot.classList.toggle('completed');
                    }
                });
                
                weekTracker.appendChild(dot);
            });
        }
        
        // Add animation class
        habitCard.querySelector('.habit-card').classList.add('fade-in');
        
        // Append the card to the container
        domElements.habitsContainer.appendChild(habitCard);
    });
    
    // Update stat cards
    updateDashboardStats();
}

// Toggle habit completion
function toggleHabitCompletion(habitId, date, completed) {
    console.log(`Toggling habit ${habitId} for ${date}: ${completed}`);
    
    const habitIndex = appData.habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;
    
    // Initialize history object if it doesn't exist
    if (!appData.habits[habitIndex].history) {
        appData.habits[habitIndex].history = {};
    }
    
    // Get the previous state
    const previouslyCompleted = appData.habits[habitIndex].history[date];
    
    if (completed) {
        appData.habits[habitIndex].history[date] = true;
        
        // If this is today's date and it was just marked complete
        if (date === formatDate(new Date()) && !previouslyCompleted) {
            // Check for streak achievements
            const streak = calculateStreak(appData.habits[habitIndex]);
            checkForStreakAchievements(streak);
        }
    } else {
        delete appData.habits[habitIndex].history[date];
    }
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update dashboard stats and re-render (to update streak display)
    updateDashboardStats();
    renderDashboardHabits();
}

// Check for streak achievements and show notifications
function checkForStreakAchievements(streak) {
    // Define streak milestones
    const streakMilestones = [3, 7, 14, 21, 30, 60, 90, 180, 365];
    
    // Check if current streak matches any milestone
    if (streakMilestones.includes(streak) && appData.settings.showAchievements) {
        // Show achievement notification
        const achievementPopup = document.getElementById('achievement-popup');
        const achievementTitle = document.getElementById('achievement-title');
        const achievementMessage = document.getElementById('achievement-message');
        
        if (achievementPopup && achievementTitle && achievementMessage) {
            achievementTitle.textContent = 'Achievement Unlocked!';
            achievementMessage.textContent = `You've reached a ${streak}-day streak! Keep going!`;
            
            // Add to achievements list if not already there
            const achievementId = `streak-${streak}`;
            if (!appData.achievements.includes(achievementId)) {
                appData.achievements.push(achievementId);
                saveToLocalStorage();
            }
            
            // Show the popup with animation
            achievementPopup.classList.add('show');
            
            // Hide after 5 seconds
            setTimeout(() => {
                achievementPopup.classList.remove('show');
            }, 5000);
        }
    }
}

// Update the summary statistics
function updateDashboardStats() {
    console.log("Updating dashboard stats");
    
    // Get today's date
    const today = formatDate(new Date());
    
    // Update total habits count
    if (domElements.totalHabits) {
        domElements.totalHabits.textContent = appData.habits.length;
    }
    
    // Calculate completion rate
    const completedToday = appData.habits.filter(h => h.history && h.history[today]).length;
    const completionRate = appData.habits.length > 0 ? Math.round((completedToday / appData.habits.length) * 100) : 0;
    
    // Update completion rate display
    if (domElements.completionRate) {
        domElements.completionRate.textContent = completionRate + '%';
    }
    
    // Calculate best streak
    let bestStreak = 0;
    appData.habits.forEach(habit => {
        const streak = calculateStreak(habit);
        if (streak > bestStreak) {
            bestStreak = streak;
        }
    });
    
    // Update streak display
    if (domElements.streakCounter) {
        domElements.streakCounter.textContent = bestStreak;
    }
}

function setupFilterDropdown() {
    if (!domElements.filterDropdown || !domElements.dropdownMenu) {
        return;
    }
    
    domElements.filterDropdown.addEventListener('click', () => {
        domElements.dropdownMenu.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!domElements.filterDropdown.contains(e.target) && 
            !domElements.dropdownMenu.contains(e.target)) {
            domElements.dropdownMenu.classList.remove('show');
        }
    });
    
    // Handle filter selection
    const dropdownItems = domElements.dropdownMenu.querySelectorAll('.dropdown-item');
    const filterText = document.getElementById('filter-text');
    
    if (dropdownItems && filterText) {
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all items
                dropdownItems.forEach(i => i.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                
                // Update filter text
                const filter = item.getAttribute('data-filter');
                filterText.textContent = item.textContent;
                filterText.setAttribute('data-filter', filter);
                
                // Close dropdown
                domElements.dropdownMenu.classList.remove('show');
                
                // Render filtered habits
                renderDashboardHabits();
            });
        });
    }
}

function setupQuickAddModal() {
    if (!domElements.quickAddButton || !domElements.quickAddModal) {
        return;
    }
    
    // Quick Add button opens modal
    domElements.quickAddButton.addEventListener('click', showQuickAddModal);
    
    // Close button closes modal
    if (domElements.closeModalBtn) {
        domElements.closeModalBtn.addEventListener('click', hideQuickAddModal);
    }
    
    // Cancel button closes modal
    if (domElements.cancelAddBtn) {
        domElements.cancelAddBtn.addEventListener('click', hideQuickAddModal);
    }
    
    // Confirm button adds new habit
    if (domElements.confirmAddBtn) {
        domElements.confirmAddBtn.addEventListener('click', addNewHabit);
    }
    
    // Enter key in habit name input also adds habit
    if (domElements.habitNameInput) {
        domElements.habitNameInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                addNewHabit();
            }
        });
    }
    
}

// Replace the showQuickAddModal function with this enhanced version

function showQuickAddModal() {
    console.log("Showing quick add modal");
    const modal = document.getElementById('quick-add-modal');
    
    if (modal) {
        // Force reflow to ensure animation works
        void modal.offsetWidth;
        modal.classList.add('show');
        
        // Get the input fields directly in case DOM elements weren't properly cached
        const nameInput = document.getElementById('habit-name');
        const categorySelect = document.getElementById('habit-category');
        
        // Populate the category dropdown with latest categories
        populateCategoryDropdown();
        
        // Reset form fields and focus on input
        if (nameInput) {
            nameInput.value = '';
            setTimeout(() => {
                nameInput.focus();
            }, 100);
        }
        
        if (categorySelect) {
            categorySelect.value = '';
        }
        
        // Reset weekday selector
        const weekdayButtons = document.querySelectorAll('.weekday-btn');
        if (weekdayButtons) {
            weekdayButtons.forEach(btn => {
                btn.classList.add('active');
            });
        }
        
        // Ensure the confirm button has the correct event listener
        const confirmBtn = document.getElementById('confirm-add');
        if (confirmBtn) {
            // Remove any existing listeners to prevent duplicates
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            
            // Add new listener
            newConfirmBtn.addEventListener('click', addNewHabit);
        }
    } else {
        console.error("Modal element not found!");
        showToast("Error loading the add habit form. Please refresh the page.", "error");
    }
}

function hideQuickAddModal() {
    if (domElements.quickAddModal) {
        domElements.quickAddModal.classList.remove('show');
    }
}

// Replace the addNewHabit function with this enhanced version

function addNewHabit() {
    console.log("Adding new habit");
    
    // Get input values directly in case DOM references are stale
    const nameInput = document.getElementById('habit-name');
    const categorySelect = document.getElementById('habit-category');
    
    if (!nameInput) {
        showToast('Error: Form elements not found', 'error');
        return;
    }
    
    const habitName = nameInput.value.trim();
    
    if (!habitName) {
        showToast('Please enter a habit name', 'warning');
        return;
    }
    
    // Get selected weekdays
    const selectedDays = [];
    const weekdayButtons = document.querySelectorAll('.weekday-btn');
    
    if (weekdayButtons.length > 0) {
        weekdayButtons.forEach(btn => {
            if (btn.classList.contains('active')) {
                selectedDays.push(parseInt(btn.dataset.day));
            }
        });
    } else {
        // If no weekday selector, default to all days
        selectedDays.push(0, 1, 2, 3, 4, 5, 6);
    }
    
    // Create new habit object
    const newHabit = {
        id: 'habit_' + Date.now(),
        name: habitName,
        category: categorySelect ? categorySelect.value : '',
        createdAt: new Date().toISOString(),
        history: {},
        trackDays: selectedDays.length > 0 ? selectedDays : [0, 1, 2, 3, 4, 5, 6] // Default to all days if none selected
    };
    
    console.log("Adding new habit:", newHabit);
    
    try {
        // Add to habits array
        appData.habits.push(newHabit);
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Close modal
        const modal = document.getElementById('quick-add-modal');
        if (modal) modal.classList.remove('show');
        
        // Show success message
        showToast(`'${habitName}' added successfully!`, 'success');
        
        // Re-render habits with a slight delay to ensure UI updates
        setTimeout(() => {
            if (currentPage === 'index') {
                renderDashboardHabits();
            } else if (currentPage === 'manage') {
                renderManageHabitsList();
            }
        }, 100);
    } catch (error) {
        console.error("Error adding habit:", error);
        showToast("Error adding habit. Please try again.", "error");
    }
}

// Setup confirmation modal
function setupConfirmationModal() {
    if (!domElements.confirmationModal) return;
    
    // Close button
    if (domElements.closeConfirmModal) {
        domElements.closeConfirmModal.addEventListener('click', () => {
            domElements.confirmationModal.classList.remove('show');
        });
    }
    
    // Cancel button
    if (domElements.modalCancel) {
        domElements.modalCancel.addEventListener('click', () => {
            domElements.confirmationModal.classList.remove('show');
        });
    }
}

// Fix for the confirmation modal to ensure the callback is executed properly
function showConfirmationModal(title, message, confirmCallback) {
    // Create a new modal each time to avoid event handling issues
    let existingModal = document.getElementById('confirmation-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'confirmation-modal';
    modal.className = 'modal';
    
    // Insert content directly into the HTML to avoid DOM selection issues
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="btn-close"><span class="material-icons-round">close</span></button>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-btn">Cancel</button>
                <button class="btn btn-danger" id="confirm-btn">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show the modal after a tiny delay to ensure proper rendering
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Define close function
    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300); // Match transition time
    };
    
    // Set up event handlers with direct references
    modal.querySelector('.btn-close').addEventListener('click', closeModal);
    modal.querySelector('#cancel-btn').addEventListener('click', closeModal);
    modal.querySelector('#confirm-btn').addEventListener('click', () => {
        closeModal();
        // Use a short timeout to ensure modal is closed before action
        setTimeout(() => confirmCallback(), 50);
    });
}

// Add this function to fix the settings page functionality

function setupSettingsPage() {
    console.log("Setting up settings page");
    
    // Get all settings elements
    const themeToggle = document.getElementById('theme-toggle');
    const weekStartDay = document.getElementById('week-start-day');
    const reminderTime = document.getElementById('reminder-time');
    const showReminders = document.getElementById('show-reminders');
    const categoriesList = document.getElementById('categories-list');
    const newCategoryName = document.getElementById('new-category-name');
    const newCategoryColor = document.getElementById('new-category-color');
    const addCategoryBtn = document.getElementById('add-category-btn');
    
    // Set initial values from appData
    if (themeToggle) {
        themeToggle.checked = appData.theme === 'dark';
    }
    
    if (weekStartDay) {
        weekStartDay.value = appData.settings.weekStartsOn.toString();
    }
    
    if (reminderTime) {
        reminderTime.value = appData.settings.reminderTime;
    }
    
    if (showReminders) {
        showReminders.checked = appData.settings.showReminders;
    }
    
    // Add event listeners for settings changes
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'dark' : 'light';
            document.body.classList.toggle('dark-theme', themeToggle.checked);
            appData.theme = newTheme;
            saveToLocalStorage();
        });
    }
    
    if (weekStartDay) {
        weekStartDay.addEventListener('change', () => {
            appData.settings.weekStartsOn = parseInt(weekStartDay.value);
            saveToLocalStorage();
            showToast('Week start day updated', 'success');
        });
    }
    
    if (reminderTime) {
        reminderTime.addEventListener('change', () => {
            appData.settings.reminderTime = reminderTime.value;
            saveToLocalStorage();
            showToast('Reminder time updated', 'success');
        });
    }
    
    if (showReminders) {
        showReminders.addEventListener('change', () => {
            appData.settings.showReminders = showReminders.checked;
            saveToLocalStorage();
            showToast('Reminder settings updated', 'success');
        });
    }
    
    // Render categories list
    renderCategoriesList();
    
    // Add category button functionality
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', addNewCategory);
    }
    
    // Force CSS styles to apply
    forceStylesToApply();
    
    console.log("Settings page setup complete");
}

// Function to render the categories list
function renderCategoriesList() {
    const categoriesList = document.getElementById('categories-list');
    if (!categoriesList) return;
    
    categoriesList.innerHTML = '';
    
    appData.categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        
        categoryItem.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div class="category-color" style="background-color: ${category.color}"></div>
                <div class="category-name">${category.name}</div>
            </div>
            <div class="category-actions">
                <button class="btn btn-sm btn-edit" data-id="${category.id}" title="Edit">
                    <span class="material-icons-round">edit</span>
                </button>
                <button class="btn btn-sm btn-delete" data-id="${category.id}" title="Delete">
                    <span class="material-icons-round">delete</span>
                </button>
            </div>
        `;
        
        categoriesList.appendChild(categoryItem);
        
        // Add event listeners for edit and delete buttons
        const editBtn = categoryItem.querySelector('.btn-edit');
        const deleteBtn = categoryItem.querySelector('.btn-delete');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => editCategory(category.id));
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteCategory(category.id));
        }
    });
}

// Function to add a new category
function addNewCategory() {
    console.log("Adding new category");
    const newCategoryName = document.getElementById('new-category-name');
    const newCategoryColor = document.getElementById('new-category-color');
    
    if (!newCategoryName || !newCategoryColor) {
        console.error("Category form elements not found");
        return;
    }
    
    const name = newCategoryName.value.trim();
    const color = newCategoryColor.value;
    
    if (!name) {
        showToast('Please enter a category name', 'warning');
        return;
    }
    
    // Check for duplicate names
    const isDuplicate = appData.categories.some(cat => 
        cat.name.toLowerCase() === name.toLowerCase());
    
    if (isDuplicate) {
        showToast('A category with this name already exists', 'warning');
        return;
    }
    
    // Create new category
    const newCategory = {
        id: 'cat_' + Date.now(),
        name: name,
        color: color
    };
    
    // Add to categories array
    appData.categories.push(newCategory);
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Clear form
    newCategoryName.value = '';
    
    // Re-render categories list
    renderCategoriesList();
    
    // Show success message
    showToast(`Category "${name}" added successfully`, 'success');
}

// Function to edit a category
function editCategory(categoryId) {
    const category = appData.categories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    // Create a simple inline edit form
    const categoryItem = document.querySelector(`.category-item .btn-edit[data-id="${categoryId}"]`).closest('.category-item');
    
    const originalContent = categoryItem.innerHTML;
    
    categoryItem.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
            <input type="color" class="color-picker" value="${category.color}">
            <input type="text" class="form-control" value="${category.name}" style="flex: 1;">
        </div>
        <div class="category-actions">
            <button class="btn btn-sm btn-save" title="Save">
                <span class="material-icons-round">check</span>
            </button>
            <button class="btn btn-sm btn-cancel" title="Cancel">
                <span class="material-icons-round">close</span>
            </button>
        </div>
    `;
    
    const colorInput = categoryItem.querySelector('input[type="color"]');
    const nameInput = categoryItem.querySelector('input[type="text"]');
    const saveBtn = categoryItem.querySelector('.btn-save');
    const cancelBtn = categoryItem.querySelector('.btn-cancel');
    
    saveBtn.addEventListener('click', () => {
        const newName = nameInput.value.trim();
        const newColor = colorInput.value;
        
        if (!newName) {
            showToast('Category name cannot be empty', 'warning');
            return;
        }
        
        // Update category
        category.name = newName;
        category.color = newColor;
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Re-render categories
        renderCategoriesList();
        
        showToast('Category updated', 'success');
    });
    
    cancelBtn.addEventListener('click', () => {
        categoryItem.innerHTML = originalContent;
        
        // Re-add event listeners
        const editBtn = categoryItem.querySelector('.btn-edit');
        const deleteBtn = categoryItem.querySelector('.btn-delete');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => editCategory(categoryId));
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteCategory(categoryId));
        }
    });
    
    // Focus the input field
    nameInput.focus();
}

// Function to delete a category
function deleteCategory(categoryId) {
    // Check if any habits use this category
    const habitsUsingCategory = appData.habits.filter(h => h.category === categoryId);
    
    if (habitsUsingCategory.length > 0) {
        showConfirmationModal(
            'Delete Category?', 
            `This category is used by ${habitsUsingCategory.length} habits. Deleting it will remove the category from these habits. Continue?`,
            () => {
                // Update habits to remove this category
                appData.habits.forEach(habit => {
                    if (habit.category === categoryId) {
                        habit.category = '';
                    }
                });
                
                // Remove the category
                appData.categories = appData.categories.filter(cat => cat.id !== categoryId);
                
                // Save to localStorage
                saveToLocalStorage();
                
                // Re-render categories
                renderCategoriesList();
                
                showToast('Category deleted', 'success');
            }
        );
    } else {
        // Simple delete without confirmation if no habits use this category
        appData.categories = appData.categories.filter(cat => cat.id !== categoryId);
        saveToLocalStorage();
        renderCategoriesList();
        showToast('Category deleted', 'success');
    }
}

// Update renderManageHabitsList to include proper data-label attributes for mobile display
// filepath: e:\TrackIt\TrackIt\script.js
function renderManageHabitsList() {
    console.log("Rendering manage habits list");
    
    const habitsList = document.getElementById('habits-list');
    if (!habitsList) {
        console.error("Habits list container not found");
        return;
    }
    
    // Clear existing content
    habitsList.innerHTML = '';
    
    // Show message if no habits exist
    if (appData.habits.length === 0) {
        habitsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <span class="material-icons-round">fact_check</span>
                </div>
                <h3>No habits yet</h3>
                <p>Add your first habit to start tracking</p>
                <button class="btn btn-primary" id="manage-empty-add-btn">
                    <span class="material-icons-round">add</span> Add Habit
                </button>
            </div>
        `;
        
        // Add event listener to the empty state add button
        const emptyAddBtn = document.getElementById('manage-empty-add-btn');
        if (emptyAddBtn) {
            emptyAddBtn.addEventListener('click', showQuickAddModal);
        }
        
        return;
    }
    
    // Create table for habits
    const table = document.createElement('table');
    table.className = 'habits-table';
    
    // Add table header
    table.innerHTML = `
        <thead>
            <tr>
                <th>Habit</th>
                <th>Category</th>
                <th>Current Streak</th>
                <th>Best Streak</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    // Sort habits by name for easier browsing
    const sortedHabits = [...appData.habits].sort((a, b) => a.name.localeCompare(b.name));
    
    // Add each habit as a row
    sortedHabits.forEach(habit => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', habit.id);
        
        // Find category name and color
        const category = appData.categories.find(c => c.id === habit.category);
        const categoryName = category ? category.name : 'None';
        const categoryColor = category ? category.color : '#CCC';
        
        // Calculate streaks
        const currentStreak = calculateCurrentStreak(habit);
        const bestStreak = calculateStreak(habit);
        
        tr.innerHTML = `
            <td class="habit-name-cell">${habit.name}</td>
            <td data-label="Category">
                <span class="category-badge" style="background-color: ${categoryColor}">
                    ${categoryName}
                </span>
            </td>
            <td data-label="Current Streak">${currentStreak} days</td>
            <td data-label="Best Streak">${bestStreak} days</td>
            <td class="actions-cell" data-label="Actions">
                <button class="btn btn-sm btn-edit" title="Edit">
                    <span class="material-icons-round">edit</span>
                </button>
                <button class="btn btn-sm btn-delete" title="Delete">
                    <span class="material-icons-round">delete</span>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
        
        // Add event listeners for edit and delete buttons
        const editBtn = tr.querySelector('.btn-edit');
        const deleteBtn = tr.querySelector('.btn-delete');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                editHabit(habit.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                showConfirmationModal(
                    'Delete Habit?',
                    `Are you sure you want to delete "${habit.name}"? This will remove all tracking history for this habit.`,
                    () => deleteHabit(habit.id)
                );
            });
        }
    });
    
    habitsList.appendChild(table);
    
    // Add animation class to fade in the table
    table.classList.add('fade-in');
}

// Setup the Manage Habits page
function setupManagePage() {
    console.log("Setting up manage page");

    // Render the list of habits
    renderManageHabitsList();
    
    // Setup the add habit form
    const addHabitForm = document.querySelector('.add-habit-form');
    const newHabitInput = document.getElementById('new-habit-input');
    const addNewHabitBtn = document.getElementById('add-new-habit-btn');
    
    if (addHabitForm) {
        // Form submission handler
        addHabitForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addHabitFromManagePage();
        });
    }
    
    if (addNewHabitBtn) {
        // Button click handler
        addNewHabitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addHabitFromManagePage();
        });
    }
    
    // Setup the search functionality
    const habitSearch = document.getElementById('habit-search');
    if (habitSearch) {
        habitSearch.addEventListener('input', function() {
            filterManageHabitsList(this.value);
        });
    }
    
    // Setup the reset all button
    const resetAllBtn = document.getElementById('reset-all-btn');
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', function() {
            showConfirmationModal(
                'Reset All Habits?',
                'This will clear all habit history but keep your habits. This action cannot be undone.',
                resetAllHabitsHistory
            );
        });
    }
    
    // Add habit button for showing modal
    const addHabitButton = document.getElementById('add-habit-btn');
    if (addHabitButton) {
        addHabitButton.addEventListener('click', showQuickAddModal);
    }
    
    console.log("Manage page setup complete");
}

// Add habit from manage page form
function addHabitFromManagePage() {
    const newHabitInput = document.getElementById('new-habit-input');
    if (!newHabitInput) return;
    
    const habitName = newHabitInput.value.trim();
    
    if (habitName === '') {
        showToast('Please enter a habit name', 'warning');
        return;
    }
    
    // Create new habit
    const newHabit = {
        id: 'habit_' + Date.now(),
        name: habitName,
        category: '',  // Default to no category
        createdAt: new Date().toISOString(),
        history: {},
        trackDays: [0, 1, 2, 3, 4, 5, 6]  // Track every day by default
    };
    
    // Add to habits array
    appData.habits.push(newHabit);
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Clear input
    newHabitInput.value = '';
    
    // Re-render habits list
    renderManageHabitsList();
    
    // Show success message
    showToast(`Habit '${habitName}' added successfully`, 'success');
}

// Filter habits list based on search input
function filterManageHabitsList(searchTerm) {
    const rows = document.querySelectorAll('.habits-table tbody tr');
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const habitName = row.querySelector('.habit-name-cell').textContent.toLowerCase();
        
        if (habitName.includes(lowerSearchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Reset all habits history
function resetAllHabitsHistory() {
    appData.habits.forEach(habit => {
        habit.history = {};
    });
    
    saveToLocalStorage();
    renderManageHabitsList();
    
    showToast('All habit history has been reset', 'info');
}

// ===== ANALYTICS PAGE =====

function setupAnalyticsPage() {
    // Render all analytics components
    renderAnalytics();
    
    // Add event listeners for chart type toggles
    setupChartTypeToggles();
    
    // Setup print button
    const printButton = document.getElementById('print-analytics');
    if (printButton) {
        printButton.addEventListener('click', printAnalyticsReport);
    }
}

function renderAnalytics() {
    // Update summary statistics
    updateAnalyticsSummary();
    
    // Render weekly chart (bar chart by default)
    renderWeeklyChart('bar_chart');
    
    // Render monthly chart (line chart by default)
    renderMonthlyChart('show_chart');
    
    // Update quote
    updateMotivationalQuote();
}

function updateAnalyticsSummary() {
    // Update total habits count
    if (domElements.totalHabitsCount) {
        domElements.totalHabitsCount.textContent = appData.habits.length;
    }
    
    // Calculate best streak
    let bestStreak = 0;
    let bestHabit = null;
    
    appData.habits.forEach(habit => {
        const streak = calculateStreak(habit);
        if (streak > bestStreak) {
            bestStreak = streak;
            bestHabit = habit;
        }
    });
    
    // Update best streak display
    if (domElements.bestStreakElement) {
        domElements.bestStreakElement.textContent = bestStreak;
    }
    
    // Calculate current streaks sum
    let totalCurrentStreak = 0;
    appData.habits.forEach(habit => {
        totalCurrentStreak += calculateCurrentStreak(habit);
    });
    
    if (domElements.currentStreakValue) {
        domElements.currentStreakValue.textContent = totalCurrentStreak + ' days';
    }
    
    // Calculate completion rate
    const today = formatDate(new Date());
    const completedToday = appData.habits.filter(h => h.history && h.history[today]).length;
    const completionRate = appData.habits.length > 0 ? Math.round((completedToday / appData.habits.length) * 100) : 0;
    
    if (domElements.completionRateElement) {
        domElements.completionRateElement.textContent = completionRate + '%';
    }
    
    // Find most consistent habit
    let mostConsistentHabit = null;
    let highestCompletionRate = 0;
    
    const last30Days = getLastThirtyDays();
    
    appData.habits.forEach(habit => {
        let completedDays = 0;
        
        last30Days.forEach(date => {
            if (habit.history && habit.history[date]) {
                completedDays++;
            }
        });
        
        const habitCompletionRate = completedDays / last30Days.length;
        
        if (habitCompletionRate > highestCompletionRate) {
            highestCompletionRate = habitCompletionRate;
            mostConsistentHabit = habit;
        }
    });
    
    // Update most active day
    const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    
    appData.habits.forEach(habit => {
        if (!habit.history) return;
        
        Object.keys(habit.history).forEach(date => {
            if (habit.history[date]) {
                const day = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
                dayCount[day]++;
            }
        });
    });
    
    let mostActiveDay = 0;
    let mostCompletions = 0;
    
    dayCount.forEach((count, index) => {
        if (count > mostCompletions) {
            mostCompletions = count;
            mostActiveDay = index;
        }
    });
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (domElements.mostActiveDayElement) {
        domElements.mostActiveDayElement.textContent = dayNames[mostActiveDay];
    }
}

// Update all analytics data
function updateAnalyticsData() {
    renderAnalytics();
}

// Update renderWeeklyChart to accept a chart type parameter
function renderWeeklyChart(chartType = 'bar_chart') {
    const weeklyChart = document.getElementById('weekly-chart');
    if (!weeklyChart) return;
    
    // Clear existing content
    weeklyChart.innerHTML = '';
    
    // If no habits, show placeholder
    if (appData.habits.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-chart-placeholder';
        emptyState.innerHTML = `
            <span class="material-icons-round">insights</span>
            <p>Add habits to see your weekly progress</p>
        `;
        weeklyChart.appendChild(emptyState);
        return;
    }
    
    if (chartType === 'bar_chart') {
        // Create bar chart visualization
        const chartContainer = document.createElement('div');
        chartContainer.classList.add('bar-chart');
        
        const weekDates = getLastSevenDays();
        
        // Process each actual date
        weekDates.forEach((date, index) => {
            // Get the actual day name for this date
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            
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
                <div class="chart-label">${dayName}</div>
                <div class="chart-value">${Math.round(percentage)}%</div>
            `;
            
            chartContainer.appendChild(column);
        });
        
        weeklyChart.appendChild(chartContainer);
    } else if (chartType === 'pie_chart') {
        // Create a simple pie chart visualization
        const chartContainer = document.createElement('div');
        chartContainer.classList.add('pie-chart-container');
        
        // Calculate completed vs total
        let totalCompleted = 0;
        let totalPossible = 0;
        
        const weekDates = getLastSevenDays();
        weekDates.forEach(date => {
            appData.habits.forEach(habit => {
                totalPossible++;
                if (habit.history && habit.history[date]) {
                    totalCompleted++;
                }
            });
        });
        
        const completionPercentage = totalPossible > 0 
            ? Math.round((totalCompleted / totalPossible) * 100) 
            : 0;
        
        // Create visual pie chart with CSS
        chartContainer.innerHTML = `
            <div class="pie-chart-wrapper">
                <div class="pie-chart" style="background-image: conic-gradient(var(--primary) ${completionPercentage}%, var(--bg-tertiary) 0)"></div>
                <div class="pie-chart-label">${completionPercentage}%</div>
            </div>
            <div class="pie-chart-legend">
                <div class="legend-item">
                    <span class="legend-color" style="background-color: var(--primary)"></span>
                    <span>Completed (${totalCompleted})</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color" style="background-color: var(--bg-tertiary)"></span>
                    <span>Missed (${totalPossible - totalCompleted})</span>
                </div>
            </div>
        `;
        
        weeklyChart.appendChild(chartContainer);
    }
}

// Update renderMonthlyChart to accept a chart type parameter
function renderMonthlyChart(chartType = 'show_chart') {
    const container = document.getElementById('monthly-chart');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // If no habits, show placeholder
    if (appData.habits.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-chart-placeholder';
        emptyState.innerHTML = `
            <span class="material-icons-round">insights</span>
            <p>Add habits to see your monthly trends</p>
        `;
        container.appendChild(emptyState);
        return;
    }
    
    // Create canvas for drawing
    const canvas = document.createElement('canvas');
    canvas.id = 'monthly-canvas';
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get dates for the last 30 days
    const dates = getLastThirtyDays();
    
    // Calculate completion rates
    const completionRates = dates.map(date => {
        const completedCount = appData.habits.filter(h => h.history && h.history[date]).length;
        return appData.habits.length > 0 
            ? (completedCount / appData.habits.length) * 100 
            : 0;
    });
    
    // Draw chart based on selected type
    if (chartType === 'show_chart') {
        // Line chart
        drawLineChart(ctx, canvas.width, canvas.height, completionRates);
    } else {
        // Stacked area chart
        drawStackedAreaChart(ctx, canvas.width, canvas.height, completionRates);
    }
}

function drawLineChart(ctx, width, height, data) {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--border-color')
        .trim() || '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw grid lines
    ctx.beginPath();
    ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--border-color')
        .trim() || '#E2E8F0';
    ctx.globalAlpha = 0.2;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
        const x = padding + (chartWidth / 6) * i;
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
    }
    
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    // Draw axis labels
    ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--text-secondary')
        .trim() || '#718096';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    // Y-axis labels (0% to 100%)
    for (let i = 0; i <= 5; i++) {
        const label = (100 - i * 20) + '%';
        const y = padding + (chartHeight / 5) * i;
        ctx.fillText(label, padding - 5, y);
    }
    
    // X-axis labels (dates)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const step = Math.floor(data.length / 6);
    for (let i = 0; i < data.length; i += step) {
        if (i < data.length) {
            const x = padding + (chartWidth * (i / (data.length - 1)));
            const date = new Date();
            date.setDate(date.getDate() - (data.length - 1 - i));
            const label = (date.getMonth() + 1) + '/' + date.getDate();
            
            ctx.fillText(label, x, height - padding + 5);
        }
    }
    
    // Draw data line
    ctx.beginPath();
    ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim() || '#5570F1';
    ctx.lineWidth = 2;
    
    data.forEach((rate, index) => {
        const x = padding + (chartWidth * (index / (data.length - 1)));
        const y = height - padding - (chartHeight * (rate / 100));
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw gradient area under the line
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, getComputedStyle(document.documentElement)
        .getPropertyValue('--primary-light')
        .trim() || 'rgba(85, 112,241, 0.1)');
    gradient.addColorStop(1, 'rgba(85, 112, 241, 0)');
    
    ctx.beginPath();
    data.forEach((rate, index) => {
        const x = padding + (chartWidth * (index / (data.length - 1)));
        const y = height - padding - (chartHeight * (rate / 100));
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.lineTo(padding + chartWidth, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw data points
    data.forEach((rate, index) => {
        const x = padding + (chartWidth * (index / (data.length - 1)));
        const y = height - padding - (chartHeight * (rate / 100));
        
        ctx.beginPath();
        ctx.fillStyle = '#FFFFFF';
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary')
            .trim() || '#5570F1';
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawStackedAreaChart(ctx, width, height, data) {
    // Similar to line chart but with different styling to appear as a stacked area chart
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--border-color')
        .trim() || '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw grid lines (same as line chart)
    ctx.beginPath();
    ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--border-color')
        .trim() || '#E2E8F0';
    ctx.globalAlpha = 0.2;
    
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
    }
    
    for (let i = 0; i <= 6; i++) {
        const x = padding + (chartWidth / 6) * i;
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
    }
    
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    // Draw axis labels (same as line chart)
    ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--text-secondary')
        .trim() || '#718096';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 5; i++) {
        const label = (100 - i * 20) + '%';
        const y = padding + (chartHeight / 5) * i;
        ctx.fillText(label, padding - 5, y);
    }
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const step = Math.floor(data.length / 6);
    for (let i = 0; i < data.length; i += step) {
        if (i < data.length) {
            const x = padding + (chartWidth * (i / (data.length - 1)));
            const date = new Date();
            date.setDate(date.getDate() - (data.length - 1 - i));
            const label = (date.getMonth() + 1) + '/' + date.getDate();
            
            ctx.fillText(label, x, height - padding + 5);
        }
    }
    
    // Draw completed area
    ctx.beginPath();
    data.forEach((rate, index) => {
        const x = padding + (chartWidth * (index / (data.length - 1)));
        const y = height - padding - (chartHeight * (rate / 100));
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.lineTo(padding + chartWidth, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    
    // Fill with gradient
    const completedGradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    completedGradient.addColorStop(0, getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim() || '#5570F1');
    completedGradient.addColorStop(1, getComputedStyle(document.documentElement)
        .getPropertyValue('--primary-light')
        .trim() || 'rgba(85, 112, 241, 0.3)');
    
    ctx.fillStyle = completedGradient;
    ctx.fill();
}

// Calculate current streak (consecutive days habit was completed)
function calculateCurrentStreak(habit) {
    if (!habit || !habit.history) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight
    
    // Check today and previous days
    for (let i = 0; i < 30; i++) {
        const currentDate = new Date();
        currentDate.setDate(today.getDate() - i);
        currentDate.setHours(0, 0, 0, 0);
        
        const dateString = formatDate(currentDate);
        
        if (habit.history[dateString]) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// Calculate overall streak (not just current - longest period of consecutive days)
function calculateStreak(habit) {
    if (!habit || !habit.history) return 0;
    
    // Convert history keys to dates and sort them
    const dates = Object.keys(habit.history)
        .filter(date => habit.history[date]) // Only include completed dates
        .map(date => new Date(date))
        .sort((a, b) => a - b);
    
    if (dates.length === 0) return 0;
    
    let currentStreak = 1;
    let maxStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
        const dayDiff = (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
            // Consecutive day
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else if (dayDiff > 1) {
            // Break in the streak
            currentStreak = 1;
        }
    }
    
    return maxStreak;
}

// Helper function to get last thirty days
function getLastThirtyDays() {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(formatDate(date));
    }
    return dates;
}

// Format date to YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format date to more readable format (e.g., "Monday, October 21, 2025")
function formatDateLong(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Get last seven days as array of formatted dates
function getLastSevenDays() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(formatDate(date));
    }
    return dates;
}

// Add this function to directly attach event listeners to all add habit buttons

function ensureAddHabitButtonsWork() {
    console.log("Ensuring add habit buttons work");
    
    // Quick add button on dashboard
    const quickAddButton = document.getElementById('quick-add');
    if (quickAddButton) {
        // Remove any existing listeners to prevent duplicates
        const newQuickAddButton = quickAddButton.cloneNode(true);
        quickAddButton.parentNode.replaceChild(newQuickAddButton, quickAddButton);
        newQuickAddButton.addEventListener('click', showQuickAddModal);
        console.log("Quick add button listener attached");
    }
    
    // Empty state add button
    const emptyAddBtn = document.getElementById('empty-add-btn');
    if (emptyAddBtn) {
        // Remove any existing listeners to prevent duplicates
        const newEmptyAddBtn = emptyAddBtn.cloneNode(true); // This variable was missing or incorrectly referenced
        emptyAddBtn.parentNode.replaceChild(newEmptyAddBtn, emptyAddBtn);
        newEmptyAddBtn.addEventListener('click', showQuickAddModal);
        console.log("Empty add button listener attached");
    }
    
    // Add habit button on manage page
    const addHabitButton = document.getElementById('add-habit-btn');
    if (addHabitButton) {
        // Remove any existing listeners to prevent duplicates
        const newAddHabitButton = addHabitButton.cloneNode(true);
        addHabitButton.parentNode.replaceChild(newAddHabitButton, addHabitButton);
        newAddHabitButton.addEventListener('click', () => {
            if (document.getElementById('quick-add-modal')) {
                showQuickAddModal();
            } else {
                const newHabitInput = document.getElementById('new-habit-input');
                if (newHabitInput) newHabitInput.focus();
            }
        });
        console.log("Add habit button listener attached");
    }
}

// Add this function after setupDashboardPage

function setupResponsiveLayout() {
    console.log("Setting up responsive handlers");
    
    // Check if we're on mobile
    const isMobile = window.innerWidth < 768;
    
    // Adjust habit cards grid for mobile
    const habitsContainer = document.getElementById('habits-container');
    if (habitsContainer) {
        if (isMobile) {
            habitsContainer.classList.add('mobile-grid');
        } else {
            habitsContainer.classList.remove('mobile-grid');
        }
    }
    
    // Adjust chart containers for mobile
    const chartContainers = document.querySelectorAll('.chart-card');
    if (chartContainers.length > 0) {
        chartContainers.forEach(container => {
            if (isMobile) {
                container.classList.add('mobile-chart');
            } else {
                container.classList.remove('mobile-chart');
            }
        });
    }
    
    // Listen for window resize events
    window.addEventListener('resize', function() {
        const isMobile = window.innerWidth < 768;
        
        // Re-adjust habit cards grid
        if (habitsContainer) {
            if (isMobile) {
                habitsContainer.classList.add('mobile-grid');
            } else {
                habitsContainer.classList.remove('mobile-grid');
            }
        }
        
        // Re-adjust chart containers
        if (chartContainers.length > 0) {
            chartContainers.forEach(container => {
                if (isMobile) {
                    container.classList.add('mobile-chart');
                } else {
                    container.classList.remove('mobile-chart');
                }
            });
        }
        
        // Re-render charts if necessary
        if (currentPage === 'analytics') {
            const weeklyChartContainer = document.getElementById('weekly-chart');
            const monthlyChartContainer = document.getElementById('monthly-chart');
            
            if (weeklyChartContainer && monthlyChartContainer) {
                // Get current chart types
                const weeklyChartType = document.querySelector('.chart-options button[data-chart="weekly"].active')?.getAttribute('data-type') || 'bar_chart';
                const monthlyChartType = document.querySelector('.chart-options button[data-chart="monthly"].active')?.getAttribute('data-type') || 'show_chart';
                
                // Re-render with slight delay to allow DOM to update
                setTimeout(() => {
                    renderWeeklyChart(weeklyChartType);
                    renderMonthlyChart(monthlyChartType);
                }, 100);
            }
        }
    });
}

// Add this function to your code

function enhanceMobileInteractions() {
    console.log("Setting up mobile touch interactions");
    
    // Make habit cards more touch-friendly
    const habitCards = document.querySelectorAll('.habit-card');
    if (habitCards.length > 0) {
        habitCards.forEach(card => {
            // Add touch highlight effect
            card.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            card.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
            
            card.addEventListener('touchcancel', function() {
                this.classList.remove('touch-active');
            });
        });
    }
    
    // Make buttons more touch-friendly
    const buttons = document.querySelectorAll('.btn, button');
    if (buttons.length > 0) {
        buttons.forEach(button => {
            // Increase touch target size if needed
            if (button.offsetWidth < 48 || button.offsetHeight < 48) {
                button.classList.add('touch-target-enhanced');
            }
        });
    }
    
    // Fix dropdown menus for touch
    const dropdowns = document.querySelectorAll('.dropdown-toggle');
    if (dropdowns.length > 0) {
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('touchstart', function(e) {
                // Prevent immediate closing of dropdown
                e.preventDefault();
                const dropdownMenu = this.nextElementSibling;
                if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                    dropdownMenu.classList.toggle('show');
                }
            });
        });
    }
}

// Add this function to fix navbar responsiveness issues
function initMobileNavbar() {
    console.log("Initializing mobile navbar");
    
    // Get navbar elements
    const navbarMenu = document.getElementById('navbar-menu');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelectorAll('#navbar-menu a');
    
    if (!navbarMenu || !mobileToggle) {
        console.error("Navbar elements not found");
        return;
    }
    
    // Reset any existing inline styles that might be causing issues
    navbarMenu.style.display = '';
    navbarMenu.style.opacity = '';
    navbarMenu.style.transform = '';
    navbarMenu.classList.remove('mobile-active');
    
    // Force correct initial state based on viewport width
    updateMobileNavState();
    
    // Ensure toggle button has correct event listeners
    const newMobileToggle = mobileToggle.cloneNode(true);
    mobileToggle.parentNode.replaceChild(newMobileToggle, mobileToggle);
    
    // Add click event with both mouse and touch support
    newMobileToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Mobile menu button clicked");
        toggleMobileMenu();
    });
    
    // Ensure all nav links close the menu when clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 768) {
                navbarMenu.classList.remove('mobile-active');
                navbarMenu.style.opacity = '0';
                navbarMenu.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    if (!navbarMenu.classList.contains('mobile-active')) {
                        navbarMenu.style.display = '';
                    }
                }, 300);
            }
        });
    });
    
    // Listen for resize events to update mobile nav state
    window.addEventListener('resize', updateMobileNavState);
}

// Enhanced function to properly handle responsive state transitions
function updateMobileNavState() {
    const navbarMenu = document.getElementById('navbar-menu');
    const isMobile = window.innerWidth < 768;
    
    if (!navbarMenu) return;
    
    if (isMobile) {
        // On mobile: make sure the menu is initially hidden unless active
        if (!navbarMenu.classList.contains('mobile-active')) {
            navbarMenu.style.display = 'none';
        }
        
        // Add mobile-specific classes
        document.body.classList.add('mobile-view');
        navbarMenu.classList.add('mobile-menu');
    } else {
        // IMPORTANT: On desktop, ALWAYS reset to desktop state regardless of previous state
        
        // Remove all mobile-specific classes
        document.body.classList.remove('mobile-view');
        navbarMenu.classList.remove('mobile-menu', 'mobile-active');
        
        // Reset ALL inline styles that were applied during mobile animations
        navbarMenu.style.display = '';
        navbarMenu.style.opacity = '';
        navbarMenu.style.transform = '';
        navbarMenu.style.flexDirection = '';
    }
    
    // Debug logging
    console.log(`Screen width: ${window.innerWidth}, Mobile view: ${isMobile}`);
}

// Call this function in your initApp function, after the existing mobile menu setup
// Add these lines at the end of your initApp function

    // Initialize mobile navbar with enhanced responsiveness
    initMobileNavbar();
    
    // Add iOS detection and fix for specific iOS issues
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.classList.add('ios-device');
        
        // Fix for iOS vh unit issue
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        window.addEventListener('resize', () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        });
    }

function populateCategoryDropdown() {
    console.log("Populating category dropdown");
    const categorySelect = document.getElementById('habit-category');
    
    // If we're on the manage page and the dropdown isn't found,
    // it might be in a modal that hasn't been created yet - that's ok
    if (!categorySelect) {
        console.log("Category dropdown not found - might be in uncreated modal");
        return;
    }
    
    // Clear existing options except the empty default one
    while (categorySelect.options.length > 1) {
        categorySelect.remove(1);
    }
    
    // Add all categories from appData
    appData.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        option.style.backgroundColor = category.color + '20'; // Light background color
        categorySelect.appendChild(option);
    });
    
    console.log(`Added ${appData.categories.length} categories to dropdown`);
}

// Edit a habit
function editHabit(habitId) {
    const habit = appData.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    // Show edit modal
    let editModal = document.getElementById('edit-habit-modal');
    
    if (!editModal) {
        // Create the modal if it doesn't exist
        editModal = document.createElement('div');
        editModal.id = 'edit-habit-modal';
        editModal.className = 'modal';
        
        editModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Habit</h3>
                    <button class="btn-close">
                        <span class="material-icons-round">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="edit-habit-form">
                        <div class="form-group">
                            <label for="edit-habit-name">Habit Name</label>
                            <input type="text" id="edit-habit-name" class="form-control" placeholder="Habit name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-habit-category">Category</label>
                            <select id="edit-habit-category" class="form-control">
                                <option value="">No Category</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Track on Days</label>
                            <div class="weekday-selector">
                                <button type="button" class="weekday-btn" data-day="0">S</button>
                                <button type="button" class="weekday-btn" data-day="1">M</button>
                                <button type="button" class="weekday-btn" data-day="2">T</button>
                                <button type="button" class="weekday-btn" data-day="3">W</button>
                                <button type="button" class="weekday-btn" data-day="4">T</button>
                                <button type="button" class="weekday-btn" data-day="5">F</button>
                                <button type="button" class="weekday-btn" data-day="6">S</button>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="edit-cancel-btn">Cancel</button>
                    <button class="btn btn-primary" id="edit-save-btn">Save Changes</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(editModal);
    }
    
    // Show the modal
    editModal.classList.add('show');
    
    // Set up the form with the habit's data
    const nameInput = document.getElementById('edit-habit-name');
    const categorySelect = document.getElementById('edit-habit-category');
    const weekdayButtons = editModal.querySelectorAll('.weekday-btn');
    const saveBtn = document.getElementById('edit-save-btn');
    const cancelBtn = document.getElementById('edit-cancel-btn');
    const closeBtn = editModal.querySelector('.btn-close');
    
    // Fill in the form fields
    if (nameInput) {
        nameInput.value = habit.name;
    }
    
    // Set up the category dropdown
    if (categorySelect) {
        // Clear existing options except the first one
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }
        
        // Add all categories
        appData.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        
        // Select the current category
        categorySelect.value = habit.category || '';
    }
    
    // Set up the weekday buttons
    if (weekdayButtons && habit.trackDays) {
        weekdayButtons.forEach(btn => {
            const day = parseInt(btn.getAttribute('data-day'));
            if (habit.trackDays.includes(day)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
            
            // Add click event listeners
            btn.onclick = function() {
                this.classList.toggle('active');
            };
        });
    }
    
    // Set up the close button
    if (closeBtn) {
        closeBtn.onclick = function() {
            editModal.classList.remove('show');
        };
    }
    
    // Set up the cancel button
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            editModal.classList.remove('show');
        };
    }
    
    // Set up the save button
    if (saveBtn) {
        saveBtn.onclick = function() {
            // Get the values from the form
            const newName = nameInput ? nameInput.value.trim() : habit.name;
            const newCategory = categorySelect ? categorySelect.value : habit.category;
            
            // Validate the form
            if (!newName) {
                showToast('Please enter a habit name', 'warning');
                return;
            }
            
            // Get selected weekdays
            const newTrackDays = [];
            if (weekdayButtons) {
                weekdayButtons.forEach(btn => {
                    if (btn.classList.contains('active')) {
                        const day = parseInt(btn.getAttribute('data-day'));
                        newTrackDays.push(day);
                    }
                });
            }
            
            // Update the habit
            habit.name = newName;
            habit.category = newCategory;
            habit.trackDays = newTrackDays.length > 0 ? newTrackDays : habit.trackDays;
            
            // Save changes
            saveToLocalStorage();
            
            // Close the modal
            editModal.classList.remove('show');
            
            // Re-render the habits list
            renderManageHabitsList();
            
            // Show success message
            showToast('Habit updated successfully', 'success');
        };
    }
}

// Function to delete a habit - fix implementation
function deleteHabit(habitId) {
    console.log("Deleting habit with ID:", habitId);
    
    try {
        // Find the habit to get its name for the confirmation message
        const habitToDelete = appData.habits.find(h => h.id === habitId);
        if (!habitToDelete) {
            console.error("Could not find habit with ID:", habitId);
            showToast('Error: Habit not found', 'error');
            return;
        }
        
        const habitName = habitToDelete.name;
        console.log(`Found habit "${habitName}" to delete`);
        
        // Filter out the habit with the matching ID
        appData.habits = appData.habits.filter(habit => habit.id !== habitId);
        console.log(`Removed habit from array, new length: ${appData.habits.length}`);
        
        // Save changes to localStorage
        saveToLocalStorage();
        console.log("Saved changes to localStorage");
        
        // Re-render the habits list
        renderManageHabitsList();
        console.log("Re-rendered habits list");
        
        // Show success message
        showToast(`Habit "${habitName}" has been deleted`, 'success');
    } catch (error) {
        console.error("Error deleting habit:", error);
        showToast("Failed to delete habit. Please try again.", "error");
    }
}