export type { HttpMethod, RequestConfig, ResponseTiming, ResponseSize, ResponseData, NetworkErrorType, NetworkError, NetworkResult, ClientCapabilities, NetworkClient, } from './types';
export { TauriNetworkClient } from './clients/tauri.client';
export { FetchNetworkClient } from './clients/fetch.client';
export { ExtensionNetworkClient } from './clients/extension.client';
export { createNetworkClient, detectClientMode } from './factory';
export type { ClientMode } from './factory';
//# sourceMappingURL=index.d.ts.map