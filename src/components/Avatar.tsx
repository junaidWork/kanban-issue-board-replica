import React from 'react';
import { getUserInitials } from '../utils/helpers';
import './Avatar.css';

interface AvatarProps {
  name: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'medium', className = '' }) => {
  return <span className={`avatar avatar-${size} ${className}`}>{getUserInitials(name)}</span>;
};
