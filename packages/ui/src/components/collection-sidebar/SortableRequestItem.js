import { jsx as _jsx } from "react/jsx-runtime";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SidebarRequestItem } from './SidebarRequestItem';
export function SortableRequestItem({ id, data, ...props }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, } = useSortable({ id, data });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (_jsx("div", { ref: setNodeRef, style: style, ...attributes, ...listeners, children: _jsx(SidebarRequestItem, { ...props }) }));
}
//# sourceMappingURL=SortableRequestItem.js.map