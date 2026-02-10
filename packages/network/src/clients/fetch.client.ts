import type {
  NetworkClient,
  RequestConfig,
  NetworkResult,
  ClientCapabilities,
} from '../types';

/**
 * Native Fetch Network Client implementation.
 *
 * Uses browser's native fetch API. Subject to CORS restrictions.
 * Best for public APIs that have proper CORS headers.
 */
export class FetchNetworkClient implements NetworkClient {
  readonly name = 'fetch';
  readonly capabilities: ClientCapabilities = {
    bypassCors: false,
    accessLocalhost: false,
    supportsStreaming: true,
  };

  private abortController: AbortController | null = null;

  async isAvailable(): Promise<boolean> {
    return typeof fetch === 'function';
  }

  async execute(config: RequestConfig): Promise<NetworkResult> {
    const startTime = performance.now();
    this.abortController = new AbortController();

    try {
      const timeoutId = config.timeout
        ? setTimeout(() => this.abortController?.abort(), config.timeout)
        : undefined;

      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body as BodyInit | undefined,
        signal: this.abortController.signal,
        redirect: config.followRedirects === false ? 'manual' : 'follow',
      });

      if (timeoutId) clearTimeout(timeoutId);

      const firstByteTime = performance.now() - startTime;
      const body = await response.text();
      const totalTime = performance.now() - startTime;

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        ok: true,
        response: {
          status: response.status,
          statusText: response.statusText,
          headers,
          body,
          timing: {
            firstByte: Math.round(firstByteTime),
            total: Math.round(totalTime),
          },
          size: {
            headers: JSON.stringify(headers).length,
            body: body.length,
          },
        },
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return {
          ok: false,
          error: { type: 'aborted', message: 'Request was aborted' },
        };
      }

      const message = err instanceof Error ? err.message : String(err);
      const isCorsError = message.includes('CORS') || message.includes('Failed to fetch');

      return {
        ok: false,
        error: {
          type: isCorsError ? 'cors' : 'network',
          message,
          originalError: err,
        },
      };
    }
  }

  abort(): void {
    this.abortController?.abort();
  }
}
