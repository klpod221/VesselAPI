'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus,
  FileJson,
  FilePlus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
} from 'lucide-react';
import {
  useCollectionStore,
  useRequestStore,
  type Collection,
  type CollectionFolder,
  type ApiRequest,
  useAuthStore,
} from '@vessel/core';
import { cn, getMethodColor } from '../lib/utils';
import { Button } from './Button';
import { ScrollArea } from './ScrollArea';
import { Input } from './Input';
import { ConfirmDialog } from './ConfirmDialog';
import { AuthDialog } from './AuthDialog';

interface CollectionSidebarProps {
  readonly className?: string;
  readonly onRequestSelect?: (request: ApiRequest, collectionId: string) => void;
}

interface DeleteConfirmState {
  isOpen: boolean;
  type: 'collection' | 'folder' | 'request';
  id: string;
  collectionId: string;
  name: string;
}

const initialDeleteState: DeleteConfirmState = {
  isOpen: false,
  type: 'collection',
  id: '',
  collectionId: '',
  name: '',
};

/**
 * Sidebar component for managing API collections.
 * Displays a tree view of collections, folders, and requests.
 */
export function CollectionSidebar({ className, onRequestSelect }: CollectionSidebarProps) {
  const {
    collections,
    addCollection,
    updateCollection,
    deleteCollection,
    addFolder,
    deleteFolder,
    addRequestToCollection,
    updateRequestInCollection,
    deleteRequestFromCollection,
    setActiveCollection,
    toggleSync,
    isLoading,
  } = useCollectionStore();

  const { isAuthenticated, user, logout } = useAuthStore();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const activeRequestId = useRequestStore((s) => s.activeRequest?.id);
  const isDirty = useRequestStore((s) => s.isDirty);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>(initialDeleteState);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const closeMenu = useCallback(() => setMenuOpenId(null), []);
  const startEdit = useCallback((id: string) => {
    setEditingId(id);
    setMenuOpenId(null);
  }, []);
  const cancelEdit = useCallback(() => setEditingId(null), []);

  const handleNewCollection = useCallback(() => {
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      name: 'New Collection',
      version: '1.0.0',
      requests: [],
      folders: [],
      variables: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isSynced: false,
    };
    addCollection(newCollection);
    setActiveCollection(newCollection.id);
    setExpandedIds((prev) => new Set(prev).add(newCollection.id));
    setEditingId(newCollection.id);
  }, [addCollection, setActiveCollection]);

  const handleRenameCollection = useCallback((id: string, newName: string) => {
    if (newName.trim()) {
      updateCollection(id, { name: newName.trim(), updatedAt: Date.now() });
    }
    setEditingId(null);
  }, [updateCollection]);

  const handleRenameRequest = useCallback((collectionId: string, requestId: string, newName: string) => {
    if (newName.trim()) {
      updateRequestInCollection(collectionId, requestId, { name: newName.trim(), updatedAt: Date.now() });
    }
    setEditingId(null);
  }, [updateRequestInCollection]);

  const openDeleteConfirm = useCallback((
    type: 'collection' | 'folder' | 'request',
    id: string,
    collectionId: string,
    name: string
  ) => {
    setDeleteConfirm({ isOpen: true, type, id, collectionId, name });
    closeMenu();
  }, [closeMenu]);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirm(initialDeleteState);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    const { type, id, collectionId } = deleteConfirm;
    if (type === 'collection') {
      deleteCollection(id);
    } else if (type === 'folder') {
      deleteFolder(collectionId, id);
    } else if (type === 'request') {
      deleteRequestFromCollection(collectionId, id);
    }
    closeDeleteConfirm();
  }, [deleteConfirm, deleteCollection, deleteFolder, deleteRequestFromCollection, closeDeleteConfirm]);

  const handleAddFolder = useCallback((collectionId: string, parentFolderId: string | null = null) => {
    const newFolder: CollectionFolder = {
      id: crypto.randomUUID(),
      name: 'New Folder',
      requests: [],
      folders: [],
    };
    addFolder(collectionId, parentFolderId, newFolder);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(collectionId);
      if (parentFolderId) next.add(parentFolderId);
      return next;
    });
    closeMenu();
    setEditingId(newFolder.id);
  }, [addFolder, closeMenu]);

  const handleAddRequest = useCallback((collectionId: string, folderId: string | null = null) => {
    const newRequest: ApiRequest = {
      id: crypto.randomUUID(),
      name: 'New Request',
      method: 'GET',
      url: '',
      headers: [],
      queryParams: [],
      body: { type: 'none', content: '' },
      auth: { type: 'none' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addRequestToCollection(collectionId, folderId, newRequest);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(collectionId);
      if (folderId) next.add(folderId);
      return next;
    });
    closeMenu();
    onRequestSelect?.(newRequest, collectionId);
    setEditingId(newRequest.id);
  }, [addRequestToCollection, closeMenu, onRequestSelect]);

  const handleToggleSync = useCallback((collection: Collection) => {
     if (!isAuthenticated) {
         setAuthDialogOpen(true);
         return;
     }
     
     toggleSync(collection.id);
     closeMenu();
  }, [isAuthenticated, toggleSync, closeMenu]);

  const hasHydrated = useCollectionStore((s) => s.hasHydrated);

  useEffect(() => {
    if (isAuthenticated && hasHydrated) {
      useCollectionStore.getState().fetchRemoteCollections();
    }
  }, [isAuthenticated, hasHydrated]);

  useEffect(() => {
    if (menuOpenId) {
      const handleClick = () => setMenuOpenId(null);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [menuOpenId]);

  const toggleMenu = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId((prev) => (prev === id ? null : id));
  }, []);

  const getDeleteDialogContent = () => {
    const { type, name } = deleteConfirm;
    switch (type) {
      case 'collection':
        return {
          title: 'Delete Collection',
          description: `Are you sure you want to delete "${name}"? This will permanently delete all folders and requests inside.`,
        };
      case 'folder':
        return {
          title: 'Delete Folder',
          description: `Are you sure you want to delete "${name}"? All requests inside will also be deleted.`,
        };
      case 'request':
        return {
          title: 'Delete Request',
          description: `Are you sure you want to delete "${name}"?`,
        };
    }
  };

  const dialogContent = getDeleteDialogContent();

  /**
   * Renders requests for a given folder or collection context.
   * Extracted to reduce nesting depth in the JSX tree.
   */
  const renderRequests = (requests: ApiRequest[], collectionId: string) =>
    requests.map((req) => (
      <RequestItem
        key={req.id}
        request={req}
        isActive={activeRequestId === req.id}
        isDirty={activeRequestId === req.id && isDirty}
        isMenuOpen={menuOpenId === req.id}
        isEditing={editingId === req.id}
        onSelect={() => onRequestSelect?.(req, collectionId)}
        onToggleMenu={(e) => toggleMenu(req.id, e)}
        onStartEdit={() => startEdit(req.id)}
        onFinishEdit={(name) => handleRenameRequest(collectionId, req.id, name)}
        onCancelEdit={cancelEdit}
        onDelete={() => openDeleteConfirm('request', req.id, collectionId, req.name)}
      />
    ));

  /**
   * Renders subfolder tree items. Extracted from the main render
   * to keep nesting depth below the SonarQube 4-level threshold.
   */
  const renderSubFolders = (folders: CollectionFolder[], collectionId: string) =>
    folders.map((subFolder) => (
      <TreeItem
        key={subFolder.id}
        id={subFolder.id}
        type="folder"
        name={subFolder.name}
        isExpanded={expandedIds.has(subFolder.id)}
        isEditing={editingId === subFolder.id}
        isMenuOpen={menuOpenId === subFolder.id}
        onToggle={toggleExpand}
        onToggleMenu={toggleMenu}
        onStartEdit={startEdit}
        onFinishEdit={(_id, _name) => cancelEdit()}
        onCancelEdit={cancelEdit}
        onDelete={(id, name, type) => openDeleteConfirm(type, id, collectionId, name)}
        onAddFolder={(id) => handleAddFolder(collectionId, id)}
        onAddRequest={(id) => handleAddRequest(collectionId, id)}
      >
        {renderSubFolders(subFolder.folders, collectionId)}
        {renderRequests(subFolder.requests, collectionId)}
      </TreeItem>
    ));

  return (
    <>
      <div className={cn('flex flex-col h-full bg-card border-r border-border', className)}>
        {/* Header */}
        <div className="shrink-0 h-14 px-3 flex items-center justify-between border-b border-border">
          <span className="font-semibold text-sm">Collections</span>
          <div className="flex items-center gap-1">
             {!isAuthenticated && (
               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAuthDialogOpen(true)} title="Login">
                 <LogIn className="h-4 w-4" />
               </Button>
             )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNewCollection} title="New Collection">
                <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tree View */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {(() => {
              if (isLoading || !hasHydrated) {
                return (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col gap-2 p-2">
                         <div className="h-2 w-full bg-muted/40 animate-pulse rounded" />
                         <div className="ml-2 h-5 w-3/4 bg-muted/30 animate-pulse rounded" />
                         <div className="ml-2 h-5 w-1/2 bg-muted/30 animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                );
              }

              if (collections.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <p>No collections yet</p>
                    <Button variant="link" size="sm" className="mt-2" onClick={handleNewCollection}>
                      Create your first collection
                    </Button>
                  </div>
                );
              }

              return collections.map((collection) => (
                <TreeItem
                  key={collection.id}
                  id={collection.id}
                  type="collection"
                  name={collection.name}
                  isExpanded={expandedIds.has(collection.id)}
                  isEditing={editingId === collection.id}
                  isMenuOpen={menuOpenId === collection.id}
                  isSynced={collection.isSynced}
                  collection={collection}
                  onToggle={toggleExpand}
                  onToggleMenu={toggleMenu}
                  onStartEdit={startEdit}
                  onFinishEdit={handleRenameCollection}
                  onCancelEdit={cancelEdit}
                  onDelete={(id, name, type) => openDeleteConfirm(type, id, id, name)}
                  onAddFolder={() => handleAddFolder(collection.id)}
                  onAddRequest={() => handleAddRequest(collection.id)}
                  onToggleSync={handleToggleSync}
                >
                  {/* Folders */}
                  {renderSubFolders(collection.folders, collection.id)}
                  {/* Root requests */}
                  {renderRequests(collection.requests, collection.id)}
                  {collection.folders.length === 0 && collection.requests.length === 0 && (
                    <p className="text-xs text-muted-foreground px-2 py-1 ml-2">Empty collection</p>
                  )}
                </TreeItem>
              ));
            })()}
          </div>
        </ScrollArea>
        
        {/* Footer with User info if logged in */}
        {isAuthenticated && (
            <div className="p-2 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <span className="text-xs truncate">{user?.email}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-4 w-4" onClick={logout} title="Logout">
                    <span className="sr-only">Logout</span>
                    <LogOut className="h-3 w-3" />
                </Button>
            </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onOpenChange={(open) => !open && closeDeleteConfirm()}
        title={dialogContent.title}
        description={dialogContent.description}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteConfirm}
      />
      
      {/* Auth Dialog */}
      <AuthDialog isOpen={authDialogOpen} onClose={() => setAuthDialogOpen(false)} />
    </>
  );
}

