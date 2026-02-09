import { type CollectionFolder, type ApiRequest } from '@vessel/core';
interface SidebarFolderProps {
    readonly folder: CollectionFolder;
    readonly collectionId: string;
    readonly parentId: string | null;
    readonly expandedIds: Set<string>;
    readonly editingId: string | null;
    readonly menuOpenId: string | null;
    readonly onToggle: (id: string) => void;
    readonly onToggleMenu: (id: string, e: React.MouseEvent) => void;
    readonly onStartEdit: (id: string) => void;
    readonly onFinishEdit: (name: string) => void;
    readonly onCancelEdit: () => void;
    readonly onDelete: (type: 'folder' | 'request', id: string, name: string) => void;
    readonly onAddFolder: (collectionId: string, parentId: string) => void;
    readonly onAddRequest: (collectionId: string, parentId: string) => void;
    readonly onRequestSelect?: (request: ApiRequest) => void;
    readonly onRenameRequest: (reqId: string, name: string) => void;
    readonly onRenameFolder: (folderId: string, name: string) => void;
}
export declare function SidebarFolder({ folder, collectionId, parentId, expandedIds, editingId, menuOpenId, onToggle, onToggleMenu, onStartEdit, onFinishEdit, // This needs to be specific or we use specific handlers
onCancelEdit, onDelete, onAddFolder, onAddRequest, onRequestSelect, onRenameRequest, onRenameFolder, }: SidebarFolderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SidebarFolder.d.ts.map