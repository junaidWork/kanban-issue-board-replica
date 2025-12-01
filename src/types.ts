export type IssueStatus = 'Backlog' | 'In Progress' | 'Done';
export type IssuePriority = 'low' | 'medium' | 'high';
export type UserRole = 'admin' | 'contributor';

export interface Issue {
  id: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  severity: number;
  createdAt: string;
  assignee: string;
  tags: string[];
  userDefinedRank?: number;
  description?: string;
}

export interface User {
  name: string;
  role: UserRole;
}

export interface IssueUpdate {
  status?: IssueStatus;
  priority?: IssuePriority;
  severity?: number;
  assignee?: string;
  userDefinedRank?: number;
  title?: string;
  tags?: string[];
}

export interface UndoableAction {
  issueId: string;
  previousState: Issue;
  newState: Issue;
  timestamp: number;
}

export interface FilterOptions {
  search: string;
  assignee: string;
  severity: number | null;
}

export interface ThemeMode {
  mode: 'light' | 'dark';
}

export interface BoardColumnProps {
  status: IssueStatus;
  issues: Issue[];
  totalIssues: number;
  canEdit: boolean;
  children?: React.ReactNode;
}

export interface DraggableIssueProps {
  issue: Issue;
  canEdit: boolean;
}