// --- TreeItem Component ---
interface TreeItemProps {
  readonly id: string;
  readonly type: 'collection' | 'folder';
  readonly name: string;
  readonly isExpanded: boolean;
  readonly isEditing: boolean;
  readonly isMenuOpen: boolean;
  readonly isSynced?: boolean;
  readonly children?: React.ReactNode;
  readonly onToggle: (id: string) => void;
  readonly onToggleMenu: (id: string, e: React.MouseEvent) => void;
  readonly onStartEdit: (id: string) => void;
  readonly onFinishEdit: (id: string, name: string) => void;
  readonly onCancelEdit: () => void;
  readonly onDelete: (id: string, name: string, type: 'collection' | 'folder') => void;
  readonly onAddFolder: (id: string) => void;
  readonly onAddRequest: (id: string) => void;
  readonly onToggleSync?: (collection: Collection) => void; // Keep as is for now or update
  readonly collection?: Collection; // Pass collection for sync toggle?
}

function TreeItem({
  id,
  type,
  name,
  isExpanded,
  isEditing,
  isMenuOpen,
  isSynced,
  children,
  onToggle,
  onToggleMenu,
  onStartEdit,
  onFinishEdit,
  onCancelEdit,
  onDelete,
  onAddFolder,
  onAddRequest,
  onToggleSync,
  collection
}: TreeItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editValue, setEditValue] = useState(name);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(name);
  }, [name]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onFinishEdit(id, editValue);
    } else if (e.key === 'Escape') {
      setEditValue(name);
      onCancelEdit();
    }
  };

  const isCollection = type === 'collection';
  const FolderIcon = isExpanded ? FolderOpen : Folder;
  const IconComponent = isCollection ? Folder : FolderIcon;
  const iconColor = isCollection ? 'text-primary' : 'text-muted-foreground';

  return (
    <div className="mb-0.5">
      <button
        type="button"
        className="w-full flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer group relative text-left bg-transparent border-0"
        onClick={isEditing ? undefined : () => onToggle(id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (!isEditing) onToggle(id);
          }
        }}
      >
        <ChevronRight
          className={cn('h-4 w-4 text-muted-foreground transition-transform shrink-0', isExpanded && 'rotate-90')}
        />
        <div className="relative">
             <IconComponent className={cn('h-4 w-4 shrink-0', iconColor)} />
             {isSynced && (
                 <div className="absolute -bottom-1 -right-1 bg-background rounded-full">
                     <Cloud className="h-3 w-3 text-sky-500" />
                 </div>
             )}
        </div>

        {isEditing ? (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => onFinishEdit(id, editValue)}
            onKeyDown={handleKeyDown}
            className="h-2 text-sm py-0 px-1 flex-1 z-10"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-sm truncate flex-1">{name}</span>
        )}
      </button>

        <button
          type="button"
          className="absolute right-1 top-1.5 h-4 w-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-muted bg-transparent border-0"
          onClick={(e) => onToggleMenu(id, e)}
          onKeyDown={(e) => {
             if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleMenu(id, e as unknown as React.MouseEvent);
             }
          }}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div
            role="menu"
            tabIndex={-1}
            className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md py-1 min-w-[140px]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && onToggleMenu(id, e as unknown as React.MouseEvent)}
          >
            <button type="button" className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2" onClick={() => onAddRequest(id)}>
              <FilePlus className="h-4 w-4" /> Add Request
            </button>
            <button type="button" className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2" onClick={() => onAddFolder(id)}>
              <FolderPlus className="h-4 w-4" /> Add Folder
            </button>
            <div className="border-t border-border my-1" />
            {isCollection && onToggleSync && collection && (
                <>
                    <button type="button" className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2" onClick={() => onToggleSync(collection)}>
                    {isSynced ? (
                        <><CloudOff className="h-4 w-4" /> Disable Sync</>
                    ) : (
                        <><Cloud className="h-4 w-4" /> Enable Sync</>
                    )}
                    </button>
                    <div className="border-t border-border my-1" />
                </>
            )}
            <button type="button" className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2" onClick={() => onStartEdit(id)}>
              <Pencil className="h-4 w-4" /> Rename
            </button>
            <button type="button" className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2 text-destructive" onClick={() => onDelete(id, name, type)}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        )}

      {/* Children */}
      {isExpanded && children && <div className="ml-2 border-l border-border/50 pl-2">{children}</div>}
    </div>
  );
}

