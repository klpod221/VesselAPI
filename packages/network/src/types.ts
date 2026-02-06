/**
 * HTTP Methods supported by the Network Client.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * Configuration for an HTTP request.
 */
export interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: string | FormData | Blob;
  timeout?: number;
  followRedirects?: boolean;
}

/**
 * Timing metrics for the HTTP response.
 */
export interface ResponseTiming {
  dns?: number;
  connect?: number;
  tls?: number;
  firstByte: number;
  total: number;
}

/**
 * Size metrics for the HTTP response.
 */
export interface ResponseSize {
  headers: number;
  body: number;
}

/**
 * Successful HTTP response data.
 */
export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timing: ResponseTiming;
  size: ResponseSize;
}

/**
 * Network error types.
 */
export type NetworkErrorType = 'network' | 'timeout' | 'cors' | 'extension_unavailable' | 'aborted';

/**
 * Network error details.
 */
export interface NetworkError {
  type: NetworkErrorType;
  message: string;
  originalError?: unknown;
}

/**
 * Result type for network operations (discriminated union).
 */
export type NetworkResult =
  | { ok: true; response: ResponseData }
  | { ok: false; error: NetworkError };

/**
 * Client capability flags.
 */
export interface ClientCapabilities {
  bypassCors: boolean;
  accessLocalhost: boolean;
  supportsStreaming: boolean;
}

/**
 * Abstract Network Client interface.
 *
 * All platform-specific implementations (Tauri, Extension, Fetch)
 * must adhere to this contract.
 */
export interface NetworkClient {
  /** Unique identifier for this client type */
  readonly name: string;

  /** Capability flags indicating what this client can do */
  readonly capabilities: ClientCapabilities;

  /**
   * Execute an HTTP request.
   * @param config - Request configuration
   * @returns Promise resolving to success response or error
   */
  execute(config: RequestConfig): Promise<NetworkResult>;

  /**
   * Check if this client is available in the current environment.
   * @returns Promise resolving to availability status
   */
  isAvailable(): Promise<boolean>;

  /**
   * Abort an ongoing request (if supported).
   */
  abort?(): void;
}
