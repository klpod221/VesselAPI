import * as React from "react";
interface PopoverProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}
declare const Popover: ({ open, onOpenChange, children }: PopoverProps) => import("react/jsx-runtime").JSX.Element;
declare const PopoverTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
declare const PopoverContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export { Popover, PopoverTrigger, PopoverContent };
//# sourceMappingURL=Popover.d.ts.map