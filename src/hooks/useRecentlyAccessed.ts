import { useState, useEffect, useCallback } from 'react';
import { Issue } from '../types';
import { RECENTLY_ACCESSED_KEY, MAX_RECENT_ISSUES } from '../constants/app';

export const useRecentlyAccessed = () => {
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(RECENTLY_ACCESSED_KEY);
    if (stored) {
      try {
        setRecentIssues(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse recently accessed issues:', error);
      }
    }
  }, []);

  const addRecentlyAccessed = useCallback((issue: Issue) => {
    setRecentIssues(prev => {
      // Remove if already exists
      const filtered = prev.filter(i => i.id !== issue.id);
      // Add to front
      const updated = [issue, ...filtered].slice(0, MAX_RECENT_ISSUES);
      // Save to localStorage
      localStorage.setItem(RECENTLY_ACCESSED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentlyAccessed = useCallback(() => {
    setRecentIssues([]);
    localStorage.removeItem(RECENTLY_ACCESSED_KEY);
  }, []);

  return {
    recentIssues,
    addRecentlyAccessed,
    clearRecentlyAccessed,
  };
};

