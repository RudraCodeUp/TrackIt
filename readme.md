# TrackIt - Habit Tracker

A clean, modern habit tracking web app that helps you build better habits and stay consistent.

## What it does

TrackIt lets you create and track daily habits with a visual streak counter. Check off habits as you complete them, see your progress over time, and get insights into your habits through charts and analytics.

## Features

- **Dashboard** - Quick view of all your habits with one-click completion
- **Habit Management** - Create, edit, delete habits with custom categories and colors
- **Streak Tracking** - Visual 7-day streak dots showing your consistency
- **Analytics** - Charts showing weekly/monthly performance, completion rates, best streaks
- **Categories** - Organize habits by Health, Productivity, Fitness, Learning, etc.
- **Dark Mode** - Easy on the eyes for nighttime tracking
- **Data Export** - Download your habit data as JSON

## How to use

1. Open `index.html` in your browser
2. Click "Add Habit" to create your first habit
3. Fill in the habit name, pick a category, and choose which days to track
4. Check off habits on the dashboard as you complete them
5. View your progress in the Analytics page

## File structure

```
TrackIt/
├── index.html          # Dashboard page
├── manage.html         # Manage/edit habits
├── analytics.html      # Charts and stats
├── settings.html       # App settings
├── about.html          # About page
├── style.css           # All styles
├── script.js           # App logic
└── readme.md           # This file
```

## Tech stack

Just vanilla HTML, CSS, and JavaScript. No frameworks, no build tools, no npm packages. Runs entirely in the browser with localStorage for data persistence.

## Browser support

Works in any modern browser (Chrome, Firefox, Safari, Edge). Needs localStorage support.

## Notes

- Data is stored locally in your browser
- Clearing browser data will delete your habits
- Export your data regularly if you want backups
- Mobile responsive but best on desktop

## Future ideas

- Multiple themes
- Habit notes/journal
- Reminder notifications
- Data sync across devices
- Habit templates
- Monthly calendar view

---
