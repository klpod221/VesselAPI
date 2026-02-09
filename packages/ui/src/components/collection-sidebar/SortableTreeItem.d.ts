import { SidebarTreeItem } from './SidebarTreeItem';
type SidebarTreeItemProps = React.ComponentProps<typeof SidebarTreeItem>;
interface SortableTreeItemProps extends SidebarTreeItemProps {
    id: string;
    data?: Record<string, any>;
}
export declare function SortableTreeItem({ id, data, children, ...props }: SortableTreeItemProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SortableTreeItem.d.ts.map