'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, ChevronRight, Folder, FolderOpen, FolderPlus, FileJson, FilePlus, MoreHorizontal, Pencil, Trash2, } from 'lucide-react';
import { useCollectionStore, useRequestStore, } from '@vessel/core';
import { cn, getMethodColor } from '../lib/utils';
import { Button } from './Button';
import { ScrollArea } from './ScrollArea';
import { Input } from './Input';
import { ConfirmDialog } from './ConfirmDialog';
const initialDeleteState = {
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
export function CollectionSidebar({ className, onRequestSelect }) {
    const { collections, addCollection, updateCollection, deleteCollection, addFolder, deleteFolder, addRequestToCollection, updateRequestInCollection, deleteRequestFromCollection, setActiveCollection, } = useCollectionStore();
    const activeRequestId = useRequestStore((s) => s.activeRequest?.id);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [editingId, setEditingId] = useState(null);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(initialDeleteState);
    const toggleExpand = useCallback((id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            }
            else {
                next.add(id);
            }
            return next;
        });
    }, []);
    const closeMenu = useCallback(() => setMenuOpenId(null), []);
    const startEdit = useCallback((id) => {
        setEditingId(id);
        setMenuOpenId(null);
    }, []);
    const cancelEdit = useCallback(() => setEditingId(null), []);
    const handleNewCollection = useCallback(() => {
        const newCollection = {
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
    const handleRenameCollection = useCallback((id, newName) => {
        if (newName.trim()) {
            updateCollection(id, { name: newName.trim(), updatedAt: Date.now() });
        }
        setEditingId(null);
    }, [updateCollection]);
    const handleRenameRequest = useCallback((collectionId, requestId, newName) => {
        if (newName.trim()) {
            updateRequestInCollection(collectionId, requestId, { name: newName.trim(), updatedAt: Date.now() });
        }
        setEditingId(null);
    }, [updateRequestInCollection]);
    const openDeleteConfirm = useCallback((type, id, collectionId, name) => {
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
        }
        else if (type === 'folder') {
            deleteFolder(collectionId, id);
        }
        else if (type === 'request') {
            deleteRequestFromCollection(collectionId, id);
        }
        closeDeleteConfirm();
    }, [deleteConfirm, deleteCollection, deleteFolder, deleteRequestFromCollection, closeDeleteConfirm]);
    const handleAddFolder = useCallback((collectionId, parentFolderId = null) => {
        const newFolder = {
            id: crypto.randomUUID(),
            name: 'New Folder',
            requests: [],
            folders: [],
        };
        addFolder(collectionId, parentFolderId, newFolder);
        setExpandedIds((prev) => {
            const next = new Set(prev);
            next.add(collectionId);
            if (parentFolderId)
                next.add(parentFolderId);
            return next;
        });
        closeMenu();
        setEditingId(newFolder.id);
    }, [addFolder, closeMenu]);
    const handleAddRequest = useCallback((collectionId, folderId = null) => {
        const newRequest = {
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
            if (folderId)
                next.add(folderId);
            return next;
        });
        closeMenu();
        onRequestSelect?.(newRequest, collectionId);
        setEditingId(newRequest.id);
    }, [addRequestToCollection, closeMenu, onRequestSelect]);
    useEffect(() => {
        if (menuOpenId) {
            const handleClick = () => setMenuOpenId(null);
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [menuOpenId]);
    const toggleMenu = useCallback((id, e) => {
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
    const renderRequests = (requests, collectionId) => requests.map((req) => (_jsx(RequestItem, { request: req, isActive: activeRequestId === req.id, isMenuOpen: menuOpenId === req.id, isEditing: editingId === req.id, onSelect: () => onRequestSelect?.(req, collectionId), onToggleMenu: (e) => toggleMenu(req.id, e), onStartEdit: () => startEdit(req.id), onFinishEdit: (name) => handleRenameRequest(collectionId, req.id, name), onCancelEdit: cancelEdit, onDelete: () => openDeleteConfirm('request', req.id, collectionId, req.name) }, req.id)));
    /**
     * Renders subfolder tree items. Extracted from the main render
     * to keep nesting depth below the SonarQube 4-level threshold.
     */
    const renderSubFolders = (folders, collectionId) => folders.map((subFolder) => (_jsx(TreeItem, { type: "folder", name: subFolder.name, isExpanded: expandedIds.has(subFolder.id), isEditing: editingId === subFolder.id, isMenuOpen: menuOpenId === subFolder.id, onToggle: () => toggleExpand(subFolder.id), onToggleMenu: (e) => toggleMenu(subFolder.id, e), onStartEdit: () => startEdit(subFolder.id), onFinishEdit: () => cancelEdit(), onCancelEdit: cancelEdit, onDelete: () => openDeleteConfirm('folder', subFolder.id, collectionId, subFolder.name), onAddFolder: () => handleAddFolder(collectionId, subFolder.id), onAddRequest: () => handleAddRequest(collectionId, subFolder.id), children: renderRequests(subFolder.requests, collectionId) }, subFolder.id)));
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: cn('flex flex-col h-full bg-card border-r border-border', className), children: [_jsxs("div", { className: "shrink-0 h-12 px-3 flex items-center justify-between border-b border-border", children: [_jsx("span", { className: "font-semibold text-sm", children: "Collections" }), _jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: handleNewCollection, title: "New Collection", children: _jsx(Plus, { className: "h-4 w-4" }) })] }), _jsx(ScrollArea, { className: "flex-1", children: _jsx("div", { className: "p-2", children: collections.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-muted-foreground text-sm", children: [_jsx("p", { children: "No collections yet" }), _jsx(Button, { variant: "link", size: "sm", className: "mt-2", onClick: handleNewCollection, children: "Create your first collection" })] })) : (collections.map((collection) => (_jsxs(TreeItem, { type: "collection", name: collection.name, isExpanded: expandedIds.has(collection.id), isEditing: editingId === collection.id, isMenuOpen: menuOpenId === collection.id, onToggle: () => toggleExpand(collection.id), onToggleMenu: (e) => toggleMenu(collection.id, e), onStartEdit: () => startEdit(collection.id), onFinishEdit: (name) => handleRenameCollection(collection.id, name), onCancelEdit: cancelEdit, onDelete: () => openDeleteConfirm('collection', collection.id, collection.id, collection.name), onAddFolder: () => handleAddFolder(collection.id), onAddRequest: () => handleAddRequest(collection.id), children: [collection.folders.map((folder) => (_jsxs(TreeItem, { type: "folder", name: folder.name, isExpanded: expandedIds.has(folder.id), isEditing: editingId === folder.id, isMenuOpen: menuOpenId === folder.id, onToggle: () => toggleExpand(folder.id), onToggleMenu: (e) => toggleMenu(folder.id, e), onStartEdit: () => startEdit(folder.id), onFinishEdit: () => cancelEdit(), onCancelEdit: cancelEdit, onDelete: () => openDeleteConfirm('folder', folder.id, collection.id, folder.name), onAddFolder: () => handleAddFolder(collection.id, folder.id), onAddRequest: () => handleAddRequest(collection.id, folder.id), children: [renderSubFolders(folder.folders, collection.id), renderRequests(folder.requests, collection.id)] }, folder.id))), renderRequests(collection.requests, collection.id), collection.folders.length === 0 && collection.requests.length === 0 && (_jsx("p", { className: "text-xs text-muted-foreground px-2 py-1 ml-4", children: "Empty collection" }))] }, collection.id)))) }) })] }), _jsx(ConfirmDialog, { open: deleteConfirm.isOpen, onOpenChange: (open) => !open && closeDeleteConfirm(), title: dialogContent.title, description: dialogContent.description, confirmLabel: "Delete", cancelLabel: "Cancel", variant: "danger", onConfirm: handleConfirmDelete, onCancel: closeDeleteConfirm })] }));
}
function TreeItem({ type, name, isExpanded, isEditing, isMenuOpen, children, onToggle, onToggleMenu, onStartEdit, onFinishEdit, onCancelEdit, onDelete, onAddFolder, onAddRequest, }) {
    const inputRef = useRef(null);
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
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onFinishEdit(editValue);
        }
        else if (e.key === 'Escape') {
            setEditValue(name);
            onCancelEdit();
        }
    };
    const isCollection = type === 'collection';
    const FolderIcon = isExpanded ? FolderOpen : Folder;
    const IconComponent = isCollection ? Folder : FolderIcon;
    const iconColor = isCollection ? 'text-primary' : 'text-muted-foreground';
    return (_jsxs("div", { className: "mb-0.5", children: [_jsxs("button", { type: "button", className: "w-full flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer group relative text-left", onClick: isEditing ? undefined : onToggle, children: [_jsx(ChevronRight, { className: cn('h-4 w-4 text-muted-foreground transition-transform shrink-0', isExpanded && 'rotate-90') }), _jsx(IconComponent, { className: cn('h-4 w-4 shrink-0', iconColor) }), isEditing ? (_jsx(Input, { ref: inputRef, value: editValue, onChange: (e) => setEditValue(e.target.value), onBlur: () => onFinishEdit(editValue), onKeyDown: handleKeyDown, className: "h-6 text-sm py-0 px-1 flex-1", onClick: (e) => e.stopPropagation() })) : (_jsx("span", { className: "text-sm truncate flex-1", children: name })), _jsx("span", { role: "none", className: "h-6 w-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-muted", onClick: onToggleMenu, children: _jsx(MoreHorizontal, { className: "h-3.5 w-3.5" }) }), isMenuOpen && (_jsxs("div", { className: "absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[140px]", onClick: (e) => e.stopPropagation(), onKeyDown: (e) => e.key === 'Escape' && onToggleMenu(e), children: [_jsxs("button", { type: "button", className: "w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2", onClick: onAddRequest, children: [_jsx(FilePlus, { className: "h-4 w-4" }), " Add Request"] }), _jsxs("button", { type: "button", className: "w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2", onClick: onAddFolder, children: [_jsx(FolderPlus, { className: "h-4 w-4" }), " Add Folder"] }), _jsx("div", { className: "border-t border-border my-1" }), _jsxs("button", { type: "button", className: "w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2", onClick: onStartEdit, children: [_jsx(Pencil, { className: "h-4 w-4" }), " Rename"] }), _jsxs("button", { type: "button", className: "w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2 text-destructive", onClick: onDelete, children: [_jsx(Trash2, { className: "h-4 w-4" }), " Delete"] })] }))] }), isExpanded && children && _jsx("div", { className: "ml-4 border-l border-border/50 pl-2", children: children })] }));
}
function RequestItem({ request, isActive, isMenuOpen, isEditing, onSelect, onToggleMenu, onStartEdit, onFinishEdit, onCancelEdit, onDelete, }) {
    const inputRef = useRef(null);
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onFinishEdit(e.target.value);
        }
        else if (e.key === 'Escape') {
            onCancelEdit();
        }
    };
    return (_jsxs("button", { type: "button", className: cn('w-full flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer group relative text-left', isActive ? 'bg-muted text-foreground' : 'hover:bg-muted/50'), onClick: () => !isEditing && onSelect(), children: [_jsx(FileJson, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" }), _jsx("span", { className: cn('text-xs font-mono shrink-0', getMethodColor(request.method)), children: request.method.substring(0, 3) }), isEditing ? (_jsx(Input, { ref: inputRef, defaultValue: request.name, className: "h-5 text-sm px-1 py-0 flex-1", onBlur: (e) => onFinishEdit(e.target.value), onKeyDown: handleKeyDown, onClick: (e) => e.stopPropagation() })) : (_jsx("span", { className: "text-sm truncate flex-1", children: request.name })), !isEditing && (_jsx("span", { role: "none", className: "h-6 w-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-muted", onClick: onToggleMenu, children: _jsx(MoreHorizontal, { className: "h-3.5 w-3.5" }) })), isMenuOpen && (_jsxs("div", { className: "absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[120px]", onClick: (e) => e.stopPropagation(), onKeyDown: (e) => e.key === 'Escape' && onToggleMenu(e), children: [_jsxs("button", { type: "button", className: "w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2", onClick: onStartEdit, children: [_jsx(Pencil, { className: "h-4 w-4" }), " Rename"] }), _jsxs("button", { type: "button", className: "w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2 text-destructive", onClick: onDelete, children: [_jsx(Trash2, { className: "h-4 w-4" }), " Delete"] })] }))] }));
}
//# sourceMappingURL=CollectionSidebar.js.map