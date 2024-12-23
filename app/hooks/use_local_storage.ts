import { useEffect } from "react";
import z from "zod";
import useSWR from "swr";

const localStorageFetcher = (key: string) => {
  const item = window.localStorage.getItem(key);
  if (!item) {
    return null;
  }

  try {
    return JSON.parse(item);
  } catch (e) {
    console.error(e);
    window.localStorage.removeItem(key);
    return null;
  }
};

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  schema: z.Schema<T>
): [T, (value: T, shouldMutate?: boolean) => void] => {
  const { data, mutate, isLoading } = useSWR(key, localStorageFetcher);

  const setValue = (value: T, shouldMutate: boolean = true) => {
    window.localStorage.setItem(key, JSON.stringify(value));
    if (shouldMutate) {
      mutate(value);
    }
  };

  useEffect(() => {
    if (!data && !isLoading) {
      setValue(initialValue, true);
    }
  }, [data]);

  if (isLoading) {
    return [initialValue, setValue];
  }

  if (!data) {
    return [initialValue, setValue];
  }

  try {
    const value = schema.parse(data);
    return [value, setValue];
  } catch (e) {
    console.error(e);
    window.localStorage.removeItem(key);
    return [initialValue, setValue];
  }
};
