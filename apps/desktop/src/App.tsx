import { useEffect } from 'react';
import { createNetworkClient } from '@vessel/network';
import { RequestPanel, ResponsePanel, useRequestStore } from '@vessel/ui';
import { KeyValuePair } from '@vessel/core';

const DEFAULT_REQUEST = {
  id: 'default',
  name: 'New Request',
  method: 'GET' as const,
  url: 'https://jsonplaceholder.typicode.com/todos/1',
  headers: [] as KeyValuePair[],
  queryParams: [] as KeyValuePair[],
  body: { type: 'none' as const, content: '' },
  auth: { type: 'none' as const },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function App() {
  const { setActiveRequest, setClient: setStoreClient } = useRequestStore();

  useEffect(() => {
    async function init() {
      const networkClient = await createNetworkClient('tauri');
      setStoreClient(networkClient);
      setActiveRequest(DEFAULT_REQUEST);
      console.log('Desktop client initialized:', networkClient.name);
    }
    init();
  }, [setActiveRequest, setStoreClient]);

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-mono antialiased selection:bg-primary/30">
      {/* Desktop Header (Draggable) - Pro Max: Solid, high contrast */}
      <header className="h-10 border-b border-border flex items-center px-4 justify-between bg-background z-10 relative app-region-drag select-none">
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
            <div className="ml-4 flex items-center gap-2">
                 <span className="font-bold text-primary tracking-tight text-sm">Vessel</span>
                 <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-70">Desktop</span>
            </div>
        </div>
      </header>

      {/* Main Content: IDE Layout - Sidebar + Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-12 border-r border-border flex flex-col items-center py-3 gap-3 bg-card">
             <div className="w-8 h-8 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex bg-background">
             {/* Left: Request Panel */}
            <div className="flex-1 min-w-[350px] flex flex-col border-r border-border">
                <RequestPanel />
            </div>
             {/* Right: Response Panel */}
            <div className="flex-1 min-w-[350px] flex flex-col">
                <ResponsePanel />
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;
