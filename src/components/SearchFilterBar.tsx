import React from 'react';
import { Input, Select } from './shared';
import { FilterOptions } from '../types';
import { capitalizeFirst } from '../utils/helpers';
import './SearchFilterBar.css';

interface SearchFilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  assignees: string[];
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ filters, onFilterChange, assignees }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value });
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ assignee: e.target.value });
  };

  const handleSeverityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ severity: value ? parseInt(value) : null });
  };

  return (
    <div className='search-filter-bar'>
      <div className='search-filter-inputs'>
        <div className='search-input-wrapper'>
          <Input
            type='text'
            placeholder='Search by title or tags...'
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        <div className='filter-selects'>
          <Select
            value={filters.assignee}
            onChange={handleAssigneeChange}
            options={[
              { value: '', label: 'All Assignees' },
              ...assignees.map((a) => ({ value: a, label: capitalizeFirst(a) })),
            ]}
          />

          <Select
            value={filters.severity ?? ''}
            onChange={handleSeverityChange}
            options={[
              { value: '', label: 'All Severities' },
              { value: '1', label: 'Severity 1' },
              { value: '2', label: 'Severity 2' },
              { value: '3', label: 'Severity 3' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
