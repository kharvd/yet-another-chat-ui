import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

export type ThinkingLevel = "none" | "low" | "medium" | "high";

export const THINKING_BUDGETS: Record<ThinkingLevel, number> = {
  none: 0,
  low: 10000,
  medium: 30000,
  high: 60000,
};

const useModelStore = create(
  persist<{
    model: string;
    setModel: (model: string) => void;
    thinkingLevel: ThinkingLevel;
    setThinkingLevel: (level: ThinkingLevel) => void;
  }>(
    (set) => ({
      model: DEFAULT_MODEL,
      setModel: (model) => set({ model }),
      thinkingLevel: "none",
      setThinkingLevel: (level) => set({ thinkingLevel: level }),
    }),
    {
      name: "model",
      storage: createJSONStorage(() => window.localStorage),
    }
  )
);

export const useModel = (): [string, (model: string) => void] => {
  const model = useModelStore((state) => state.model);
  const setModel = useModelStore((state) => state.setModel);
  return [model, setModel];
};

export const useThinkingLevel = (): [ThinkingLevel, (level: ThinkingLevel) => void] => {
  const thinkingLevel = useModelStore((state) => state.thinkingLevel);
  const setThinkingLevel = useModelStore((state) => state.setThinkingLevel);
  return [thinkingLevel, setThinkingLevel];
};
