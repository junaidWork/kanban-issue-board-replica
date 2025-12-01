# Kanban Issue Board

A Kanban-style issue board built with React, TypeScript, and modern web technologies. Features drag-and-drop, real-time updates, role-based access control, and an elegant dark mode.

## 📋 About The Project

This is a Jira-inspired issue tracking application that allows teams to manage tasks across three workflow stages: **Backlog**, **In Progress**, and **Done**. The application features intelligent priority sorting, optimistic UI updates, and comprehensive user permissions.

## ✨ Key Features

- **Kanban Board** - Drag & drop issues between columns
- **Search & Filter** - Live search by title/tags, filter by assignee/severity
- **Smart Sorting** - Automatic priority scoring algorithm
- **Undo Actions** - 5-second undo window for all changes
- **Recently Accessed** - Quick access to last 5 viewed issues
- **Role-Based Access** - Admin (full edit) vs Contributor (read-only)
- **Real-Time Sync** - Auto-refresh every 10 seconds (configurable)
- **Dark Mode** - Elegant dark theme with persistence
- **Responsive Design** - Works on mobile, tablet, and desktop
- **30+ Unit Tests** - Comprehensive test coverage

## 🛠️ Technologies & Libraries

### Core Stack
- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router v7** - Client-side routing
- **Zustand** - State management

### UI & Features
- **@dnd-kit/core** - Drag and drop functionality
- **React Toastify** - Toast notifications
- **Day.js** - Date manipulation
- **CSS3** - Custom styling with dark mode

### Testing
- **Jest** - Test runner
- **React Testing Library** - Component testing

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (recommended: v22.14.0)
- **npm 9+**

### Installation & Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd react-case-study

# 2. Use the correct Node version (if using nvm)
nvm use

# 3. Install dependencies
npm install

# 4. Start the development server
npm start

# 5. Run Test cases
npm run test
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Available Commands

```bash
npm start          # Start development server
npm test           # Run tests in watch mode
npm run build      # Create production build
npm test -- --coverage  # Run tests with coverage report
```

## 📖 What We Implemented

### 1. **Board View** (`/board`)
- Three-column Kanban layout (Backlog, In Progress, Done)
- Drag & drop with visual feedback
- Optimistic updates (500ms simulated API delay)
- Undo functionality with countdown timer
- Real-time polling with last sync timestamp

### 2. **Priority Sorting Algorithm**
Issues are automatically sorted using this formula:
```
Priority Score = (severity × 10) + (days since created × -1) + userDefinedRank
```
- Higher scores appear first
- Newer issues break ties
- Recalculates on every update

### 3. **Search & Filtering**
- Live search by issue title or tags
- Filter by assignee (dropdown)
- Filter by severity level (1-3)
- Filters work together and persist across navigation

### 4. **Issue Detail Page** (`/issue/:id`)
- Full issue information display
- "Mark as Resolved" button (admin only)
- Assignee, priority, severity, tags, and timestamps
- Automatic tracking in "Recently Accessed"

### 5. **Role-Based Permissions**
- **Admin** (Alice): Can edit, drag, and resolve issues
- **Contributor** (Bob): Read-only access with clear indicators
- Switch users in Settings page

### 6. **Settings Page** (`/settings`)
- User profile with role badge
- Polling interval configuration (5s - 2min)
- Dark mode toggle
- User switching for testing permissions

### 7. **Bonus Features**
- ✅ Pagination (20 items per page)
- ✅ Custom hooks (usePolling, useAuth, useRecentlyAccessed, useUndoTimer)
- ✅ Dark mode with localStorage persistence
- ✅ Comprehensive unit tests (30 tests, all passing)
