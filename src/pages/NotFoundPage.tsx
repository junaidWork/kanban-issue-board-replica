import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/shared';
import './NotFoundPage.css';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='not-found-page'>
      <div className='not-found-content'>
        <div className='not-found-illustration'>
          <div className='error-code'>404</div>
          <div className='error-circle'></div>
        </div>

        <h1 className='not-found-title'>Page Not Found</h1>
        <p className='not-found-description'>The page you're looking for doesn't exist or has been moved.</p>

        <div className='not-found-actions'>
          <Button variant='primary' onClick={() => navigate('/board')}>
            Go to Board
          </Button>
          <Button variant='secondary' onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};
