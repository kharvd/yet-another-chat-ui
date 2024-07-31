import React from "react";

/**
 * A hook that sets a flag to true after a delay, unless it's canceled.
 */
export function useDelayedFlag(): [
  flag: boolean,
  setFlagDelayed: (delay: number) => void,
  reset: () => void
] {
  const [flag, setFlag] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const reset = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setFlag(false);
  };

  const setFlagDelayed = (delay: number) => {
    timeoutRef.current = setTimeout(() => {
      setFlag(true);
    }, delay);
  };

  return [flag, setFlagDelayed, reset];
}
