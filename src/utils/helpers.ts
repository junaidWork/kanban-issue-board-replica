import { IssuePriority } from '../types';

export const getPriorityVariant = (priority: IssuePriority): 'danger' | 'warning' | 'secondary' => {
  switch (priority) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'secondary';
  }
};

export const getSeverityColor = (severity: number): string => {
  if (severity >= 3) return '#ef4444';
  if (severity === 2) return '#f59e0b';
  return '#6b7280';
};

export const getUserInitials = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
