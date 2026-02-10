import type {
  NetworkClient,
  RequestConfig,
  NetworkResult,
  ResponseData,
  ClientCapabilities,
} from '../types';

const MESSAGE_TIMEOUT = 60000;

interface ExtensionMessage {
  type: 'VESSEL_API_REQUEST';
  payload: RequestConfig;
  requestId: string;
}

interface ExtensionResponse {
  type: 'VESSEL_API_RESPONSE';
  requestId: string;
  success: boolean;
  response?: ResponseData;
  error?: string;
}

/**
 * Browser Extension Network Client implementation.
 *
 * Communicates with Chrome/Firefox extension via window.postMessage.
 * The extension's content script forwards requests to the background
 * service worker, which executes them without CORS restrictions.
 */
export class ExtensionNetworkClient implements NetworkClient {
  readonly name = 'extension';
  readonly capabilities: ClientCapabilities = {
    bypassCors: true,
    accessLocalhost: true,
    supportsStreaming: false,
  };

  private pendingRequests = new Map<
    string,
    {
      resolve: (result: NetworkResult) => void;
      timeout: ReturnType<typeof setTimeout>;
    }
  >();

  private initialized = false;

  private initialize(): void {
    if (this.initialized) return;
    this.initialized = true;
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  async isAvailable(): Promise<boolean> {
    this.initialize();

    return new Promise((resolve) => {
      const checkId = crypto.randomUUID();
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handler);
        resolve(false);
      }, 1000);

      const handler = (event: MessageEvent) => {
        if (
          event.source === window &&
          event.data?.type === 'VESSEL_API_PONG' &&
          event.data?.checkId === checkId
        ) {
          clearTimeout(timeout);
          window.removeEventListener('message', handler);
          resolve(true);
        }
      };

      window.addEventListener('message', handler);
      window.postMessage({ type: 'VESSEL_API_PING', checkId }, '*');
    });
  }

  async execute(config: RequestConfig): Promise<NetworkResult> {
    this.initialize();
    const requestId = crypto.randomUUID();

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        resolve({
          ok: false,
          error: {
            type: 'timeout',
            message: 'Extension request timed out',
          },
        });
      }, config.timeout ?? MESSAGE_TIMEOUT);

      this.pendingRequests.set(requestId, { resolve, timeout });

      window.postMessage(
        {
          type: 'VESSEL_API_REQUEST',
          payload: config,
          requestId,
        } satisfies ExtensionMessage,
        '*'
      );
    });
  }

  private handleMessage(event: MessageEvent): void {
    if (event.source !== window) return;

    const data = event.data as ExtensionResponse;
    if (data?.type !== 'VESSEL_API_RESPONSE') return;

    const pending = this.pendingRequests.get(data.requestId);
    if (!pending) return;

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(data.requestId);

    if (data.success && data.response) {
      pending.resolve({ ok: true, response: data.response });
    } else {
      pending.resolve({
        ok: false,
        error: {
          type: 'network',
          message: data.error ?? 'Unknown extension error',
        },
      });
    }
  }

  abort(): void {
    // Extension requests cannot be aborted from the web app side
  }
}
