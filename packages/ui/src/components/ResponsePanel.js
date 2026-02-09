import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useRequestStore } from '@vessel/core';
import { CodeEditor } from './CodeEditor';
import { ScrollArea } from './ScrollArea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { cn, formatBytes, formatTime, getStatusColor } from '../lib/utils';
import { Clock, HardDrive, Wifi } from 'lucide-react';
export function ResponsePanel() {
    const { lastResponse, isLoading, error } = useRequestStore();
    const [activeTab, setActiveTab] = useState('body');
    const [viewMode, setViewMode] = useState('preview');
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
    const isHtml = lastResponse.headers['content-type']?.includes('text/html');
    let formattedBody = lastResponse.body;
    if (isJson) {
        try {
            formattedBody = JSON.stringify(JSON.parse(lastResponse.body), null, 2);
        }
        catch {
            // Keep original if parsing fails
        }
    }
    return (_jsxs("div", { className: "h-full flex flex-col bg-background", children: [_jsxs("div", { className: "h-14 shrink-0 flex items-center gap-4 border-b border-border px-4 bg-card", children: [_jsxs("span", { className: cn("text-sm font-bold px-2.5 py-1 rounded bg-black/20 border border-white/5", getStatusColor(lastResponse.status)), children: [lastResponse.status, " ", lastResponse.statusText] }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground ml-auto", children: [_jsxs("div", { className: "flex items-center gap-1.5 bg-muted/40 border border-white/5 px-2.5 py-1 rounded-sm", children: [_jsx(Clock, { className: "h-3.5 w-3.5" }), formatTime(lastResponse.timing.total)] }), _jsxs("div", { className: "flex items-center gap-1.5 bg-muted/40 border border-white/5 px-2.5 py-1 rounded-sm", children: [_jsx(HardDrive, { className: "h-3.5 w-3.5" }), formatBytes(lastResponse.size.body + lastResponse.size.headers)] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: (v) => setActiveTab(v), className: "flex-1 min-h-0 flex flex-col", children: [_jsx("div", { className: "shrink-0 border-b border-border px-4 bg-muted/20", children: _jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "body", children: "Body" }), _jsx(TabsTrigger, { value: "headers", children: "Headers" })] }) }), _jsxs("div", { className: "flex-1 min-h-0", children: [_jsxs(TabsContent, { value: "body", className: "h-full flex flex-col", children: [!isJson && (_jsx("div", { className: "shrink-0 flex justify-end px-2 py-1 border-b border-border bg-black/20", children: _jsxs("div", { className: "flex bg-muted/20 p-0.5 rounded-md", children: [_jsx("button", { type: "button", onClick: () => setViewMode('preview'), className: cn("px-3 py-1 text-xs font-medium rounded-sm transition-all", viewMode === 'preview' ? "bg-primary/20 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"), children: "Preview" }), _jsx("button", { type: "button", onClick: () => setViewMode('source'), className: cn("px-3 py-1 text-xs font-medium rounded-sm transition-all", viewMode === 'source' ? "bg-primary/20 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"), children: "Source" })] }) })), _jsx("div", { className: "flex-1 min-h-0 p-4", children: viewMode === 'preview' && isHtml ? (_jsx("iframe", { srcDoc: lastResponse.body, title: "Preview", className: "w-full h-full bg-white border-none", sandbox: "allow-scripts" })) : (_jsx(CodeEditor, { value: formattedBody, language: isJson ? 'json' : 'text', readOnly: true, className: "h-full border-none rounded-none" })) })] }), _jsx(TabsContent, { value: "headers", className: "h-full", children: _jsx(ScrollArea, { className: "h-full w-full", children: _jsx("div", { className: "p-4", children: _jsx("table", { className: "w-full text-sm", children: _jsx("tbody", { children: Object.entries(lastResponse.headers).map(([key, value], index) => (_jsxs("tr", { className: index % 2 === 0 ? 'bg-muted/20' : '', children: [_jsx("td", { className: "py-2 px-3 font-medium text-muted-foreground whitespace-nowrap align-top w-[200px]", children: key }), _jsx("td", { className: "py-2 px-3 font-mono text-foreground break-all", children: String(value) })] }, key))) }) }) }) }) })] })] })] }));
}
//# sourceMappingURL=ResponsePanel.js.map