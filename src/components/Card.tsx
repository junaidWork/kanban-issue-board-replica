import React from 'react';
import classNames from 'classnames';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  draggable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick, draggable }) => {
  return (
    <div
      className={classNames('card', className, { 'card-clickable': onClick, 'card-draggable': draggable })}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
