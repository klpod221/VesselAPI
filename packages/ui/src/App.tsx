'use client';

import { useEffect, useState } from 'react';
import { createNetworkClient, type NetworkClient } from '@vessel/network';
import { useRequestStore } from '@vessel/core';
import { RequestPanel } from './components/RequestPanel';
import { ResponsePanel } from './components/ResponsePanel';

export interface AppProps {
  /** Platform determines which network client to use */
  readonly platform: 'web' | 'tauri';
  /** Optional app title override */
  readonly title?: string;
}

const DEFAULT_REQUEST = {
  id: 'default',
  name: 'New Request',
  method: 'GET' as const,
  url: 'https://jsonplaceholder.typicode.com/todos/1',
  headers: [],
  queryParams: [],
  body: { type: 'none' as const, content: '' },
  auth: { type: 'none' as const },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * Shared App component for Vessel API.
 * Used by both web and desktop (Tauri) applications.
 */
export function App({ platform, title = 'Vessel API' }: AppProps) {
  const [client, setClient] = useState<NetworkClient | null>(null);
  const { setActiveRequest, setClient: setStoreClient } = useRequestStore();

  useEffect(() => {
    async function init() {
      // Use platform-specific client initialization
      const clientType = platform === 'tauri' ? 'tauri' : 'auto';
      const networkClient = await createNetworkClient(clientType);
      setClient(networkClient);
      setStoreClient(networkClient);
      setActiveRequest(DEFAULT_REQUEST);
      console.log(`${title} initialized with ${networkClient.name} client`);
    }
    init();
  }, [platform, title, setActiveRequest, setStoreClient]);

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-12 shrink-0 border-b border-border flex items-center px-4 justify-between bg-card select-none app-region-drag">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
            <span className="font-bold text-primary-foreground text-xs">V</span>
          </div>
          <span className="font-bold">{title}</span>
          {/* Client Mode Badge */}
          {client && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {client.name}
            </span>
          )}
        </div>
        {/* Platform indicator */}
        <span className="text-xs text-muted-foreground">
          {platform === 'tauri' ? 'Desktop' : 'Web'}
        </span>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Request Panel */}
        <div className="flex-1 border-r border-border min-w-[300px]">
          <RequestPanel />
        </div>
        {/* Response Panel */}
        <div className="flex-1 min-w-[300px]">
          <ResponsePanel />
        </div>
      </div>
    </div>
  );
}
