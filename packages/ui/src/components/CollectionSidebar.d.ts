import { type ApiRequest } from '@vessel/core';
interface CollectionSidebarProps {
    readonly className?: string;
    readonly onRequestSelect?: (request: ApiRequest, collectionId: string) => void;
}
/**
 * Sidebar component for managing API collections.
 * Displays a tree view of collections, folders, and requests.
 */
export declare function CollectionSidebar({ className, onRequestSelect }: CollectionSidebarProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=CollectionSidebar.d.ts.map