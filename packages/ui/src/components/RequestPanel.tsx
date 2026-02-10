import { useState } from 'react';
import { Plus, Trash2, Send } from 'lucide-react';
import { useRequestStore, type KeyValuePair } from '@vessel/core';
import { CodeEditor } from './CodeEditor';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { Label } from './Label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { ScrollArea } from './ScrollArea';
import { cn, getMethodColor } from '../lib/utils';

export function RequestPanel() {
  const { activeRequest, updateRequest, executeRequest, isLoading } = useRequestStore();
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'auth' | 'body'>('params');

  if (!activeRequest) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground p-4">
        Select or create a request to get started
      </div>
    );
  }

  const handleSend = () => {
    executeRequest();
  };

  const addKeyValuePair = (type: 'queryParams' | 'headers') => {
    updateRequest({
      [type]: [...activeRequest[type], { id: crypto.randomUUID(), key: '', value: '', enabled: true }]
    });
  };

  const updateKeyValuePair = (type: 'queryParams' | 'headers', index: number, updates: Partial<KeyValuePair>) => {
    const newItems = [...activeRequest[type]];
    newItems[index] = { ...newItems[index], ...updates };
    updateRequest({ [type]: newItems });
  };

  const removeKeyValuePair = (type: 'queryParams' | 'headers', index: number) => {
    const newItems = activeRequest[type].filter((_: KeyValuePair, i: number) => i !== index);
    updateRequest({ [type]: newItems });
  };

  return (
    <div className="h-full flex flex-col bg-background">

      <div className="h-14 shrink-0 flex items-center gap-2 px-4 border-b border-border bg-card">
        <div className="w-32">
          <Select
            value={activeRequest.method}
            onChange={(e) => updateRequest({ method: e.target.value as any })}
            className={cn("font-bold h-9", getMethodColor(activeRequest.method))}
          >
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map((m) => (
              <option key={m} value={m} className="bg-popover text-popover-foreground">
                {m}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex-1">
          <Input
            type="text"
            value={activeRequest.url}
            onChange={(e) => updateRequest({ url: e.target.value })}
            placeholder="https://api.example.com/v1/resource"
            className="h-9"
          />
        </div>

        <Button 
          onClick={handleSend} 
          disabled={isLoading || !activeRequest.url}
          className="h-9 px-6 font-semibold shadow-none border border-primary/20 hover:border-primary/50"
        >
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send
            </>
          )}
        </Button>
      </div>


      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 min-h-0 flex flex-col">

        <div className="shrink-0 border-b border-border px-4 bg-muted/20">
          <TabsList>
            <TabsTrigger value="params">Params</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
          </TabsList>
        </div>


        <div className="flex-1 min-h-0">

          <TabsContent value="params" className="h-full">
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Query Parameters</h3>
                  <Button variant="ghost" size="sm" onClick={() => addKeyValuePair('queryParams')} className="h-8">
                    <Plus className="h-4 w-4 mr-1" /> Add Param
                  </Button>
                </div>
                {activeRequest.queryParams.map((param: KeyValuePair, index: number) => (
                  <div key={param.id} className="flex gap-2 items-center group">
                    <Checkbox
                      checked={param.enabled}
                      onCheckedChange={(checked) => updateKeyValuePair('queryParams', index, { enabled: !!checked })}
                    />
                    <Input
                      placeholder="Key"
                      value={param.key}
                      onChange={(e) => updateKeyValuePair('queryParams', index, { key: e.target.value })}
                    />
                    <Input
                      placeholder="Value"
                      value={param.value}
                      onChange={(e) => updateKeyValuePair('queryParams', index, { value: e.target.value })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeKeyValuePair('queryParams', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {activeRequest.queryParams.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                    No query parameters used
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>


          <TabsContent value="headers" className="h-full">
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">HTTP Headers</h3>
                  <Button variant="ghost" size="sm" onClick={() => addKeyValuePair('headers')} className="h-8">
                    <Plus className="h-4 w-4 mr-1" /> Add Header
                  </Button>
                </div>
                {activeRequest.headers.map((header: KeyValuePair, index: number) => (
                  <div key={header.id} className="flex gap-2 items-center group">
                    <Checkbox
                      checked={header.enabled}
                      onCheckedChange={(checked) => updateKeyValuePair('headers', index, { enabled: !!checked })}
                    />
                    <Input
                      placeholder="Key"
                      value={header.key}
                      onChange={(e) => updateKeyValuePair('headers', index, { key: e.target.value })}
                    />
                    <Input
                      placeholder="Value"
                      value={header.value}
                      onChange={(e) => updateKeyValuePair('headers', index, { value: e.target.value })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeKeyValuePair('headers', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {activeRequest.headers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                    No custom headers
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>


          <TabsContent value="auth" className="h-full">
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-6 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="auth-type">Authentication Type</Label>
                  <Select
                    id="auth-type"
                    value={activeRequest.auth.type}
                    onChange={(e) => updateRequest({ auth: { ...activeRequest.auth, type: e.target.value as any } })}
                  >
                    <option value="none" className="bg-popover text-popover-foreground">No Authentication</option>
                    <option value="bearer" className="bg-popover text-popover-foreground">Bearer Token</option>
                    <option value="basic" className="bg-popover text-popover-foreground">Basic Auth</option>
                    <option value="api-key" className="bg-popover text-popover-foreground">API Key</option>
                  </Select>
                </div>

                {activeRequest.auth.type === 'bearer' && (
                  <div className="space-y-2">
                    <Label htmlFor="auth-token">Token</Label>
                    <Input
                      id="auth-token"
                      type="text"
                      placeholder="e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={activeRequest.auth.token || ''}
                      onChange={(e) => updateRequest({ auth: { ...activeRequest.auth, token: e.target.value } })}
                    />
                  </div>
                )}
                {activeRequest.auth.type === 'basic' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="auth-username">Username</Label>
                      <Input
                        id="auth-username"
                        type="text"
                        value={activeRequest.auth.username || ''}
                        onChange={(e) => updateRequest({ auth: { ...activeRequest.auth, username: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="auth-password">Password</Label>
                      <Input
                        id="auth-password"
                        type="password"
                        value={activeRequest.auth.password || ''}
                        onChange={(e) => updateRequest({ auth: { ...activeRequest.auth, password: e.target.value } })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>


          <TabsContent value="body" className="h-full flex flex-col">

            <div className="shrink-0 flex items-center gap-4 px-4 py-[11px] text-sm border-b border-border">
              <div className="flex items-center gap-2">
                <input
                  id="body-none"
                  type="radio"
                  className="text-primary focus:ring-primary/20 bg-muted border-border"
                  checked={activeRequest.body.type === 'none'}
                  onChange={() => updateRequest({ body: { type: 'none', content: '' } })}
                />
                <Label htmlFor="body-none" className="cursor-pointer">None</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="body-json"
                  type="radio"
                  className="text-primary focus:ring-primary/20 bg-muted border-border"
                  checked={activeRequest.body.type === 'json'}
                  onChange={() => updateRequest({ body: { type: 'json', content: activeRequest.body.content || '' } })}
                />
                <Label htmlFor="body-json" className="cursor-pointer">JSON</Label>
              </div>
            </div>


            <div className="flex-1 min-h-0 p-4">
              {activeRequest.body.type === 'json' ? (
                <CodeEditor
                  value={activeRequest.body.content}
                  onChange={(value) => updateRequest({ body: { ...activeRequest.body, content: value } })}
                  language="json"
                  className="h-full"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg bg-muted/5">
                  This request has no body
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
