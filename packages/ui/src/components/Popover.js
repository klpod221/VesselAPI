import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../lib/utils";
const PopoverContext = React.createContext(null);
const Popover = ({ open, onOpenChange, children }) => {
    const [localOpen, setLocalOpen] = React.useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : localOpen;
    const setIsOpen = isControlled ? onOpenChange : setLocalOpen;
    // Close on click outside
    const popoverRef = React.useRef(null);
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen?.(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, setIsOpen]);
    const contextValue = React.useMemo(() => ({
        open: !!isOpen,
        onOpenChange: setIsOpen
    }), [isOpen, setIsOpen]);
    return (_jsx(PopoverContext.Provider, { value: contextValue, children: _jsx("div", { ref: popoverRef, className: "relative inline-block", children: children }) }));
};
const PopoverTrigger = React.forwardRef(({ className, onClick, ...props }, ref) => {
    const context = React.useContext(PopoverContext);
    return (_jsx("button", { ref: ref, type: "button", onClick: (e) => {
            onClick?.(e);
            context?.onOpenChange(!context.open);
        }, className: className, ...props }));
});
PopoverTrigger.displayName = "PopoverTrigger";
const PopoverContent = React.forwardRef(({ className, style, ...props }, ref) => {
    const context = React.useContext(PopoverContext);
    if (!context?.open)
        return null;
    return (_jsx("div", { ref: ref, className: cn("absolute z-50 mt-2 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-none outline-none animate-in fade-in-0 zoom-in-95", className), style: { top: "100%", ...style }, ...props }));
});
PopoverContent.displayName = "PopoverContent";
export { Popover, PopoverTrigger, PopoverContent };
//# sourceMappingURL=Popover.js.map