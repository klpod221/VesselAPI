import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect } from 'react';
import { Folder, FolderOpen, ChevronRight, MoreHorizontal, FilePlus, FolderPlus, Pencil, Trash2, } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from '../Input';
export function SidebarTreeItem({ type, id, name, isExpanded, isEditing, isMenuOpen, children, onToggle, onToggleMenu, onStartEdit, onFinishEdit, onCancelEdit, onDelete, onAddFolder, onAddRequest, }) {
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
    let IconComponent = Folder;
    if (isCollection) {
        IconComponent = Folder;
    }
    else if (isExpanded) {
        IconComponent = FolderOpen;
    }
    const iconColor = isCollection ? 'text-primary' : 'text-muted-foreground';
    return (_jsxs("div", { className: "mb-0.5", "data-id": id, children: [_jsxs("div", { className: "group relative flex items-center rounded-md hover:bg-muted/50", children: [_jsxs("button", { type: "button", className: "flex items-center gap-1 px-2 py-1.5 cursor-pointer w-full text-left", onClick: isEditing ? undefined : onToggle, onKeyDown: (e) => e.key === 'Enter' && !isEditing && onToggle(), children: [_jsx(ChevronRight, { className: cn('h-4 w-4 text-muted-foreground transition-transform shrink-0', isExpanded && 'rotate-90') }), _jsx(IconComponent, { className: cn('h-4 w-4 shrink-0', iconColor) }), isEditing ? (_jsx(Input, { ref: inputRef, value: editValue, onChange: (e) => setEditValue(e.target.value), onBlur: () => onFinishEdit(editValue), onKeyDown: handleKeyDown, className: "h-6 text-sm py-0 px-1 flex-1", onClick: (e) => e.stopPropagation() })) : (_jsx("span", { className: "text-sm truncate flex-1", children: name }))] }), _jsx("button", { type: "button", className: "h-6 w-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-muted absolute right-1", onClick: onToggleMenu, children: _jsx(MoreHorizontal, { className: "h-3.5 w-3.5" }) }), isMenuOpen && (_jsxs("div", { className: "absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[140px]", role: "menu", tabIndex: -1, onClick: (e) => e.stopPropagation(), onKeyDown: (e) => e.stopPropagation(), children: [_jsxs("button", { className: "w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2", onClick: onAddRequest, children: [_jsx(FilePlus, { className: "h-4 w-4" }), " Add Request"] }), _jsxs("button", { className: "w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2", onClick: onAddFolder, children: [_jsx(FolderPlus, { className: "h-4 w-4" }), " Add Folder"] }), _jsx("div", { className: "border-t border-border my-1" }), _jsxs("button", { className: "w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2", onClick: onStartEdit, children: [_jsx(Pencil, { className: "h-4 w-4" }), " Rename"] }), _jsxs("button", { className: "w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2 text-destructive", onClick: onDelete, children: [_jsx(Trash2, { className: "h-4 w-4" }), " Delete"] })] }))] }), isExpanded && children && _jsx("div", { className: "ml-4 border-l border-border/50 pl-2", children: children })] }));
}
//# sourceMappingURL=SidebarTreeItem.js.map