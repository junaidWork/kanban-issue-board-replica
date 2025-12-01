import React from 'react';
import './BoardSkeleton.css';

export const BoardSkeleton: React.FC = () => {
  return (
    <div className='board-skeleton'>
      <div className='skeleton-columns'>
        {[1, 2, 3].map((col) => (
          <div key={col} className='skeleton-column'>
            <div className='skeleton-column-header'>
              <div className='skeleton-column-title'></div>
              <div className='skeleton-column-count'></div>
            </div>
            <div className='skeleton-column-content'>
              {[1, 2, 3, 4].map((card) => (
                <div key={card} className='skeleton-card'>
                  <div className='skeleton-card-header'>
                    <div className='skeleton-card-id'></div>
                    <div className='skeleton-card-badge'></div>
                  </div>
                  <div className='skeleton-card-title'></div>
                  <div className='skeleton-card-meta'>
                    <div className='skeleton-avatar'></div>
                    <div className='skeleton-text'></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
