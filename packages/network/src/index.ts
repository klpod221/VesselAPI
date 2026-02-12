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
} from "./types";

// Network Clients (for executing API requests against external URLs)
export { TauriNetworkClient } from "./clients/tauri.client";
export { FetchNetworkClient } from "./clients/fetch.client";
export { ExtensionNetworkClient } from "./clients/extension.client";

// Network Client Factory
export { createNetworkClient, detectClientMode } from "./factory";
export type { ClientMode } from "./factory";

// API Client (for communicating with VesselAPI backend)
export {
  ApiClient,
  ApiError,
  configureApiClient,
  getApiClient,
} from "./api-client";
export type { ApiResponse } from "./api-client";
