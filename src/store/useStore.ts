import { create } from 'zustand';
import { Issue, IssueStatus, UndoableAction, FilterOptions, ThemeMode } from '../types';
import { mockFetchIssues, mockUpdateIssue } from '../utils/api';
import { DEFAULT_POLLING_INTERVAL, DEFAULT_ITEMS_PER_PAGE, THEME_STORAGE_KEY } from '../constants/app';
import dayjs from 'dayjs';

interface IssueStore {
  issues: Issue[];
  filteredIssues: Issue[];
  loading: boolean;
  error: string | null;
  lastSyncTime: Date | null;
  undoableAction: UndoableAction | null;
  filters: FilterOptions;
  pollingInterval: number;
  theme: ThemeMode;
  currentPage: number;
  itemsPerPage: number;

  // Actions
  fetchIssues: () => Promise<void>;
  updateIssueStatus: (issueId: string, status: IssueStatus, optimistic?: boolean) => Promise<void>;
  updateIssue: (issueId: string, updates: Partial<Issue>) => Promise<void>;
  undoLastAction: () => Promise<void>;
  setFilters: (filters: Partial<FilterOptions>) => void;
  applyFilters: () => void;
  setPollingInterval: (interval: number) => void;
  toggleTheme: () => void;
  setCurrentPage: (page: number) => void;
  clearError: () => void;
}

// Priority score calculation
const calculatePriorityScore = (issue: Issue): number => {
  const daysSinceCreated = dayjs().diff(dayjs(issue.createdAt), 'day');
  const userRank = issue.userDefinedRank || 0;
  return issue.severity * 10 + daysSinceCreated * -1 + userRank;
};

// Sort issues by priority score
const sortIssuesByPriority = (issues: Issue[]): Issue[] => {
  return [...issues].sort((a, b) => {
    const scoreA = calculatePriorityScore(a);
    const scoreB = calculatePriorityScore(b);

    // If scores are equal, newer issues appear first
    if (scoreA === scoreB) {
      return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
    }

    return scoreB - scoreA; // Higher score first
  });
};

export const useStore = create<IssueStore>((set, get) => ({
  issues: [],
  filteredIssues: [],
  loading: false,
  error: null,
  lastSyncTime: null,
  undoableAction: null,
  filters: {
    search: '',
    assignee: '',
    severity: null,
  },
  pollingInterval: DEFAULT_POLLING_INTERVAL,
  theme: { mode: (localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark') || 'light' },
  currentPage: 1,
  itemsPerPage: DEFAULT_ITEMS_PER_PAGE,

  fetchIssues: async () => {
    set({ loading: true, error: null });
    try {
      const data = (await mockFetchIssues()) as Issue[];
      const sortedIssues = sortIssuesByPriority(data);
      set({
        issues: sortedIssues,
        lastSyncTime: new Date(),
        loading: false,
      });
      get().applyFilters();
    } catch (error) {
      set({
        error: 'Failed to fetch issues',
        loading: false,
      });
    }
  },

  updateIssueStatus: async (issueId: string, status: IssueStatus, optimistic = true) => {
    const { issues } = get();
    const issue = issues.find((i) => i.id === issueId);

    if (!issue) return;

    const previousState = { ...issue };
    const newState = { ...issue, status };

    // Optimistic update
    if (optimistic) {
      const updatedIssues = issues.map((i) => (i.id === issueId ? newState : i));
      const sortedIssues = sortIssuesByPriority(updatedIssues);
      set({
        issues: sortedIssues,
        undoableAction: {
          issueId,
          previousState,
          newState,
          timestamp: Date.now(),
        },
      });
      get().applyFilters();
    }

    try {
      await mockUpdateIssue(issueId, { status });
    } catch (error) {
      // Rollback on error
      const rolledBackIssues = issues.map((i) => (i.id === issueId ? previousState : i));
      const sortedIssues = sortIssuesByPriority(rolledBackIssues);
      set({
        issues: sortedIssues,
        error: 'Failed to update issue',
        undoableAction: null,
      });
      get().applyFilters();
    }
  },

  updateIssue: async (issueId: string, updates: Partial<Issue>) => {
    const { issues } = get();
    const issue = issues.find((i) => i.id === issueId);

    if (!issue) return;

    const previousState = { ...issue };
    const newState = { ...issue, ...updates };

    // Optimistic update
    const updatedIssues = issues.map((i) => (i.id === issueId ? newState : i));
    const sortedIssues = sortIssuesByPriority(updatedIssues);
    set({
      issues: sortedIssues,
      undoableAction: {
        issueId,
        previousState,
        newState,
        timestamp: Date.now(),
      },
    });
    get().applyFilters();

    try {
      await mockUpdateIssue(issueId, updates);
    } catch (error) {
      // Rollback on error
      const rolledBackIssues = issues.map((i) => (i.id === issueId ? previousState : i));
      const sortedIssues = sortIssuesByPriority(rolledBackIssues);
      set({
        issues: sortedIssues,
        error: 'Failed to update issue',
        undoableAction: null,
      });
      get().applyFilters();
    }
  },

  undoLastAction: async () => {
    const { undoableAction, issues } = get();

    if (!undoableAction) return;

    const { issueId, previousState } = undoableAction;

    // Rollback to previous state
    const rolledBackIssues = issues.map((i) => (i.id === issueId ? previousState : i));
    const sortedIssues = sortIssuesByPriority(rolledBackIssues);
    set({
      issues: sortedIssues,
      undoableAction: null,
    });
    get().applyFilters();

    try {
      await mockUpdateIssue(issueId, previousState);
    } catch (error) {
      set({ error: 'Failed to undo action' });
    }
  },

  setFilters: (newFilters: Partial<FilterOptions>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
    }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { issues, filters } = get();

    let filtered = [...issues];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchLower) ||
          issue.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Assignee filter
    if (filters.assignee) {
      filtered = filtered.filter((issue) => issue.assignee === filters.assignee);
    }

    // Severity filter
    if (filters.severity !== null) {
      filtered = filtered.filter((issue) => issue.severity === filters.severity);
    }

    set({ filteredIssues: filtered });
  },

  setPollingInterval: (interval: number) => {
    set({ pollingInterval: interval });
  },

  toggleTheme: () => {
    set((state) => {
      const newMode = state.theme.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, newMode);
      return { theme: { mode: newMode } };
    });
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },

  clearError: () => {
    set({ error: null });
  },
}));
