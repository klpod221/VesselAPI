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
} from 'lucide-react';
import {
  useCollectionStore,
  type Collection,
  type CollectionFolder,
  type ApiRequest,
} from '@vessel/core';
import { cn } from '../lib/utils';
import { Button } from './Button';
import { ScrollArea } from './ScrollArea';
import { Input } from './Input';
import { ConfirmDialog } from './ConfirmDialog';

interface CollectionSidebarProps {
  readonly className?: string;
  readonly onRequestSelect?: (request: ApiRequest) => void;
}

// Type for delete confirmation state
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
    deleteRequestFromCollection,
    setActiveCollection,
  } = useCollectionStore();

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

  // Collection handlers
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

  // Delete confirmation handlers
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
    onRequestSelect?.(newRequest);
  }, [addRequestToCollection, closeMenu, onRequestSelect]);

  // Close menu when clicking outside
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

  // Get delete dialog content based on type
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

  return (
    <>
      <div className={cn('flex flex-col h-full bg-card border-r border-border', className)}>
        {/* Header */}
        <div className="shrink-0 h-12 px-3 flex items-center justify-between border-b border-border">
          <span className="font-semibold text-sm">Collections</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNewCollection} title="New Collection">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Tree View */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {collections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <p>No collections yet</p>
                <Button variant="link" size="sm" className="mt-2" onClick={handleNewCollection}>
                  Create your first collection
                </Button>
              </div>
            ) : (
              collections.map((collection) => (
                <TreeItem
                  key={collection.id}
                  type="collection"
                  id={collection.id}
                  name={collection.name}
                  collectionId={collection.id}
                  isExpanded={expandedIds.has(collection.id)}
                  isEditing={editingId === collection.id}
                  isMenuOpen={menuOpenId === collection.id}
                  onToggle={() => toggleExpand(collection.id)}
                  onToggleMenu={(e) => toggleMenu(collection.id, e)}
                  onStartEdit={() => startEdit(collection.id)}
                  onFinishEdit={(name) => handleRenameCollection(collection.id, name)}
                  onCancelEdit={cancelEdit}
                  onDelete={() => openDeleteConfirm('collection', collection.id, collection.id, collection.name)}
                  onAddFolder={() => handleAddFolder(collection.id)}
                  onAddRequest={() => handleAddRequest(collection.id)}
                >
                  {/* Folders */}
                  {collection.folders.map((folder) => (
                    <TreeItem
                      key={folder.id}
                      type="folder"
                      id={folder.id}
                      name={folder.name}
                      collectionId={collection.id}
                      isExpanded={expandedIds.has(folder.id)}
                      isEditing={editingId === folder.id}
                      isMenuOpen={menuOpenId === folder.id}
                      onToggle={() => toggleExpand(folder.id)}
                      onToggleMenu={(e) => toggleMenu(folder.id, e)}
                      onStartEdit={() => startEdit(folder.id)}
                      onFinishEdit={() => cancelEdit()}
                      onCancelEdit={cancelEdit}
                      onDelete={() => openDeleteConfirm('folder', folder.id, collection.id, folder.name)}
                      onAddFolder={() => handleAddFolder(collection.id, folder.id)}
                      onAddRequest={() => handleAddRequest(collection.id, folder.id)}
                    >
                      {/* Nested folders */}
                      {folder.folders.map((subFolder) => (
                        <TreeItem
                          key={subFolder.id}
                          type="folder"
                          id={subFolder.id}
                          name={subFolder.name}
                          collectionId={collection.id}
                          isExpanded={expandedIds.has(subFolder.id)}
                          isEditing={editingId === subFolder.id}
                          isMenuOpen={menuOpenId === subFolder.id}
                          onToggle={() => toggleExpand(subFolder.id)}
                          onToggleMenu={(e) => toggleMenu(subFolder.id, e)}
                          onStartEdit={() => startEdit(subFolder.id)}
                          onFinishEdit={() => cancelEdit()}
                          onCancelEdit={cancelEdit}
                          onDelete={() => openDeleteConfirm('folder', subFolder.id, collection.id, subFolder.name)}
                          onAddFolder={() => handleAddFolder(collection.id, subFolder.id)}
                          onAddRequest={() => handleAddRequest(collection.id, subFolder.id)}
                        >
                          {subFolder.requests.map((req) => (
                            <RequestItem
                              key={req.id}
                              request={req}
                              isMenuOpen={menuOpenId === req.id}
                              onSelect={() => onRequestSelect?.(req)}
                              onToggleMenu={(e) => toggleMenu(req.id, e)}
                              onDelete={() => openDeleteConfirm('request', req.id, collection.id, req.name)}
                            />
                          ))}
                        </TreeItem>
                      ))}
                      {/* Requests in folder */}
                      {folder.requests.map((req) => (
                        <RequestItem
                          key={req.id}
                          request={req}
                          isMenuOpen={menuOpenId === req.id}
                          onSelect={() => onRequestSelect?.(req)}
                          onToggleMenu={(e) => toggleMenu(req.id, e)}
                          onDelete={() => openDeleteConfirm('request', req.id, collection.id, req.name)}
                        />
                      ))}
                    </TreeItem>
                  ))}
                  {/* Root requests */}
                  {collection.requests.map((req) => (
                    <RequestItem
                      key={req.id}
                      request={req}
                      isMenuOpen={menuOpenId === req.id}
                      onSelect={() => onRequestSelect?.(req)}
                      onToggleMenu={(e) => toggleMenu(req.id, e)}
                      onDelete={() => openDeleteConfirm('request', req.id, collection.id, req.name)}
                    />
                  ))}
                  {collection.folders.length === 0 && collection.requests.length === 0 && (
                    <p className="text-xs text-muted-foreground px-2 py-1 ml-4">Empty collection</p>
                  )}
                </TreeItem>
              ))
            )}
          </div>
        </ScrollArea>
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
    </>
  );
}

