import { SidebarRequestItem } from './SidebarRequestItem';
type SidebarRequestItemProps = React.ComponentProps<typeof SidebarRequestItem>;
interface SortableRequestItemProps extends SidebarRequestItemProps {
    id: string;
    data?: Record<string, any>;
}
export declare function SortableRequestItem({ id, data, ...props }: SortableRequestItemProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SortableRequestItem.d.ts.map