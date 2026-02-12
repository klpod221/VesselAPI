const getApiBaseUrl = (): string => {
  // Node.js environment (e.g., SSR or tests)
  if (globalThis.process !== undefined && process.env?.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }

  // Vite / browser environment
  if (import.meta !== undefined) {
    const env = (import.meta as any).env;
    if (env?.VITE_API_BASE_URL) {
      return env.VITE_API_BASE_URL as string;
    }
  }

  return "http://localhost:3000";
};

export const AppConfig = {
  apiBaseUrl: getApiBaseUrl(),
} as const;
