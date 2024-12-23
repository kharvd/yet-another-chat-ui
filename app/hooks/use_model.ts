import { z } from "zod";
import { useLocalStorage } from "./use_local_storage";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";
export function useModel(): [string, (model: string) => void] {
  const [model, setModel] = useLocalStorage("model", DEFAULT_MODEL, z.string());
  return [model, setModel];
}
