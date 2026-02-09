import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect } from 'react';
import { FileJson, MoreHorizontal, Pencil, Trash2, } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from '../Input';
const METHOD_COLORS = {
    GET: 'text-green-500',
    POST: 'text-yellow-500',
    PUT: 'text-blue-500',
    PATCH: 'text-purple-500',
    DELETE: 'text-red-500',
};
export function SidebarRequestItem({ request, isMenuOpen, isEditing, onSelect, onToggleMenu, onStartEdit, onFinishEdit, onCancelEdit, onDelete, }) {
    const inputRef = useRef(null);
    const [editValue, setEditValue] = useState(request.name);
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    useEffect(() => {
        setEditValue(request.name);
    }, [request.name]);
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onFinishEdit(editValue);
        }
        else if (e.key === 'Escape') {
            setEditValue(request.name);
            onCancelEdit();
        }
    };
    return (_jsxs("div", { className: "group relative flex items-center rounded-md hover:bg-muted/50 px-2 py-1", children: [_jsxs("button", { type: "button", className: "flex items-center gap-2 flex-1 text-left cursor-pointer", onClick: isEditing ? undefined : onSelect, onKeyDown: (e) => e.key === 'Enter' && !isEditing && onSelect(), children: [_jsx(FileJson, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" }), _jsx("span", { className: cn('text-xs font-mono shrink-0', METHOD_COLORS[request.method] || 'text-foreground'), children: request.method.substring(0, 3) }), isEditing ? (_jsx(Input, { ref: inputRef, value: editValue, onChange: (e) => setEditValue(e.target.value), onBlur: () => onFinishEdit(editValue), onKeyDown: handleKeyDown, className: "h-6 text-sm py-0 px-1 flex-1", onClick: (e) => e.stopPropagation() })) : (_jsx("span", { className: "text-sm truncate flex-1", children: request.name }))] }), _jsx("button", { type: "button", className: "h-6 w-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-muted absolute right-1", onClick: onToggleMenu, children: _jsx(MoreHorizontal, { className: "h-3.5 w-3.5" }) }), isMenuOpen && (_jsxs("div", { className: "absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[140px]", onClick: (e) => e.stopPropagation(), children: [_jsxs("button", { className: "w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2", onClick: onStartEdit, children: [_jsx(Pencil, { className: "h-4 w-4" }), " Rename"] }), _jsxs("button", { className: "w-full px-3 py-1.5 text-sm text-left hover:bg-muted flex items-center gap-2 text-destructive", onClick: onDelete, children: [_jsx(Trash2, { className: "h-4 w-4" }), " Delete"] })] }))] }));
}
//# sourceMappingURL=SidebarRequestItem.js.map