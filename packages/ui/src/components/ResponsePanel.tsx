import { useState } from 'react';
import { useRequestStore } from '@vessel/core';
import { CodeEditor } from './CodeEditor';
import { ScrollArea } from './ScrollArea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { cn, formatBytes, formatTime, getStatusColor } from '../lib/utils';
import { Clock, HardDrive, Wifi } from 'lucide-react';

export function ResponsePanel() {
  const { lastResponse, isLoading, error } = useRequestStore();
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');
  const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview');

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p>Sending request...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-destructive p-4 gap-2 text-center">
         <Wifi className="h-12 w-12 opacity-50" />
         <h3 className="font-semibold">Request Failed</h3>
         <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  if (!lastResponse) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground p-4">
        No response yet
      </div>
    );
  }

  const isJson = lastResponse.headers['content-type']?.includes('application/json');
  const isHtml = lastResponse.headers['content-type']?.includes('text/html');
  
  let formattedBody = lastResponse.body;
  if (isJson) {
    try {
      formattedBody = JSON.stringify(JSON.parse(lastResponse.body), null, 2);
    } catch {
      // Keep original if parsing fails
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Status Bar - Fixed Height */}
      <div className="h-14 shrink-0 flex items-center gap-4 border-b border-border px-4 bg-card">
        <span className={cn("text-sm font-bold px-2.5 py-1 rounded bg-black/20 border border-white/5", getStatusColor(lastResponse.status))}>
          {lastResponse.status} {lastResponse.statusText}
        </span>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground ml-auto">
          <div className="flex items-center gap-1.5 bg-muted/40 border border-white/5 px-2.5 py-1 rounded-sm">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(lastResponse.timing.total)}
          </div>
          <div className="flex items-center gap-1.5 bg-muted/40 border border-white/5 px-2.5 py-1 rounded-sm">
            <HardDrive className="h-3.5 w-3.5" />
            {formatBytes(lastResponse.size.body + lastResponse.size.headers)}
          </div>
        </div>
      </div>

      {/* Tabs Section - Takes remaining height */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'body' | 'headers')} className="flex-1 min-h-0 flex flex-col">
        {/* Tab List - Fixed Height */}
        <div className="shrink-0 border-b border-border px-4 bg-muted/20">
          <TabsList>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content - Takes remaining height */}
        <div className="flex-1 min-h-0">
          <TabsContent value="body" className="h-full flex flex-col">
            {/* Preview Toggle for non-JSON */}
            {!isJson && (
              <div className="shrink-0 flex justify-end px-2 py-1 border-b border-border bg-black/20">
                <div className="flex bg-muted/20 p-0.5 rounded-md">
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-sm transition-all",
                      viewMode === 'preview' ? "bg-primary/20 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('source')}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-sm transition-all",
                      viewMode === 'source' ? "bg-primary/20 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Source
                  </button>
                </div>
              </div>
            )}

            {/* Content Area - Scrollable */}
            <div className="flex-1 min-h-0 p-4">
              {viewMode === 'preview' && isHtml ? (
                <iframe 
                  srcDoc={lastResponse.body}
                  title="Preview"
                  className="w-full h-full bg-white border-none"
                  sandbox="allow-scripts"
                />
              ) : (
                <CodeEditor
                  value={formattedBody}
                  language={isJson ? 'json' : 'text'}
                  readOnly
                  className="h-full border-none rounded-none"
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="headers" className="h-full">
            <ScrollArea className="h-full w-full">
              <div className="p-4">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(lastResponse.headers).map(([key, value], index) => (
                      <tr key={key} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                        <td className="py-2 px-3 font-medium text-muted-foreground whitespace-nowrap align-top w-[200px]">{key}</td>
                        <td className="py-2 px-3 font-mono text-foreground break-all">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
