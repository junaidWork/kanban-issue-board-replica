import React from 'react';
import './Select.css';
import classNames from 'classnames';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className, ...props }) => {
  return (
    <div className='select-wrapper'>
      {label && <label className='select-label'>{label}</label>}
      <select className={classNames('select', className)} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
