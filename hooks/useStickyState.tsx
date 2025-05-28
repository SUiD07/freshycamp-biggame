import { useState, useEffect, Dispatch, SetStateAction } from "react";

type SaveableData = string | number | object | boolean | undefined | null;

export default function useStickyState<T extends SaveableData>(
  defaultValue: T,
  key: string
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue; // SSR guard
    const stickyValue = window.localStorage.getItem(key);
    if (stickyValue !== null) {
      try {
        return JSON.parse(stickyValue);
      } catch {
        console.error("Error parsing localStorage value for key:", key);
        return defaultValue;
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