// --- RequestItem Component ---

interface RequestItemProps {
  readonly request: ApiRequest;
  readonly isActive: boolean;
  readonly isDirty: boolean;
  readonly isMenuOpen: boolean;
  readonly isEditing: boolean;
  readonly onSelect: () => void;
  readonly onToggleMenu: (e: React.MouseEvent) => void;
  readonly onStartEdit: () => void;
  readonly onFinishEdit: (name: string) => void;
  readonly onCancelEdit: () => void;
  readonly onDelete: () => void;
}

function RequestItem({
  request, isActive, isDirty, isMenuOpen, isEditing, onSelect, onToggleMenu, onStartEdit, onFinishEdit, onCancelEdit, onDelete,
}: RequestItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onFinishEdit((e.target as HTMLInputElement).value);
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  return (
    <div className="relative group">
    <button
      type="button"
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer text-left bg-transparent border-0',
        isActive ? 'bg-muted text-foreground' : 'hover:bg-muted/50',
      )}
      onClick={() => !isEditing && onSelect()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (!isEditing) onSelect();
        }
      }}
    >
      <div className="relative shrink-0">
        <FileJson className="h-3.5 w-3.5 text-muted-foreground" />
        {isDirty && (
          <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary" title="Unsaved changes" />
        )}
      </div>
      <span className={cn('text-xs mt-1 font-mono shrink-0', getMethodColor(request.method))}>
        {request.method.substring(0, 3)}
      </span>

      {isEditing ? (
        <Input
          ref={inputRef}
          defaultValue={request.name}
          className="h-5 text-sm px-1 py-0 flex-1 z-10"
          onBlur={(e) => onFinishEdit(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="text-sm truncate flex-1">{request.name}</span>
      )}
    </button>

      {!isEditing && (
        <button
          type="button"
          className="absolute right-1 top-1 h-4 w-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-muted bg-transparent border-0"
          onClick={onToggleMenu}
          onKeyDown={(e) => {
             if (e.key === 'Enter' || e.key === ' ') {
                 e.preventDefault();
                 onToggleMenu(e as unknown as React.MouseEvent);
             }
          }}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      )}

      {isMenuOpen && (
        <div
          role="menu"
          tabIndex={-1}
          className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md py-1 min-w-[120px]"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.key === 'Escape' && onToggleMenu(e as unknown as React.MouseEvent)}
        >
          <button type="button" className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2" onClick={onStartEdit}>
            <Pencil className="h-4 w-4" /> Rename
          </button>
          <button type="button" className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2 text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
