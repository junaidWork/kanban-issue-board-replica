import React from 'react';
import './Badge.css';
import classNames from 'classnames';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', size = 'medium' }) => {
  return <span className={classNames('badge', `badge-${variant}`, `badge-${size}`)}>{children}</span>;
};
