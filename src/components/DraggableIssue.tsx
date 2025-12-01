import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { DraggableIssueProps } from '../types';
import { IssueCard } from './IssueCard';

export const DraggableIssue: React.FC<DraggableIssueProps> = ({ issue, canEdit }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: issue.id,
    disabled: !canEdit,
  });

  return (
    <div
      ref={canEdit ? setNodeRef : undefined}
      {...(canEdit ? attributes : {})}
      {...(canEdit ? listeners : {})}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <IssueCard issue={issue} isDragging={isDragging} />
    </div>
  );
};
