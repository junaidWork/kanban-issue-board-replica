import { renderHook, act, waitFor } from '@testing-library/react';
import { useStore } from '../store/useStore';
import { Issue } from '../types';
import * as api from '../utils/api';

// Mock data for testing
const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Test Issue',
    status: 'Backlog',
    priority: 'high',
    severity: 3,
    createdAt: '2025-11-20T10:00:00Z',
    assignee: 'alice',
    tags: ['test'],
    userDefinedRank: 5,
  },
];

// Mock the API
jest.mock('../utils/api');

describe('useStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.setState({
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
      pollingInterval: 10000,
      theme: { mode: 'light' },
      currentPage: 1,
      itemsPerPage: 20,
    });

    // Setup default mock implementations
    (api.mockFetchIssues as jest.Mock).mockResolvedValue([...mockIssues]);
    (api.mockUpdateIssue as jest.Mock).mockImplementation((id, updates) => 
      Promise.resolve({ id, ...updates })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch issues successfully', async () => {
    const { result } = renderHook(() => useStore());

    await act(async () => {
      await result.current.fetchIssues();
    });

    await waitFor(() => {
      expect(result.current.issues).toHaveLength(1);
    });

    expect(result.current.issues[0].title).toBe('Test Issue');
    expect(result.current.loading).toBe(false);
    expect(result.current.lastSyncTime).not.toBeNull();
  });

  test('should apply search filter', async () => {
    const { result } = renderHook(() => useStore());

    // First fetch issues
    await act(async () => {
      await result.current.fetchIssues();
    });

    await waitFor(() => {
      expect(result.current.issues).toHaveLength(1);
    });

    // Then apply search filter
    act(() => {
      result.current.setFilters({ search: 'Test' });
    });

    expect(result.current.filteredIssues).toHaveLength(1);

    // Search for non-existent term
    act(() => {
      result.current.setFilters({ search: 'NonExistent' });
    });

    expect(result.current.filteredIssues).toHaveLength(0);
  });

  test('should apply assignee filter', async () => {
    const { result } = renderHook(() => useStore());

    await act(async () => {
      await result.current.fetchIssues();
    });

    await waitFor(() => {
      expect(result.current.issues).toHaveLength(1);
    });

    act(() => {
      result.current.setFilters({ assignee: 'alice' });
    });

    expect(result.current.filteredIssues).toHaveLength(1);

    act(() => {
      result.current.setFilters({ assignee: 'bob' });
    });

    expect(result.current.filteredIssues).toHaveLength(0);
  });

  test('should apply severity filter', async () => {
    const { result } = renderHook(() => useStore());

    await act(async () => {
      await result.current.fetchIssues();
    });

    await waitFor(() => {
      expect(result.current.issues).toHaveLength(1);
    });

    act(() => {
      result.current.setFilters({ severity: 3 });
    });

    expect(result.current.filteredIssues).toHaveLength(1);

    act(() => {
      result.current.setFilters({ severity: 1 });
    });

    expect(result.current.filteredIssues).toHaveLength(0);
  });

  test('should toggle theme', () => {
    const { result } = renderHook(() => useStore());

    expect(result.current.theme.mode).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme.mode).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme.mode).toBe('light');
  });

  test('should set polling interval', () => {
    const { result } = renderHook(() => useStore());

    expect(result.current.pollingInterval).toBe(10000);

    act(() => {
      result.current.setPollingInterval(30000);
    });

    expect(result.current.pollingInterval).toBe(30000);
  });

  test('should set current page', () => {
    const { result } = renderHook(() => useStore());

    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.setCurrentPage(2);
    });

    expect(result.current.currentPage).toBe(2);
  });

  test('should clear error', async () => {
    const { result } = renderHook(() => useStore());

    // Set an error manually
    act(() => {
      useStore.setState({ error: 'Test error' });
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  test('should reset page to 1 when filters change', async () => {
    const { result } = renderHook(() => useStore());

    await act(async () => {
      await result.current.fetchIssues();
    });

    act(() => {
      result.current.setCurrentPage(3);
    });

    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.setFilters({ search: 'Test' });
    });

    expect(result.current.currentPage).toBe(1);
  });
});

