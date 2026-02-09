interface SidebarTreeItemProps {
    readonly type: 'collection' | 'folder';
    readonly id: string;
    readonly name: string;
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
export declare function SidebarTreeItem({ type, id, name, isExpanded, isEditing, isMenuOpen, children, onToggle, onToggleMenu, onStartEdit, onFinishEdit, onCancelEdit, onDelete, onAddFolder, onAddRequest, }: SidebarTreeItemProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SidebarTreeItem.d.ts.map