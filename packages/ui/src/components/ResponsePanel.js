import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useRequestStore } from '@vessel/core';
import { CodeEditor } from './CodeEditor';
import { cn, formatBytes, formatTime, getStatusColor } from '../lib/utils';
import { Clock, HardDrive, Wifi } from 'lucide-react';
export function ResponsePanel() {
    const { lastResponse, isLoading, error } = useRequestStore();
    const [activeTab, setActiveTab] = useState('body');
    if (isLoading) {
        return (_jsxs("div", { className: "flex h-full flex-col items-center justify-center text-muted-foreground gap-4", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }), _jsx("p", { children: "Sending request..." })] }));
    }
    if (error) {
        return (_jsxs("div", { className: "flex h-full flex-col items-center justify-center text-destructive p-4 gap-2 text-center", children: [_jsx(Wifi, { className: "h-12 w-12 opacity-50" }), _jsx("h3", { className: "font-semibold", children: "Request Failed" }), _jsx("p", { className: "text-sm opacity-80", children: error })] }));
    }
    if (!lastResponse) {
        return (_jsx("div", { className: "flex h-full items-center justify-center text-muted-foreground p-4", children: "No response yet" }));
    }
    const isJson = lastResponse.headers['content-type']?.includes('application/json');
    const formattedBody = isJson
        ? JSON.stringify(JSON.parse(lastResponse.body), null, 2)
        : lastResponse.body;
    return (_jsxs("div", { className: "flex h-full flex-col glass-panel rounded-lg overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-4 border-b border-glass-border p-3 bg-glass-highlight/20", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsxs("span", { className: cn("text-lg font-bold px-2 py-0.5 rounded-md bg-black/20", getStatusColor(lastResponse.status)), children: [lastResponse.status, " ", lastResponse.statusText] }) }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground ml-auto", children: [_jsxs("div", { className: "flex items-center gap-1 bg-glass-highlight/50 px-2 py-1 rounded-full", children: [_jsx(Clock, { className: "h-3 w-3" }), formatTime(lastResponse.timing.total)] }), _jsxs("div", { className: "flex items-center gap-1 bg-glass-highlight/50 px-2 py-1 rounded-full", children: [_jsx(HardDrive, { className: "h-3 w-3" }), formatBytes(lastResponse.size.body + lastResponse.size.headers)] })] })] }), _jsx("div", { className: "flex border-b border-glass-border px-4 bg-glass-highlight/30", children: ['body', 'headers'].map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab), className: cn("border-b-2 px-4 py-2 text-sm font-medium transition-colors hover:text-primary relative", activeTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground"), children: [tab.charAt(0).toUpperCase() + tab.slice(1), activeTab === tab && (_jsx("span", { className: "absolute inset-0 bg-primary/5 rounded-t-md pointer-events-none" }))] }, tab))) }), _jsxs("div", { className: "flex-1 overflow-hidden relative", children: [activeTab === 'body' && (_jsx(CodeEditor, { value: formattedBody, language: isJson ? 'json' : 'text', readOnly: true, className: "h-full border-none rounded-none bg-transparent", minHeight: "100%", maxHeight: "100%" })), activeTab === 'headers' && (_jsx("div", { className: "p-4 overflow-auto h-full", children: _jsx("div", { className: "grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm", children: Object.entries(lastResponse.headers).map(([key, value]) => (_jsxs("div", { className: "contents", children: [_jsxs("div", { className: "font-medium text-muted-foreground text-right select-none", children: [key, ":"] }), _jsx("div", { className: "break-all font-mono select-text text-foreground/90", children: String(value) })] }, key))) }) }))] })] }));
}
//# sourceMappingURL=ResponsePanel.js.map