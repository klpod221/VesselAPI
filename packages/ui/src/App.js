'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { createNetworkClient } from '@vessel/network';
import { useRequestStore } from '@vessel/core';
import { CollectionSidebar } from './components/CollectionSidebar';
import { RequestPanel } from './components/RequestPanel';
import { ResponsePanel } from './components/ResponsePanel';
const DEFAULT_REQUEST = {
    id: 'default',
    name: 'New Request',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/todos/1',
    headers: [],
    queryParams: [],
    body: { type: 'none', content: '' },
    auth: { type: 'none' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
};
/**
 * Shared App component for Vessel API.
 * Used by both web and desktop (Tauri) applications.
 */
export function App({ platform, title = 'Vessel API' }) {
    const [client, setClient] = useState(null);
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
    const handleRequestSelect = (request) => {
        setActiveRequest(request);
    };
    return (_jsxs("div", { className: "h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden", children: [_jsxs("header", { className: "h-12 shrink-0 border-b border-border flex items-center px-4 justify-between bg-card select-none app-region-drag", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "h-6 w-6 rounded bg-primary flex items-center justify-center", children: _jsx("span", { className: "font-bold text-primary-foreground text-xs", children: "V" }) }), _jsx("span", { className: "font-bold", children: title }), client && (_jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground", children: client.name }))] }), _jsx("span", { className: "text-xs text-muted-foreground", children: platform === 'tauri' ? 'Desktop' : 'Web' })] }), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [_jsx(CollectionSidebar, { className: "w-64 shrink-0", onRequestSelect: handleRequestSelect }), _jsx("div", { className: "flex-1 border-r border-border min-w-[300px]", children: _jsx(RequestPanel, {}) }), _jsx("div", { className: "flex-1 min-w-[300px]", children: _jsx(ResponsePanel, {}) })] })] }));
}
//# sourceMappingURL=App.js.map