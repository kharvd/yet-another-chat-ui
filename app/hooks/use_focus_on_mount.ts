import React from "react";

export function useFocusOnMount<T extends HTMLElement>(): React.RefObject<T> {
  const ref = React.useRef<T | null>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return ref;
}
