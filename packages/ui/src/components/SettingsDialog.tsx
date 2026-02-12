'use client';

import { useEffect, useState } from 'react';
import { Settings, Moon, Sun, Monitor, Type, Globe } from 'lucide-react';
import { useSettingsStore } from '@vessel/core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';
import { Label } from './Label';
import { Switch } from './Switch';
import { Select } from './Select';
import { Input } from './Input';
import { Button, buttonVariants } from './Button';
import { Separator } from './Separator';
import { ConfirmDialog } from './ConfirmDialog';

export function SettingsDialog() {
  const {
    theme,
    setTheme,
    editorFontSize,
    setEditorFontSize,
    preferredClientMode,
    setPreferredClientMode,
    defaultTimeout,
    setDefaultTimeout,
    followRedirects,
    setFollowRedirects,
    wordWrap,
    setWordWrap,
    lineNumbers,
    setLineNumbers,
    formatOnPaste,
    setFormatOnPaste,
    autoSave,
    setAutoSave,
    resetToDefaults,
  } = useSettingsStore();

  const [open, setOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Apply theme effect
  useEffect(() => {
    const root = globalThis.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = globalThis.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const handleReset = () => {
      setShowResetConfirm(true);
  };
  
  const confirmReset = () => {
    resetToDefaults();
    setShowResetConfirm(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: 'ghost', size: 'icon' })} title="Settings">
          <Settings className="h-5 w-5" />
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-2 py-2 border-b border-border shrink-0">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-2 py-2 border-b border-border bg-muted/30 shrink-0">
            <TabsList className="bg-transparent p-0 gap-2">
              <TabsTrigger value="general" className="data-[state=active]:bg-background">
                <Monitor className="h-4 w-4 mr-2" /> General
              </TabsTrigger>
              <TabsTrigger value="editor" className="data-[state=active]:bg-background">
                <Type className="h-4 w-4 mr-2" /> Editor
              </TabsTrigger>
              <TabsTrigger value="network" className="data-[state=active]:bg-background">
                <Globe className="h-4 w-4 mr-2" /> Network
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {/* General Settings */}
            <TabsContent value="general" className="space-y-2 mt-0">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Appearance</h3>
                
                <div className="grid gap-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground ${
                        theme === 'light' ? 'border-primary' : ''
                      }`}
                    >
                      <Sun className="mb-3 h-4 w-4" />
                      <span className="text-xs">Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground ${
                        theme === 'dark' ? 'border-primary' : ''
                      }`}
                    >
                      <Moon className="mb-3 h-4 w-4" />
                      <span className="text-xs">Dark</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground ${
                        theme === 'system' ? 'border-primary' : ''
                      }`}
                    >
                      <Monitor className="mb-3 h-4 w-4" />
                      <span className="text-xs">System</span>
                    </button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Application</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Save</Label>
                    <p className="text-xs text-muted-foreground">Automatically save changes to collections</p>
                  </div>
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                </div>
              </div>
            </TabsContent>

            {/* Editor Settings */}
            <TabsContent value="editor" className="space-y-2 mt-0">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Display</h3>
                
                <div className="grid gap-2">
                  <Label>Font Size</Label>
                  <Select
                    value={editorFontSize}
                    onChange={(e) => setEditorFontSize(Number(e.target.value) as any)}
                  >
                    <option value="12">12px</option>
                    <option value="14">14px</option>
                    <option value="16">16px</option>
                    <option value="18">18px</option>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Word Wrap</Label>
                    <p className="text-xs text-muted-foreground">Wrap long lines in the editor</p>
                  </div>
                  <Switch checked={wordWrap} onCheckedChange={setWordWrap} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Line Numbers</Label>
                    <p className="text-xs text-muted-foreground">Show line numbers in the gutter</p>
                  </div>
                  <Switch checked={lineNumbers} onCheckedChange={setLineNumbers} />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Behavior</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Format on Paste</Label>
                    <p className="text-xs text-muted-foreground">Automatically format JSON content on paste</p>
                  </div>
                  <Switch checked={formatOnPaste} onCheckedChange={setFormatOnPaste} />
                </div>
              </div>
            </TabsContent>

            {/* Network Settings */}
            <TabsContent value="network" className="space-y-2 mt-0">
               <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Client</h3>
                
                <div className="grid gap-2">
                  <Label>Preferred Client Mode</Label>
                  <Select
                    value={preferredClientMode}
                    onChange={(e) => setPreferredClientMode(e.target.value as any)}
                  >
                    <option value="auto">Auto (Detect)</option>
                    <option value="tauri">Tauri (Native)</option>
                    <option value="web">Web (Browser)</option>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Native client allows unrestricted requests but requires the desktop app.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Default Timeout (ms)</Label>
                  <Input 
                    type="number" 
                    value={defaultTimeout} 
                    onChange={(e) => setDefaultTimeout(Number(e.target.value))}
                    min={0}
                  />
                </div>

                 <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Follow Redirects</Label>
                    <p className="text-xs text-muted-foreground">Automatically follow 3xx redirects</p>
                  </div>
                  <Switch checked={followRedirects} onCheckedChange={setFollowRedirects} />
                </div>
              </div>
            </TabsContent>
          </div>
          
          <div className="p-2 border-t border-border bg-muted/10 shrink-0 flex justify-end">
             <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleReset}>
                Reset to Defaults
             </Button>
          </div>
        </Tabs>
      </DialogContent>
      
      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Reset Settings?"
        description="Are you sure you want to reset all settings to their default values? This action cannot be undone."
        confirmLabel="Reset"
        variant="danger"
        onConfirm={confirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </Dialog>
  );
}
