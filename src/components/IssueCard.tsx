import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Issue } from '../types';
import { Card } from './Card';
import { Badge } from './Badge';
import { getPriorityVariant, getSeverityColor, getUserInitials } from '../utils/helpers';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAuth } from '../hooks/useAuth';
import './IssueCard.css';

dayjs.extend(relativeTime);

interface IssueCardProps {
  issue: Issue;
  isDragging?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, isDragging }) => {
  const navigate = useNavigate();
  const { canEdit } = useAuth();

  const handleClick = () => {
    navigate(`/issue/${issue.id}`);
  };

  return (
    <Card className={`issue-card ${isDragging ? 'dragging' : ''}`} onClick={handleClick} draggable={canEdit}>
      <div className='issue-card-header'>
        <h3 className='issue-card-title'>{issue.title}</h3>
        <Badge variant={getPriorityVariant(issue.priority)} size='small'>
          {issue.priority}
        </Badge>
      </div>

      <div className='issue-card-meta'>
        <span className='issue-card-id'>#{issue.id}</span>
        <span className='issue-card-date'>{dayjs(issue.createdAt).fromNow()}</span>
      </div>

      <div className='issue-card-details'>
        <div className='issue-card-assignee'>
          <span className='assignee-avatar'>{getUserInitials(issue.assignee)}</span>
          <span className='assignee-name'>{issue.assignee}</span>
        </div>

        <div className='issue-card-severity' style={{ color: getSeverityColor(issue.severity) }}>
          Severity: {issue.severity}
        </div>
      </div>

      {issue.tags.length > 0 && (
        <div className='issue-card-tags'>
          {issue.tags.map((tag) => (
            <Badge key={tag} variant='secondary' size='small'>
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
};
