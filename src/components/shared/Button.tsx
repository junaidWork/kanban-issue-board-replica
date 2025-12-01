import React from 'react';
import classNames from 'classnames';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  className,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={classNames('btn', `btn-${variant}`, `btn-${size}`, { 'btn-disabled': disabled }, className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
