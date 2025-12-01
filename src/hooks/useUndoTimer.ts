import { useEffect, useState } from 'react';
import { UNDO_TIMEOUT } from '../constants/app';

export const useUndoTimer = (timestamp: number | null, onExpire: () => void) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!timestamp) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - timestamp;
      const remaining = Math.max(0, UNDO_TIMEOUT - elapsed);
      
      if (remaining === 0) {
        onExpire();
        setTimeLeft(null);
      } else {
        setTimeLeft(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [timestamp, onExpire]);

  return timeLeft;
};

