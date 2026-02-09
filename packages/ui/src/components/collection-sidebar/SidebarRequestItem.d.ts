import type { ApiRequest } from '@vessel/core';
interface SidebarRequestItemProps {
    readonly request: ApiRequest;
    readonly isMenuOpen: boolean;
    readonly isEditing: boolean;
    readonly onSelect: () => void;
    readonly onToggleMenu: (e: React.MouseEvent) => void;
    readonly onStartEdit: () => void;
    readonly onFinishEdit: (name: string) => void;
    readonly onCancelEdit: () => void;
    readonly onDelete: () => void;
}
export declare function SidebarRequestItem({ request, isMenuOpen, isEditing, onSelect, onToggleMenu, onStartEdit, onFinishEdit, onCancelEdit, onDelete, }: SidebarRequestItemProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SidebarRequestItem.d.ts.map