import React from "react";
import z from "zod";

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  schema: z.Schema<T>
) => {
  const [storedValue, setStoredValue] = React.useState(initialValue);

  React.useEffect(() => {
    const item = window.localStorage.getItem(key);
    try {
      const value = item ? schema.parse(JSON.parse(item)) : initialValue;
      setStoredValue(value);
    } catch (e) {
      console.error(e);
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    }
  }, [initialValue, key]);

  const setValue = (valueOrFunc: React.SetStateAction<T>) => {
    setStoredValue((prev) => {
      const value =
        valueOrFunc instanceof Function ? valueOrFunc(prev) : valueOrFunc;
      window.localStorage.setItem(key, JSON.stringify(value));
      return value;
    });
  };

  return [storedValue, setValue] as const;
};
