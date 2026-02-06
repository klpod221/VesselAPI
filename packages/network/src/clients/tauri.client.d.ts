import type { NetworkClient, RequestConfig, NetworkResult, ClientCapabilities } from '../types';
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
export declare class TauriNetworkClient implements NetworkClient {
    readonly name = "tauri";
    readonly capabilities: ClientCapabilities;
    isAvailable(): Promise<boolean>;
    execute(config: RequestConfig): Promise<NetworkResult>;
    abort(): void;
}
//# sourceMappingURL=tauri.client.d.ts.map