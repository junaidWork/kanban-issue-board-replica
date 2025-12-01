import { useEffect, useRef } from 'react';

interface UsePollingOptions {
  interval: number;
  enabled?: boolean;
  onPoll: () => void | Promise<void>;
}

export const usePolling = ({ interval, enabled = true, onPoll }: UsePollingOptions) => {
  const savedCallback = useRef<() => void | Promise<void>>(onPoll);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = onPoll;
  }, [onPoll]);

  // Set up the interval
  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval, enabled]);
};

