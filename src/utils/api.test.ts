import { mockFetchIssues, mockUpdateIssue, resetIssuesCache } from './api';
import { Issue } from '../types';
import issuesData from '../data/issues.json';

// Mock the constants
jest.mock('../constants/app', () => ({
  API_DELAY: 100, // Use shorter delay for tests
  API_SUCCESS_RATE: 1,
}));

describe('API Utils', () => {
  beforeEach(() => {
    // Reset cache before each test
    resetIssuesCache();
    jest.clearAllMocks();
  });

  describe('mockFetchIssues', () => {
    test('should fetch issues successfully', async () => {
      const issues = await mockFetchIssues();

      expect(issues).toBeDefined();
      expect(Array.isArray(issues)).toBe(true);
      expect(issues.length).toBeGreaterThan(0);
    });

    test('should return issues with correct structure', async () => {
      const issues = await mockFetchIssues();
      const firstIssue = issues[0];

      expect(firstIssue).toHaveProperty('id');
      expect(firstIssue).toHaveProperty('title');
      expect(firstIssue).toHaveProperty('status');
      expect(firstIssue).toHaveProperty('priority');
      expect(firstIssue).toHaveProperty('severity');
      expect(firstIssue).toHaveProperty('createdAt');
      expect(firstIssue).toHaveProperty('assignee');
      expect(firstIssue).toHaveProperty('tags');
    });

    test('should initialize cache from JSON data on first fetch', async () => {
      const issues = await mockFetchIssues();

      // Should match the data from issues.json
      expect(issues.length).toBe(issuesData.length);
      expect(issues[0].id).toBe(issuesData[0].id);
      expect(issues[0].title).toBe(issuesData[0].title);
    });

    test('should return a copy of cached data, not the original', async () => {
      const issues1 = await mockFetchIssues();
      const issues2 = await mockFetchIssues();

      // Should be equal in content
      expect(issues1).toEqual(issues2);

      // But not the same reference
      expect(issues1).not.toBe(issues2);

      // Modifying one should not affect the other
      issues1[0].title = 'Modified Title';
      expect(issues2[0].title).not.toBe('Modified Title');
    });

    test('should use cached data on subsequent fetches', async () => {
      const issues1 = await mockFetchIssues();

      // Update cache through mockUpdateIssue
      await mockUpdateIssue(issues1[0].id, { title: 'Updated Title' });

      // Fetch again
      const issues2 = await mockFetchIssues();

      // Should reflect the update
      expect(issues2[0].title).toBe('Updated Title');
    });

    test('should handle multiple concurrent fetch requests', async () => {
      const [issues1, issues2, issues3] = await Promise.all([mockFetchIssues(), mockFetchIssues(), mockFetchIssues()]);

      expect(issues1).toEqual(issues2);
      expect(issues2).toEqual(issues3);
    });

    test('should return fresh data after cache reset', async () => {
      const issues1 = await mockFetchIssues();

      // Update an issue
      await mockUpdateIssue(issues1[0].id, { title: 'Modified' });

      // Verify update
      const issues2 = await mockFetchIssues();
      expect(issues2[0].title).toBe('Modified');

      // Reset cache
      resetIssuesCache();

      // Fetch again - should return original data
      const issues3 = await mockFetchIssues();
      expect(issues3[0].title).toBe(issuesData[0].title);
      expect(issues3[0].title).not.toBe('Modified');
    });

    test('should simulate API delay', async () => {
      const startTime = Date.now();
      await mockFetchIssues();
      const endTime = Date.now();

      // Should take at least the API_DELAY time (100ms in tests)
      expect(endTime - startTime).toBeGreaterThanOrEqual(90);
    });
  });

  describe('mockUpdateIssue', () => {
    test('should update issue successfully', async () => {
      // First fetch to initialize cache
      const issues = await mockFetchIssues();
      const issueId = issues[0].id;

      const updates = { title: 'Updated Title', status: 'Done' as const };
      const result = await mockUpdateIssue(issueId, updates);

      expect(result).toEqual({ id: issueId, ...updates });
    });

    test('should update issue in cache', async () => {
      const issues = await mockFetchIssues();
      const issueId = issues[0].id;
      const originalTitle = issues[0].title;

      // Update the issue
      await mockUpdateIssue(issueId, { title: 'New Title' });

      // Fetch again to verify cache was updated
      const updatedIssues = await mockFetchIssues();
      const updatedIssue = updatedIssues.find((i) => i.id === issueId);

      expect(updatedIssue?.title).toBe('New Title');
      expect(updatedIssue?.title).not.toBe(originalTitle);
    });

    test('should update only specified fields', async () => {
      const issues = await mockFetchIssues();
      const issueId = issues[0].id;
      const originalStatus = issues[0].status;
      const originalPriority = issues[0].priority;

      // Update only title
      await mockUpdateIssue(issueId, { title: 'Only Title Changed' });

      const updatedIssues = await mockFetchIssues();
      const updatedIssue = updatedIssues.find((i) => i.id === issueId);

      expect(updatedIssue?.title).toBe('Only Title Changed');
      expect(updatedIssue?.status).toBe(originalStatus);
      expect(updatedIssue?.priority).toBe(originalPriority);
    });

    test('should handle multiple field updates', async () => {
      const issues = await mockFetchIssues();
      const issueId = issues[0].id;

      const updates = {
        title: 'Multi Update',
        status: 'In Progress' as const,
        priority: 'high' as const,
        severity: 3,
      };

      await mockUpdateIssue(issueId, updates);

      const updatedIssues = await mockFetchIssues();
      const updatedIssue = updatedIssues.find((i) => i.id === issueId);

      expect(updatedIssue?.title).toBe(updates.title);
      expect(updatedIssue?.status).toBe(updates.status);
      expect(updatedIssue?.priority).toBe(updates.priority);
      expect(updatedIssue?.severity).toBe(updates.severity);
    });

    test('should handle updating non-existent issue gracefully', async () => {
      await mockFetchIssues(); // Initialize cache

      const nonExistentId = 'non-existent-id';
      const result = await mockUpdateIssue(nonExistentId, { title: 'Test' });

      // Should still resolve with the updates
      expect(result).toEqual({ id: nonExistentId, title: 'Test' });
    });

    test('should handle sequential updates to same issue', async () => {
      const issues = await mockFetchIssues();
      const issueId = issues[0].id;

      // First update
      await mockUpdateIssue(issueId, { title: 'First Update' });

      // Second update
      await mockUpdateIssue(issueId, { title: 'Second Update' });

      // Third update
      await mockUpdateIssue(issueId, { status: 'Done' as const });

      const updatedIssues = await mockFetchIssues();
      const updatedIssue = updatedIssues.find((i) => i.id === issueId);

      expect(updatedIssue?.title).toBe('Second Update');
      expect(updatedIssue?.status).toBe('Done');
    });

    test('should handle concurrent updates to different issues', async () => {
      const issues = await mockFetchIssues();

      await Promise.all([
        mockUpdateIssue(issues[0].id, { title: 'Update 1' }),
        mockUpdateIssue(issues[1].id, { title: 'Update 2' }),
        mockUpdateIssue(issues[2].id, { title: 'Update 3' }),
      ]);

      const updatedIssues = await mockFetchIssues();

      expect(updatedIssues[0].title).toBe('Update 1');
      expect(updatedIssues[1].title).toBe('Update 2');
      expect(updatedIssues[2].title).toBe('Update 3');
    });

    test('should simulate API delay', async () => {
      const issues = await mockFetchIssues();
      const issueId = issues[0].id;

      const startTime = Date.now();
      await mockUpdateIssue(issueId, { title: 'Test' });
      const endTime = Date.now();

      // Should take at least the API_DELAY time (100ms in tests)
      expect(endTime - startTime).toBeGreaterThanOrEqual(90);
    });

    test('should preserve other issues when updating one', async () => {
      const issues = await mockFetchIssues();
      const totalIssues = issues.length;
      const issueId = issues[0].id;

      await mockUpdateIssue(issueId, { title: 'Updated' });

      const updatedIssues = await mockFetchIssues();

      // Should still have same number of issues
      expect(updatedIssues.length).toBe(totalIssues);

      // Other issues should be unchanged
      for (let i = 1; i < issues.length; i++) {
        expect(updatedIssues[i]).toEqual(issues[i]);
      }
    });
  });

  describe('resetIssuesCache', () => {
    test('should reset cache to null', async () => {
      // Initialize cache
      await mockFetchIssues();

      // Update an issue
      const issues = await mockFetchIssues();
      await mockUpdateIssue(issues[0].id, { title: 'Modified' });

      // Reset cache
      resetIssuesCache();

      // Next fetch should reinitialize from JSON
      const freshIssues = await mockFetchIssues();
      expect(freshIssues[0].title).toBe(issuesData[0].title);
    });

    test('should allow fresh initialization after reset', async () => {
      // First initialization
      const issues1 = await mockFetchIssues();
      await mockUpdateIssue(issues1[0].id, { title: 'First Session' });

      // Reset
      resetIssuesCache();

      // Second initialization
      const issues2 = await mockFetchIssues();
      await mockUpdateIssue(issues2[0].id, { title: 'Second Session' });

      // Should have the second session's data
      const currentIssues = await mockFetchIssues();
      expect(currentIssues[0].title).toBe('Second Session');
    });

    test('should be safe to call multiple times', () => {
      expect(() => {
        resetIssuesCache();
        resetIssuesCache();
        resetIssuesCache();
      }).not.toThrow();
    });

    test('should work correctly after reset without fetch', async () => {
      await mockFetchIssues();
      resetIssuesCache();

      // Should be able to fetch after reset
      const issues = await mockFetchIssues();
      expect(issues).toBeDefined();
      expect(issues.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle API failure when success rate is low', async () => {
      // Mock with low success rate
      jest.resetModules();
      jest.doMock('../constants/app', () => ({
        API_DELAY: 100,
        API_SUCCESS_RATE: 0, // 0% success rate
      }));

      const { mockUpdateIssue: failingUpdate } = require('./api');

      const issues = await mockFetchIssues();

      await expect(failingUpdate(issues[0].id, { title: 'Test' })).rejects.toThrow('Failed to update issue');
    });
  });

  describe('Data Integrity', () => {
    test('should maintain data types after update', async () => {
      const issues = await mockFetchIssues();
      const issueId = issues[0].id;

      await mockUpdateIssue(issueId, {
        severity: 3,
        userDefinedRank: 5,
      });

      const updatedIssues = await mockFetchIssues();
      const updatedIssue = updatedIssues.find((i) => i.id === issueId);

      expect(typeof updatedIssue?.severity).toBe('number');
      expect(typeof updatedIssue?.userDefinedRank).toBe('number');
    });

    test('should maintain array types after update', async () => {
      const issues = await mockFetchIssues();
      const issueId = issues[0].id;

      await mockUpdateIssue(issueId, {
        tags: ['new-tag', 'another-tag'],
      });

      const updatedIssues = await mockFetchIssues();
      const updatedIssue = updatedIssues.find((i) => i.id === issueId);

      expect(Array.isArray(updatedIssue?.tags)).toBe(true);
      expect(updatedIssue?.tags).toEqual(['new-tag', 'another-tag']);
    });

    test('should not mutate original issuesData', async () => {
      const originalFirstTitle = issuesData[0].title;

      await mockFetchIssues();
      const issues = await mockFetchIssues();
      await mockUpdateIssue(issues[0].id, { title: 'Mutated' });

      // Original data should be unchanged
      expect(issuesData[0].title).toBe(originalFirstTitle);
    });
  });
});
