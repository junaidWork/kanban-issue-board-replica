import { renderHook } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import * as currentUserModule from '../constants/currentUser';

describe('useAuth', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should return admin permissions for admin user', () => {
    // Mock the currentUser object
    Object.defineProperty(currentUserModule, 'currentUser', {
      value: {
        name: 'Alice',
        role: 'admin',
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user.role).toBe('admin');
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canView).toBe(true);
    expect(result.current.hasPermission('admin')).toBe(true);
    expect(result.current.hasPermission('contributor')).toBe(true);
  });

  test('should return limited permissions for contributor user', () => {
    // Mock the currentUser object
    Object.defineProperty(currentUserModule, 'currentUser', {
      value: {
        name: 'Bob',
        role: 'contributor',
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user.role).toBe('contributor');
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canView).toBe(true);
    expect(result.current.hasPermission('admin')).toBe(false);
    expect(result.current.hasPermission('contributor')).toBe(true);
  });
});

