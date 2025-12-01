import React from 'react';
import './ThemeToggle.css';

interface ThemeToggleProps {
  mode: 'light' | 'dark';
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ mode, onToggle }) => {
  return (
    <button
      className='theme-toggle-btn'
      onClick={onToggle}
      aria-label='Toggle theme'
      title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
    >
      {mode === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
