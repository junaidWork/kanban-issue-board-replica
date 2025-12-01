import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Issue } from '../types';
import { Button, Card } from './shared';
import dayjs from 'dayjs';
import './RecentlyAccessedSidebar.css';

interface RecentlyAccessedSidebarProps {
  issues: Issue[];
  onClear: () => void;
  isClosing?: boolean;
}

export const RecentlyAccessedSidebar: React.FC<RecentlyAccessedSidebarProps> = ({
  issues,
  onClear,
  isClosing = false,
}) => {
  const navigate = useNavigate();

  if (issues.length === 0) {
    return (
      <div className={`recently-accessed-sidebar ${isClosing ? 'sidebar-closing' : ''}`}>
        <div className='sidebar-header'>
          <h3>Recently Accessed</h3>
        </div>
        <div className='sidebar-empty'>
          <p>No recently accessed issues</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`recently-accessed-sidebar ${isClosing ? 'sidebar-closing' : ''}`}>
      <div className='sidebar-header'>
        <h3>Recently Accessed</h3>
        <Button variant='ghost' size='small' onClick={onClear}>
          Clear
        </Button>
      </div>
      <div className='sidebar-content'>
        {issues.map((issue) => (
          <Card key={issue.id} className='recent-issue-card' onClick={() => navigate(`/issue/${issue.id}`)}>
            <div className='recent-issue-title'>{issue.title}</div>
            <div className='recent-issue-meta'>
              <span>#{issue.id}</span>
              <span>{dayjs(issue.createdAt).format('MMM D')}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
