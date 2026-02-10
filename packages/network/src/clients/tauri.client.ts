import type {
  NetworkClient,
  RequestConfig,
  NetworkResult,
  ResponseData,
  ClientCapabilities,
} from "../types";

declare global {
  interface Window {
    __TAURI__?: unknown;
  }
}

/**
 * Tauri Network Client implementation.
 *
 * Uses Rust's reqwest via Tauri Commands to bypass CORS completely.
 * Only available when running inside a Tauri application.
 */
export class TauriNetworkClient implements NetworkClient {
  readonly name = "tauri";
  readonly capabilities: ClientCapabilities = {
    bypassCors: true,
    accessLocalhost: true,
    supportsStreaming: false,
  };

  async isAvailable(): Promise<boolean> {
    return globalThis.window !== undefined && "__TAURI__" in globalThis.window;
  }

  async execute(config: RequestConfig): Promise<NetworkResult> {
    try {
      // Dynamic import to avoid bundling Tauri in web builds
      const { invoke } = await import("@tauri-apps/api/core");

      const response = await invoke<ResponseData>("execute_request", {
        config: {
          url: config.url,
          method: config.method,
          headers: config.headers ?? {},
          body: config.body ?? null,
          timeout: config.timeout ?? 30000,
          follow_redirects: config.followRedirects ?? true,
        },
      });

      return { ok: true, response };
    } catch (err) {
      return {
        ok: false,
        error: {
          type: "network",
          message: err instanceof Error ? err.message : String(err),
          originalError: err,
        },
      };
    }
  }

  abort(): void {
    // This client doesn't support abortion yet via Tauri command, but the interface requires it.
  }
}
