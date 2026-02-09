import * as React from "react";
interface TooltipProviderProps {
    children: React.ReactNode;
    delayDuration?: number;
    skipDelayDuration?: number;
    disableHoverableContent?: boolean;
}
declare const TooltipProvider: ({ children }: TooltipProviderProps) => import("react/jsx-runtime").JSX.Element;
interface TooltipProps {
    children: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    delayDuration?: number;
}
declare const Tooltip: ({ children, open, defaultOpen, onOpenChange, delayDuration }: TooltipProps) => import("react/jsx-runtime").JSX.Element;
declare const TooltipTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
    sideOffset?: number;
}
declare const TooltipContent: React.ForwardRefExoticComponent<TooltipContentProps & React.RefAttributes<HTMLDivElement>>;
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
//# sourceMappingURL=Tooltip.d.ts.map