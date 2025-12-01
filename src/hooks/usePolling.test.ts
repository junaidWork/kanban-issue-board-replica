import { renderHook, waitFor } from '@testing-library/react';
import { usePolling } from './usePolling';

describe('usePolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('should call onPoll at specified interval', () => {
    const onPoll = jest.fn();
    const interval = 1000;

    renderHook(() => usePolling({ interval, onPoll }));

    // Initially, onPoll should not be called
    expect(onPoll).not.toHaveBeenCalled();

    // After first interval
    jest.advanceTimersByTime(interval);
    expect(onPoll).toHaveBeenCalledTimes(1);

    // After second interval
    jest.advanceTimersByTime(interval);
    expect(onPoll).toHaveBeenCalledTimes(2);

    // After third interval
    jest.advanceTimersByTime(interval);
    expect(onPoll).toHaveBeenCalledTimes(3);
  });

  test('should not call onPoll when enabled is false', () => {
    const onPoll = jest.fn();
    const interval = 1000;

    renderHook(() => usePolling({ interval, enabled: false, onPoll }));

    // Advance time
    jest.advanceTimersByTime(interval * 3);

    // onPoll should never be called
    expect(onPoll).not.toHaveBeenCalled();
  });

  test('should stop polling when enabled changes to false', () => {
    const onPoll = jest.fn();
    const interval = 1000;

    const { rerender } = renderHook(
      ({ enabled }) => usePolling({ interval, enabled, onPoll }),
      { initialProps: { enabled: true } }
    );

    // First interval - should be called
    jest.advanceTimersByTime(interval);
    expect(onPoll).toHaveBeenCalledTimes(1);

    // Disable polling
    rerender({ enabled: false });

    // Advance time - should not be called anymore
    jest.advanceTimersByTime(interval * 2);
    expect(onPoll).toHaveBeenCalledTimes(1); // Still 1, not called again
  });

  test('should start polling when enabled changes to true', () => {
    const onPoll = jest.fn();
    const interval = 1000;

    const { rerender } = renderHook(
      ({ enabled }) => usePolling({ interval, enabled, onPoll }),
      { initialProps: { enabled: false } }
    );

    // Advance time - should not be called
    jest.advanceTimersByTime(interval);
    expect(onPoll).not.toHaveBeenCalled();

    // Enable polling
    rerender({ enabled: true });

    // Advance time - should now be called
    jest.advanceTimersByTime(interval);
    expect(onPoll).toHaveBeenCalledTimes(1);
  });

  test('should update interval when it changes', () => {
    const onPoll = jest.fn();
    let interval = 1000;

    const { rerender } = renderHook(
      ({ interval }) => usePolling({ interval, onPoll }),
      { initialProps: { interval } }
    );

    // First interval (1000ms)
    jest.advanceTimersByTime(1000);
    expect(onPoll).toHaveBeenCalledTimes(1);

    // Change interval to 2000ms
    interval = 2000;
    rerender({ interval });

    // Advance by old interval (1000ms) - should not trigger
    jest.advanceTimersByTime(1000);
    expect(onPoll).toHaveBeenCalledTimes(1); // Still 1

    // Advance by remaining time to complete new interval (1000ms more)
    jest.advanceTimersByTime(1000);
    expect(onPoll).toHaveBeenCalledTimes(2); // Now 2
  });

  test('should use the latest onPoll callback', () => {
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();
    const interval = 1000;

    const { rerender } = renderHook(
      ({ onPoll }) => usePolling({ interval, onPoll }),
      { initialProps: { onPoll: firstCallback } }
    );

    // First interval with first callback
    jest.advanceTimersByTime(interval);
    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).not.toHaveBeenCalled();

    // Update callback
    rerender({ onPoll: secondCallback });

    // Second interval should use new callback
    jest.advanceTimersByTime(interval);
    expect(firstCallback).toHaveBeenCalledTimes(1); // Still 1
    expect(secondCallback).toHaveBeenCalledTimes(1); // Now called
  });

  test('should handle async onPoll callback', async () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    const interval = 1000;

    renderHook(() => usePolling({ interval, onPoll }));

    // Advance time
    jest.advanceTimersByTime(interval);

    // Wait for async callback to complete
    await waitFor(() => {
      expect(onPoll).toHaveBeenCalledTimes(1);
    });

    // Advance time again
    jest.advanceTimersByTime(interval);

    await waitFor(() => {
      expect(onPoll).toHaveBeenCalledTimes(2);
    });
  });

  test('should cleanup interval on unmount', () => {
    const onPoll = jest.fn();
    const interval = 1000;

    const { unmount } = renderHook(() => usePolling({ interval, onPoll }));

    // First interval
    jest.advanceTimersByTime(interval);
    expect(onPoll).toHaveBeenCalledTimes(1);

    // Unmount
    unmount();

    // Advance time - should not be called after unmount
    jest.advanceTimersByTime(interval * 2);
    expect(onPoll).toHaveBeenCalledTimes(1); // Still 1
  });

  test('should work with different interval values', () => {
    const onPoll = jest.fn();

    // Test with 5 seconds
    const { rerender, unmount } = renderHook(
      ({ interval }) => usePolling({ interval, onPoll }),
      { initialProps: { interval: 5000 } }
    );

    jest.advanceTimersByTime(5000);
    expect(onPoll).toHaveBeenCalledTimes(1);

    unmount();
    onPoll.mockClear();

    // Test with 10 seconds
    const { unmount: unmount2 } = renderHook(() =>
      usePolling({ interval: 10000, onPoll })
    );

    jest.advanceTimersByTime(10000);
    expect(onPoll).toHaveBeenCalledTimes(1);

    unmount2();
    onPoll.mockClear();

    // Test with 30 seconds
    renderHook(() => usePolling({ interval: 30000, onPoll }));

    jest.advanceTimersByTime(30000);
    expect(onPoll).toHaveBeenCalledTimes(1);
  });

  test('should handle rapid enable/disable toggles', () => {
    const onPoll = jest.fn();
    const interval = 1000;

    const { rerender } = renderHook(
      ({ enabled }) => usePolling({ interval, enabled, onPoll }),
      { initialProps: { enabled: true } }
    );

    // Enable -> Disable -> Enable quickly
    rerender({ enabled: false });
    rerender({ enabled: true });

    jest.advanceTimersByTime(interval);
    expect(onPoll).toHaveBeenCalledTimes(1);

    // Disable -> Enable -> Disable quickly
    rerender({ enabled: false });
    rerender({ enabled: true });
    rerender({ enabled: false });

    jest.advanceTimersByTime(interval);
    expect(onPoll).toHaveBeenCalledTimes(1); // Should not increase
  });

  test('should maintain stable behavior with callback reference changes', () => {
    const interval = 1000;
    let callCount = 0;

    const { rerender } = renderHook(
      ({ onPoll }) => usePolling({ interval, onPoll }),
      {
        initialProps: {
          onPoll: () => {
            callCount++;
          },
        },
      }
    );

    // First interval
    jest.advanceTimersByTime(interval);
    expect(callCount).toBe(1);

    // Update with new callback reference (but same behavior)
    rerender({
      onPoll: () => {
        callCount++;
      },
    });

    // Should still work
    jest.advanceTimersByTime(interval);
    expect(callCount).toBe(2);
  });

  test('should handle onPoll that throws an error', () => {
    const onPoll = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    const interval = 1000;

    // Should not crash
    renderHook(() => usePolling({ interval, onPoll }));

    // Advance time - error should be thrown but hook should survive
    expect(() => {
      jest.advanceTimersByTime(interval);
    }).toThrow('Test error');

    expect(onPoll).toHaveBeenCalledTimes(1);
  });

  test('should work with very short intervals', () => {
    const onPoll = jest.fn();
    const interval = 100; // 100ms

    renderHook(() => usePolling({ interval, onPoll }));

    // Advance by 1 second (should trigger 10 times)
    jest.advanceTimersByTime(1000);
    expect(onPoll).toHaveBeenCalledTimes(10);
  });

  test('should work with very long intervals', () => {
    const onPoll = jest.fn();
    const interval = 120000; // 2 minutes

    renderHook(() => usePolling({ interval, onPoll }));

    // Advance by 1 minute - should not trigger
    jest.advanceTimersByTime(60000);
    expect(onPoll).not.toHaveBeenCalled();

    // Advance by another minute - should trigger
    jest.advanceTimersByTime(60000);
    expect(onPoll).toHaveBeenCalledTimes(1);
  });
});
