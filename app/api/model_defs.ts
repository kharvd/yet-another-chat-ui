export type Provider = "openai" | "anthropic" | "hyperbolic";

export type ModelDef = {
  api_name: string;
  display_name: string;
  provider: Provider;
};

export const MODEL_DEFS: ReadonlyArray<ModelDef> = [
  {
    api_name: "gpt-4o",
    display_name: "GPT-4o",
    provider: "openai",
  },
  {
    api_name: "gpt-4.1",
    display_name: "GPT-4.1",
    provider: "openai",
  },
  {
    api_name: "chatgpt-4o-latest",
    display_name: "ChatGPT-4o",
    provider: "openai",
  },
  {
    api_name: "gpt-4o-mini",
    display_name: "GPT-4o Mini",
    provider: "openai",
  },
  {
    api_name: "gpt-4-turbo-2024-04-09",
    display_name: "GPT-4-Turbo",
    provider: "openai",
  },
  {
    api_name: "claude-3-7-sonnet-20250219",
    display_name: "Claude 3.7 Sonnet",
    provider: "anthropic",
  },
  {
    api_name: "claude-3-5-sonnet-20241022",
    display_name: "Claude 3.5 Sonnet",
    provider: "anthropic",
  },
  {
    api_name: "claude-3-opus-20240229",
    display_name: "Claude 3 Opus",
    provider: "anthropic",
  },
  {
    api_name: "meta-llama/Meta-Llama-3.1-405B-Instruct",
    display_name: "Llama 3.1 405B Instruct",
    provider: "hyperbolic",
  },
] as const;

export const providerForModel = (model: string): Provider => {
  const modelDef = MODEL_DEFS.find((modelDef) => modelDef.api_name === model);
  if (!modelDef) {
    throw new Error(`Unknown model: ${model}`);
  }
  return modelDef.provider;
};
