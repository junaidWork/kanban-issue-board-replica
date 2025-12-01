import React from 'react';
import { getUserInitials } from '../utils/helpers';
import './UserProfile.css';

interface UserProfileProps {
  name: string;
  role: string;
  onClick?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ name, role, onClick }) => {
  return (
    <div className='nav-user' onClick={onClick}>
      <span className='user-avatar'>{getUserInitials(name)}</span>
      <div className='user-info'>
        <span className='user-name'>{name}</span>
        <span className='user-role'>{role}</span>
      </div>
    </div>
  );
};
