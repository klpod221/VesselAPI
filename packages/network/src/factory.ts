import type { NetworkClient } from './types';
import { TauriNetworkClient } from './clients/tauri.client';
import { FetchNetworkClient } from './clients/fetch.client';
import { ExtensionNetworkClient } from './clients/extension.client';

export type ClientMode = 'auto' | 'tauri' | 'fetch' | 'extension';

const clientFactories: Record<Exclude<ClientMode, 'auto'>, () => NetworkClient> = {
  tauri: () => new TauriNetworkClient(),
  extension: () => new ExtensionNetworkClient(),
  fetch: () => new FetchNetworkClient(),
};

/**
 * Create a network client based on preferred mode or auto-detect.
 *
 * Auto-detection priority: Tauri → Extension → Fetch
 *
 * @param preferredMode - Explicit mode or 'auto' for detection
 * @returns Promise resolving to an available NetworkClient
 */
export async function createNetworkClient(
  preferredMode: ClientMode = 'auto'
): Promise<NetworkClient> {
  if (preferredMode !== 'auto') {
    const client = clientFactories[preferredMode]();
    if (await client.isAvailable()) {
      return client;
    }
    console.warn(`[Vessel] Client "${preferredMode}" not available, falling back...`);
  }

  const priority: Array<Exclude<ClientMode, 'auto'>> = ['tauri', 'extension', 'fetch'];

  for (const mode of priority) {
    const client = clientFactories[mode]();
    if (await client.isAvailable()) {
      return client;
    }
  }

  // Fallback to fetch (always available in browser)
  console.info('[Vessel] Falling back to fetch client');
  return new FetchNetworkClient();
}

/**
 * Get current client mode based on environment.
 * Useful for UI indicators showing which mode is active.
 */
export async function detectClientMode(): Promise<ClientMode> {
  const client = await createNetworkClient('auto');
  return client.name as ClientMode;
}
