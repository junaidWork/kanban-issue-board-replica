import { IssueStatus } from "../types";

// Polling
export const DEFAULT_POLLING_INTERVAL = 10000; // 10 seconds
export const POLLING_OPTIONS = [
  { value: '5000', label: '5 seconds' },
  { value: '10000', label: '10 seconds' },
  { value: '30000', label: '30 seconds' },
  { value: '60000', label: '1 minute' },
  { value: '120000', label: '2 minutes' },
];

// Pagination
export const DEFAULT_ITEMS_PER_PAGE = 20;

// Recently Accessed
export const MAX_RECENT_ISSUES = 5;
export const RECENTLY_ACCESSED_KEY = 'recentlyAccessedIssues';

// Undo
export const UNDO_TIMEOUT = 5000; // 5 seconds

// Theme
export const THEME_STORAGE_KEY = 'theme';

// API
export const API_DELAY = 500; // Mock API delay in ms
export const API_SUCCESS_RATE = 0.9; // 90% success rate for mock API

export const BOARD_COLUMNS: IssueStatus[] = ['Backlog', 'In Progress', 'Done'];
