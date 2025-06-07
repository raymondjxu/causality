import { useState, useEffect, useRef } from 'react';

export default function useLoadingDelay(isLoading, minimumDelay = 100) {
  const [delayedLoading, setDelayedLoading] = useState(false);
  const startTimeRef = useRef(0);

  useEffect(() => {
    let timeout;
    if (isLoading) {
      startTimeRef.current = Date.now();
      setDelayedLoading(true);
    } else {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = elapsed < minimumDelay ? minimumDelay - elapsed : 0;
      timeout = setTimeout(() => {
        setDelayedLoading(false);
      }, remaining);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, minimumDelay]);

  return delayedLoading;
}
