import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { createNetworkClient } from '@vessel/network';
import { RequestPanel, ResponsePanel, useRequestStore } from '@vessel/ui';
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
    return (_jsxs("div", { className: "h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden", children: [_jsx("header", { className: "h-10 border-b flex items-center px-4 justify-between bg-card text-sm select-none app-region-drag", children: _jsx("div", { className: "flex items-center gap-2", children: _jsx("span", { className: "font-bold", children: "Vessel Desktop" }) }) }), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [_jsx("div", { className: "flex-1 border-r min-w-[300px]", children: _jsx(RequestPanel, {}) }), _jsx("div", { className: "flex-1 min-w-[300px]", children: _jsx(ResponsePanel, {}) })] })] }));
}
export default App;
//# sourceMappingURL=App.js.map