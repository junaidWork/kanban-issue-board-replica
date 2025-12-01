import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { BoardColumnProps } from '../types';

export const BoardColumn: React.FC<BoardColumnProps> = ({ status, issues, totalIssues, canEdit, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div ref={canEdit ? setNodeRef : undefined} className={`board-column ${isOver ? 'drag-over' : ''}`}>
      <div className='column-header'>
        <h2>{status}</h2>
        <span className='column-count'>{totalIssues}</span>
      </div>

      <div className='column-content'>
        {issues.length === 0 ? (
          <div className='column-empty'>
            <p>No issues</p>
          </div>
        ) : (
          children
        )}
      </div>

      {canEdit && issues.length > 0 && (
        <div className='column-footer'>
          <span className='drag-hint'>Drag to move</span>
        </div>
      )}
    </div>
  );
};
