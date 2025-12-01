import dayjs from 'dayjs';
import { Issue } from '../types';

// Priority score calculation (matching the store logic)
export const calculatePriorityScore = (issue: Issue): number => {
  const daysSinceCreated = dayjs().diff(dayjs(issue.createdAt), 'day');
  const userRank = issue.userDefinedRank || 0;
  return issue.severity * 10 + (daysSinceCreated * -1) + userRank;
};

// Sort issues by priority score
export const sortIssuesByPriority = (issues: Issue[]): Issue[] => {
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

describe('Priority Score Calculation', () => {
  const baseIssue: Issue = {
    id: '1',
    title: 'Test Issue',
    status: 'Backlog',
    priority: 'high',
    severity: 3,
    createdAt: dayjs().subtract(5, 'day').toISOString(),
    assignee: 'alice',
    tags: ['test'],
    userDefinedRank: 5,
  };

  test('should calculate priority score correctly', () => {
    const score = calculatePriorityScore(baseIssue);
    // severity * 10 + (daysSinceCreated * -1) + userDefinedRank
    // 3 * 10 + (-5) + 5 = 30
    expect(score).toBe(30);
  });

  test('should handle issues with no user rank', () => {
    const issue = { ...baseIssue, userDefinedRank: undefined };
    const score = calculatePriorityScore(issue);
    // 3 * 10 + (-5) + 0 = 25
    expect(score).toBe(25);
  });

  test('should give higher score to newer issues with same severity', () => {
    const olderIssue = baseIssue;
    const newerIssue = { 
      ...baseIssue, 
      id: '2',
      createdAt: dayjs().subtract(2, 'day').toISOString() 
    };
    
    const olderScore = calculatePriorityScore(olderIssue);
    const newerScore = calculatePriorityScore(newerIssue);
    
    expect(newerScore).toBeGreaterThan(olderScore);
  });

  test('should prioritize higher severity over age', () => {
    const highSeverityOld = baseIssue;
    const lowSeverityNew = {
      ...baseIssue,
      id: '2',
      severity: 1,
      createdAt: dayjs().toISOString(),
    };
    
    const highScore = calculatePriorityScore(highSeverityOld);
    const lowScore = calculatePriorityScore(lowSeverityNew);
    
    expect(highScore).toBeGreaterThan(lowScore);
  });
});

describe('Issue Sorting', () => {
  const issues: Issue[] = [
    {
      id: '1',
      title: 'Old High Severity',
      status: 'Backlog',
      priority: 'high',
      severity: 3,
      createdAt: dayjs().subtract(10, 'day').toISOString(),
      assignee: 'alice',
      tags: [],
      userDefinedRank: 5,
    },
    {
      id: '2',
      title: 'New Low Severity',
      status: 'Backlog',
      priority: 'low',
      severity: 1,
      createdAt: dayjs().subtract(1, 'day').toISOString(),
      assignee: 'bob',
      tags: [],
      userDefinedRank: 2,
    },
    {
      id: '3',
      title: 'Medium Severity',
      status: 'Backlog',
      priority: 'medium',
      severity: 2,
      createdAt: dayjs().subtract(5, 'day').toISOString(),
      assignee: 'carol',
      tags: [],
      userDefinedRank: 8,
    },
  ];

  test('should sort issues by priority score descending', () => {
    const sorted = sortIssuesByPriority(issues);
    const scores = sorted.map(calculatePriorityScore);
    
    // Check that scores are in descending order
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
    }
  });

  test('should maintain sort stability for equal scores', () => {
    const sameScoreIssues: Issue[] = [
      {
        ...issues[0],
        id: '1',
        createdAt: dayjs().subtract(5, 'day').toISOString(),
      },
      {
        ...issues[0],
        id: '2',
        createdAt: dayjs().subtract(3, 'day').toISOString(),
      },
    ];

    const sorted = sortIssuesByPriority(sameScoreIssues);
    
    // Newer issue should come first when scores are equal
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('1');
  });

  test('should not mutate original array', () => {
    const original = [...issues];
    sortIssuesByPriority(issues);
    
    expect(issues).toEqual(original);
  });

  test('should handle empty array', () => {
    const sorted = sortIssuesByPriority([]);
    expect(sorted).toEqual([]);
  });

  test('should handle single issue', () => {
    const singleIssue = [issues[0]];
    const sorted = sortIssuesByPriority(singleIssue);
    
    expect(sorted).toHaveLength(1);
    expect(sorted[0]).toEqual(issues[0]);
  });
});

