import React from 'react';
import './Input.css';
import classNames from 'classnames';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className='input-wrapper'>
      {label && <label className='input-label'>{label}</label>}
      <input className={classNames('input', { 'input-error': error }, className)} {...props} />
      {error && <span className='input-error-text'>{error}</span>}
    </div>
  );
};
