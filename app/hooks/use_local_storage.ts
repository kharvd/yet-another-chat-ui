import React from "react";

export const useLocalStorage = (key: string, initialValue: string) => {
  const [storedValue, setStoredValue] = React.useState(initialValue);

  React.useEffect(() => {
    setStoredValue(window.localStorage.getItem(key) || initialValue);
  }, [initialValue, key]);

  const setValue = (value: string) => {
    setStoredValue(value);
    window.localStorage.setItem(key, value);
  };

  return [storedValue, setValue] as const;
};
