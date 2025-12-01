import { useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useRecentlyAccessed } from '../hooks/useRecentlyAccessed';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { getPriorityVariant, getSeverityColor, getUserInitials, capitalizeFirst } from '../utils/helpers';
import dayjs from 'dayjs';
import './IssueDetailPage.css';

export const IssueDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { issues, updateIssue } = useStore();
  const { addRecentlyAccessed } = useRecentlyAccessed();
  const { canEdit } = useAuth();

  const issue = useMemo(() => {
    return issues.find((i) => i.id === id);
  }, [issues, id]);

  useEffect(() => {
    if (issue) {
      addRecentlyAccessed(issue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issue?.id, addRecentlyAccessed]);

  const handleMarkAsResolved = useCallback(async () => {
    if (issue) {
      await updateIssue(issue.id, { status: 'Done' });
      navigate('/board');
    }
  }, [issue, updateIssue, navigate]);

  if (!issue) {
    return (
      <div className='issue-detail-page'>
        <div className='issue-not-found'>
          <h2>Issue not found</h2>
          <Button onClick={() => navigate('/board')}>Go back to board</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='issue-detail-page'>
      <div className='issue-detail-container'>
        <div className='issue-detail-header'>
          <Button variant='ghost' onClick={() => navigate('/board')}>
            Back to Board
          </Button>
        </div>

        <div className='issue-detail-layout'>
          <div className='issue-main-content'>
            <Card className='issue-content-card'>
              <div className='issue-header-top'>
                <span className='issue-number'>#{issue.id}</span>
                <Badge
                  variant={
                    issue.status === 'Done' ? 'success' : issue.status === 'In Progress' ? 'primary' : 'secondary'
                  }
                >
                  {issue.status}
                </Badge>
              </div>
              <h1 className='issue-title'>{issue.title}</h1>
              {issue.tags.length > 0 && (
                <div className='issue-tags'>
                  {issue.tags.map((tag) => (
                    <Badge key={tag} variant='secondary' size='small'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {issue.description && (
                <div className='issue-description-section'>
                  <h3 className='section-title'>Description</h3>
                  <p className='description-text'>{issue.description}</p>
                </div>
              )}
            </Card>

            {!canEdit && (
              <div className='read-only-notice'>
                <p>You have read-only access. Contact an administrator to make changes.</p>
              </div>
            )}
          </div>

          <div className='issue-sidebar'>
            <Card className='details-card'>
              {canEdit && issue.status !== 'Done' && (
                <div className='action-section'>
                  <Button variant='primary' onClick={handleMarkAsResolved} style={{ width: '100%' }}>
                    Mark as Resolved
                  </Button>
                </div>
              )}
              <h3 className='sidebar-title'>Details</h3>

              <div className='detail-group'>
                <label className='detail-label'>Assignee</label>
                <div className='detail-value assignee-value'>
                  <span className='assignee-avatar'>{getUserInitials(issue.assignee)}</span>
                  <span className='assignee-name'>{capitalizeFirst(issue.assignee)}</span>
                </div>
              </div>

              <div className='detail-group'>
                <label className='detail-label'>Priority</label>
                <div className='detail-value'>
                  <Badge variant={getPriorityVariant(issue.priority)} size='small'>
                    {issue.priority}
                  </Badge>
                </div>
              </div>

              <div className='detail-group'>
                <label className='detail-label'>Severity</label>
                <div className='detail-value'>
                  <span className='severity-badge' style={{ backgroundColor: getSeverityColor(issue.severity) }}>
                    Level {issue.severity}
                  </span>
                </div>
              </div>

              <div className='detail-group'>
                <label className='detail-label'>Created</label>
                <div className='detail-value'>
                  <span className='detail-text'>{dayjs(issue.createdAt).format('MMM D, YYYY')}</span>
                  <span className='detail-subtext'>{dayjs(issue.createdAt).format('HH:mm')}</span>
                </div>
              </div>

              <div className='detail-group'>
                <label className='detail-label'>User Rank</label>
                <div className='detail-value'>
                  <span className='detail-text'>{issue.userDefinedRank || 0}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
