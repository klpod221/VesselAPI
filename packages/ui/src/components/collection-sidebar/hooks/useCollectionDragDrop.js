import { arrayMove } from '@dnd-kit/sortable';
import { useCollectionStore } from '@vessel/core';
import { useState } from 'react';
export function useCollectionDragDrop() {
    const { collections, reorderCollections, reorderFolders, reorderRequests, } = useCollectionStore();
    const [activeDragId, setActiveDragId] = useState(null);
    const handleDragStart = (event) => {
        setActiveDragId(event.active.id);
    };
    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragId(null);
        if (!over || active.id === over.id)
            return;
        const activeData = active.data.current;
        const overData = over.data.current;
        if (!activeData || !overData)
            return;
        // Only allow reordering within the same container (same type and same parent)
        const isSameType = activeData.type === overData.type;
        const isSameParent = activeData.parentId === overData.parentId;
        const isSameCollection = activeData.collectionId === overData.collectionId;
        if (isSameType && isSameParent && isSameCollection) {
            if (activeData.type === 'collection') {
                reorderCollectionItems(active.id, over.id);
            }
            else if (activeData.type === 'folder') {
                reorderFolderItems(active.id, over.id, activeData.collectionId, activeData.parentId);
            }
            else if (activeData.type === 'request') {
                reorderRequestItems(active.id, over.id, activeData.collectionId, activeData.parentId);
            }
        }
    };
    const reorderCollectionItems = (activeId, overId) => {
        const activeIndex = collections.findIndex((c) => c.id === activeId);
        const overIndex = collections.findIndex((c) => c.id === overId);
        if (activeIndex !== -1 && overIndex !== -1) {
            const newOrder = arrayMove(collections, activeIndex, overIndex).map((c) => c.id);
            reorderCollections(newOrder);
        }
    };
    const reorderFolderItems = (activeId, overId, collectionId, parentId) => {
        const collection = collections.find(c => c.id === collectionId);
        if (!collection)
            return;
        const folders = findSiblingFolders(collection, parentId);
        const activeIndex = folders.findIndex(f => f.id === activeId);
        const overIndex = folders.findIndex(f => f.id === overId);
        if (activeIndex !== -1 && overIndex !== -1) {
            const newOrder = arrayMove(folders, activeIndex, overIndex).map(f => f.id);
            reorderFolders(collectionId, parentId || null, newOrder);
        }
    };
    const reorderRequestItems = (activeId, overId, collectionId, parentId) => {
        const collection = collections.find(c => c.id === collectionId);
        if (!collection)
            return;
        const requests = findSiblingRequests(collection, parentId);
        const activeIndex = requests.findIndex(r => r.id === activeId);
        const overIndex = requests.findIndex(r => r.id === overId);
        if (activeIndex !== -1 && overIndex !== -1) {
            const newOrder = arrayMove(requests, activeIndex, overIndex).map(r => r.id);
            reorderRequests(collectionId, parentId || null, newOrder);
        }
    };
    const findSiblingFolders = (collection, parentId) => {
        if (!parentId) {
            return collection.folders;
        }
        const parent = findFolderRecursive(collection.folders, parentId);
        return parent ? parent.folders : [];
    };
    const findSiblingRequests = (collection, parentId) => {
        if (!parentId) {
            return collection.requests;
        }
        const parent = findFolderRecursive(collection.folders, parentId);
        return parent ? parent.requests : [];
    };
    const findFolderRecursive = (list, id) => {
        for (const f of list) {
            if (f.id === id)
                return f;
            const found = findFolderRecursive(f.folders, id);
            if (found)
                return found;
        }
        return null;
    };
    return {
        activeDragId,
        handleDragStart,
        handleDragEnd,
    };
}
//# sourceMappingURL=useCollectionDragDrop.js.map