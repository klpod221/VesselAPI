// Types
export type {
  HttpMethod,
  RequestConfig,
  ResponseTiming,
  ResponseSize,
  ResponseData,
  NetworkErrorType,
  NetworkError,
  NetworkResult,
  ClientCapabilities,
  NetworkClient,
} from './types';

// Clients
export { TauriNetworkClient } from './clients/tauri.client';
export { FetchNetworkClient } from './clients/fetch.client';
export { ExtensionNetworkClient } from './clients/extension.client';

// Factory
export { createNetworkClient, detectClientMode } from './factory';
export type { ClientMode } from './factory';