// --- TreeItem Component ---

interface TreeItemProps {
  readonly type: 'collection' | 'folder';
  readonly id: string;
  readonly name: string;
  readonly collectionId: string;
  readonly isExpanded: boolean;
  readonly isEditing: boolean;
  readonly isMenuOpen: boolean;
  readonly children?: React.ReactNode;
  readonly onToggle: () => void;
  readonly onToggleMenu: (e: React.MouseEvent) => void;
  readonly onStartEdit: () => void;
  readonly onFinishEdit: (name: string) => void;
  readonly onCancelEdit: () => void;
  readonly onDelete: () => void;
  readonly onAddFolder: () => void;
  readonly onAddRequest: () => void;
}

function TreeItem({
  type,
  name,
  isExpanded,
  isEditing,
  isMenuOpen,
  children,
  onToggle,
  onToggleMenu,
  onStartEdit,
  onFinishEdit,
  onCancelEdit,
  onDelete,
  onAddFolder,
  onAddRequest,
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
      onFinishEdit(editValue);
    } else if (e.key === 'Escape') {
      setEditValue(name);
      onCancelEdit();
    }
  };

  const isCollection = type === 'collection';
  const IconComponent = isCollection ? Folder : isExpanded ? FolderOpen : Folder;
  const iconColor = isCollection ? 'text-primary' : 'text-muted-foreground';

  return (
    <div className="mb-0.5">
      <div
        role="button"
        tabIndex={0}
        className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer group relative"
        onClick={isEditing ? undefined : onToggle}
        onKeyDown={(e) => e.key === 'Enter' && !isEditing && onToggle()}
      >
        <ChevronRight
          className={cn('h-4 w-4 text-muted-foreground transition-transform shrink-0', isExpanded && 'rotate-90')}
        />
        <IconComponent className={cn('h-4 w-4 shrink-0', iconColor)} />

        {isEditing ? (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => onFinishEdit(editValue)}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm py-0 px-1 flex-1"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-sm truncate flex-1">{name}</span>
        )}

        <button
          className="h-6 w-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-muted"
          onClick={onToggleMenu}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div
            className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[140px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2" onClick={onAddRequest}>
              <FilePlus className="h-4 w-4" /> Add Request
            </button>
            <button className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2" onClick={onAddFolder}>
              <FolderPlus className="h-4 w-4" /> Add Folder
            </button>
            <div className="border-t border-border my-1" />
            <button className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2" onClick={onStartEdit}>
              <Pencil className="h-4 w-4" /> Rename
            </button>
            <button className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2 text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && children && <div className="ml-4 border-l border-border/50 pl-2">{children}</div>}
    </div>
  );
}

// --- RequestItem Component ---

interface RequestItemProps {
  readonly request: ApiRequest;
  readonly isMenuOpen: boolean;
  readonly onSelect: () => void;
  readonly onToggleMenu: (e: React.MouseEvent) => void;
  readonly onDelete: () => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-green-500',
  POST: 'text-yellow-500',
  PUT: 'text-blue-500',
  PATCH: 'text-purple-500',
  DELETE: 'text-red-500',
};

function RequestItem({ request, isMenuOpen, onSelect, onToggleMenu, onDelete }: RequestItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted/50 cursor-pointer group relative"
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <FileJson className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className={cn('text-xs font-mono shrink-0', METHOD_COLORS[request.method] || 'text-foreground')}>
        {request.method.substring(0, 3)}
      </span>
      <span className="text-sm truncate flex-1">{request.name}</span>

      <button
        className="h-6 w-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-muted"
        onClick={onToggleMenu}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      {isMenuOpen && (
        <div
          className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[100px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2 text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
