import type { NetworkClient, RequestConfig, NetworkResult, ClientCapabilities } from '../types';
/**
 * Native Fetch Network Client implementation.
 *
 * Uses browser's native fetch API. Subject to CORS restrictions.
 * Best for public APIs that have proper CORS headers.
 */
export declare class FetchNetworkClient implements NetworkClient {
    readonly name = "fetch";
    readonly capabilities: ClientCapabilities;
    private abortController;
    isAvailable(): Promise<boolean>;
    execute(config: RequestConfig): Promise<NetworkResult>;
    abort(): void;
}
//# sourceMappingURL=fetch.client.d.ts.map