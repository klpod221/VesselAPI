import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../lib/utils";
const TooltipContext = React.createContext(null);
// Simple provider impl
const TooltipProvider = ({ children }) => _jsx(_Fragment, { children: children });
const Tooltip = ({ children, open, defaultOpen, onOpenChange, delayDuration = 200 }) => {
    const [localOpen, setLocalOpen] = React.useState(defaultOpen || false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : localOpen;
    const setIsOpen = isControlled ? onOpenChange : setLocalOpen;
    const timeoutRef = React.useRef(null);
    const handleOpen = () => {
        if (timeoutRef.current)
            clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsOpen?.(true);
        }, delayDuration);
    };
    const handleClose = () => {
        if (timeoutRef.current)
            clearTimeout(timeoutRef.current);
        setIsOpen?.(false);
    };
    React.useEffect(() => {
        return () => {
            if (timeoutRef.current)
                clearTimeout(timeoutRef.current);
        };
    }, []);
    const contextValue = React.useMemo(() => ({
        open: !!isOpen,
        onOpenChange: setIsOpen
    }), [isOpen, setIsOpen]);
    return (_jsx(TooltipContext.Provider, { value: contextValue, children: _jsx("div", { className: "relative inline-block", onMouseEnter: handleOpen, onMouseLeave: handleClose, onFocus: handleOpen, onBlur: handleClose, role: "button", tabIndex: 0, children: children }) }));
};
const TooltipTrigger = React.forwardRef(({ className, ...props }, ref) => (_jsx("button", { ref: ref, className: className, ...props })));
TooltipTrigger.displayName = "TooltipTrigger";
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => {
    const context = React.useContext(TooltipContext);
    if (!context?.open)
        return null;
    return (_jsx("div", { ref: ref, role: "tooltip", className: cn("absolute z-50 overflow-hidden rounded-[4px] border border-border bg-popover px-3 py-1.5 text-xs shadow-none animate-in fade-in-0 zoom-in-95 text-popover-foreground", className), style: { top: "100%", marginTop: sideOffset, left: "50%", transform: "translateX(-50%)" }, ...props }));
});
TooltipContent.displayName = "TooltipContent";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
//# sourceMappingURL=Tooltip.js.map