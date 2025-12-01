import { renderHook, act } from '@testing-library/react';
import { useRecentlyAccessed } from '../hooks/useRecentlyAccessed';
import { Issue } from '../types';

describe('useRecentlyAccessed', () => {
  const mockIssue1: Issue = {
    id: '1',
    title: 'Test Issue 1',
    status: 'Backlog',
    priority: 'high',
    severity: 3,
    createdAt: '2025-11-20T10:00:00Z',
    assignee: 'alice',
    tags: ['test'],
    userDefinedRank: 5,
  };

  const mockIssue2: Issue = {
    id: '2',
    title: 'Test Issue 2',
    status: 'In Progress',
    priority: 'medium',
    severity: 2,
    createdAt: '2025-11-21T10:00:00Z',
    assignee: 'bob',
    tags: ['test'],
    userDefinedRank: 3,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  test('should start with empty recent issues', () => {
    const { result } = renderHook(() => useRecentlyAccessed());
    expect(result.current.recentIssues).toEqual([]);
  });

  test('should add issue to recent list', () => {
    const { result } = renderHook(() => useRecentlyAccessed());

    act(() => {
      result.current.addRecentlyAccessed(mockIssue1);
    });

    expect(result.current.recentIssues).toHaveLength(1);
    expect(result.current.recentIssues[0]).toEqual(mockIssue1);
  });

  test('should add multiple issues to recent list', () => {
    const { result } = renderHook(() => useRecentlyAccessed());

    act(() => {
      result.current.addRecentlyAccessed(mockIssue1);
      result.current.addRecentlyAccessed(mockIssue2);
    });

    expect(result.current.recentIssues).toHaveLength(2);
    expect(result.current.recentIssues[0]).toEqual(mockIssue2);
    expect(result.current.recentIssues[1]).toEqual(mockIssue1);
  });

  test('should move existing issue to front when accessed again', () => {
    const { result } = renderHook(() => useRecentlyAccessed());

    act(() => {
      result.current.addRecentlyAccessed(mockIssue1);
      result.current.addRecentlyAccessed(mockIssue2);
      result.current.addRecentlyAccessed(mockIssue1);
    });

    expect(result.current.recentIssues).toHaveLength(2);
    expect(result.current.recentIssues[0]).toEqual(mockIssue1);
    expect(result.current.recentIssues[1]).toEqual(mockIssue2);
  });

  test('should limit recent issues to 5', () => {
    const { result } = renderHook(() => useRecentlyAccessed());

    const issues = Array.from({ length: 7 }, (_, i) => ({
      ...mockIssue1,
      id: `${i + 1}`,
      title: `Issue ${i + 1}`,
    }));

    act(() => {
      issues.forEach(issue => result.current.addRecentlyAccessed(issue));
    });

    expect(result.current.recentIssues).toHaveLength(5);
    expect(result.current.recentIssues[0].id).toBe('7');
  });

  test('should persist to localStorage', () => {
    const { result } = renderHook(() => useRecentlyAccessed());

    act(() => {
      result.current.addRecentlyAccessed(mockIssue1);
    });

    const stored = localStorage.getItem('recentlyAccessedIssues');
    expect(stored).not.toBeNull();
    
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe(mockIssue1.id);
  });

  test('should load from localStorage on mount', () => {
    localStorage.setItem('recentlyAccessedIssues', JSON.stringify([mockIssue1]));

    const { result } = renderHook(() => useRecentlyAccessed());

    expect(result.current.recentIssues).toHaveLength(1);
    expect(result.current.recentIssues[0].id).toBe(mockIssue1.id);
  });

  test('should clear recent issues', () => {
    const { result } = renderHook(() => useRecentlyAccessed());

    act(() => {
      result.current.addRecentlyAccessed(mockIssue1);
      result.current.addRecentlyAccessed(mockIssue2);
    });

    expect(result.current.recentIssues).toHaveLength(2);

    act(() => {
      result.current.clearRecentlyAccessed();
    });

    expect(result.current.recentIssues).toEqual([]);
    expect(localStorage.getItem('recentlyAccessedIssues')).toBeNull();
  });

  test('callbacks should maintain stable reference', () => {
    const { result, rerender } = renderHook(() => useRecentlyAccessed());

    const firstAddRef = result.current.addRecentlyAccessed;
    const firstClearRef = result.current.clearRecentlyAccessed;

    rerender();

    expect(result.current.addRecentlyAccessed).toBe(firstAddRef);
    expect(result.current.clearRecentlyAccessed).toBe(firstClearRef);
  });
});

