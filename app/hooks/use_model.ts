import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

const useModelStore = create(
  persist<{
    model: string;
    setModel: (model: string) => void;
  }>(
    (set) => ({
      model: DEFAULT_MODEL,
      setModel: (model) => set({ model }),
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
