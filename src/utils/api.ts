import { Issue } from '../types';
import issuesData from '../data/issues.json';
import { API_DELAY, API_SUCCESS_RATE } from '../constants/app';

// In-memory storage for issues to persist changes during the session
let issuesCache: Issue[] | null = null;

export const mockFetchIssues = () => {
    return new Promise<Issue[]>(resolve => {
        setTimeout(() => {
            // Initialize cache from JSON on first fetch
            if (issuesCache === null) {
                issuesCache = JSON.parse(JSON.stringify(issuesData)) as Issue[];
            }
            // Return a copy to prevent direct mutations
            resolve(JSON.parse(JSON.stringify(issuesCache)));
        }, API_DELAY);
    });
};

export const mockUpdateIssue = (issueId: string, updates: any) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < API_SUCCESS_RATE) {
                // Update the cached issue
                if (issuesCache) {
                    const issueIndex = issuesCache.findIndex(i => i.id === issueId);
                    if (issueIndex !== -1) {
                        issuesCache[issueIndex] = {
                            ...issuesCache[issueIndex],
                            ...updates
                        };
                    }
                }
                resolve({id: issueId, ...updates});
            } else {
                reject(new Error('Failed to update issue'));
            }
        }, API_DELAY);
    });
};

// Optional: Reset cache (useful for testing)
export const resetIssuesCache = () => {
    issuesCache = null;
};
