import type { NetworkClient, RequestConfig, NetworkResult, ClientCapabilities } from '../types';
/**
 * Browser Extension Network Client implementation.
 *
 * Communicates with Chrome/Firefox extension via window.postMessage.
 * The extension's content script forwards requests to the background
 * service worker, which executes them without CORS restrictions.
 */
export declare class ExtensionNetworkClient implements NetworkClient {
    readonly name = "extension";
    readonly capabilities: ClientCapabilities;
    private pendingRequests;
    private initialized;
    private initialize;
    isAvailable(): Promise<boolean>;
    execute(config: RequestConfig): Promise<NetworkResult>;
    private handleMessage;
    abort(): void;
}
//# sourceMappingURL=extension.client.d.ts.map