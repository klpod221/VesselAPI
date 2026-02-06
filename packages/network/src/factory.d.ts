import type { NetworkClient } from './types';
export type ClientMode = 'auto' | 'tauri' | 'fetch' | 'extension';
/**
 * Create a network client based on preferred mode or auto-detect.
 *
 * Auto-detection priority: Tauri → Extension → Fetch
 *
 * @param preferredMode - Explicit mode or 'auto' for detection
 * @returns Promise resolving to an available NetworkClient
 */
export declare function createNetworkClient(preferredMode?: ClientMode): Promise<NetworkClient>;
/**
 * Get current client mode based on environment.
 * Useful for UI indicators showing which mode is active.
 */
export declare function detectClientMode(): Promise<ClientMode>;
//# sourceMappingURL=factory.d.ts.map