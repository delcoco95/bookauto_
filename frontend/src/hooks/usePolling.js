import { useEffect, useRef, useCallback } from 'react';

const usePolling = (callback, delay = 5000, dependencies = []) => {
  const savedCallback = useRef();
  const intervalRef = useRef();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }, delay);
  }, [delay]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Set up the interval when dependencies change
  useEffect(() => {
    startPolling();
    
    // Cleanup on unmount or when dependencies change
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, ...dependencies]);

  // Pause/resume based on page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startPolling, stopPolling]);

  return { startPolling, stopPolling };
};

export default usePolling;
