import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../lib/utils";
import { Portal } from "./Portal";
const SheetContext = React.createContext(null);
const Sheet = ({ open, onOpenChange, children }) => {
    const [localOpen, setLocalOpen] = React.useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : localOpen;
    const setIsOpen = isControlled ? onOpenChange : setLocalOpen;
    const contextValue = React.useMemo(() => ({
        open: !!isOpen,
        onOpenChange: setIsOpen
    }), [isOpen, setIsOpen]);
    return (_jsx(SheetContext.Provider, { value: contextValue, children: children }));
};
const SheetTrigger = React.forwardRef(({ className, onClick, ...props }, ref) => {
    const context = React.useContext(SheetContext);
    return (_jsx("button", { ref: ref, type: "button", onClick: (e) => {
            onClick?.(e);
            context?.onOpenChange(true);
        }, className: className, ...props }));
});
SheetTrigger.displayName = "SheetTrigger";
const sheetVariants = cva("fixed z-50 gap-4 p-6 shadow-2xl transition ease-in-out duration-300 bg-background border-l border-border animate-in slide-in-from-right", {
    variants: {
        side: {
            top: "inset-x-0 top-0 border-b",
            bottom: "inset-x-0 bottom-0 border-t",
            left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
            right: "inset-y-0 right-0 h-full w-4/5 border-l sm:max-w-md", // Custom width for Vessel panels
        },
    },
    defaultVariants: {
        side: "right",
    },
});
const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => {
    const context = React.useContext(SheetContext);
    if (!context?.open)
        return null;
    return (_jsx(Portal, { children: _jsxs("div", { className: "fixed inset-0 z-50 flex", children: [_jsx("div", { className: "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", onClick: () => context?.onOpenChange(false), role: "button", tabIndex: -1, onKeyDown: (e) => {
                        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                            context?.onOpenChange(false);
                        }
                    }, "data-state": context.open ? "open" : "closed" }), _jsxs("div", { ref: ref, className: cn(sheetVariants({ side }), className), ...props, children: [children, _jsxs("button", { type: "button", onClick: () => context.onOpenChange(false), className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-secondary/50 p-1", children: [_jsx(X, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Close" })] })] })] }) }));
});
SheetContent.displayName = "SheetContent";
const SheetHeader = ({ className, ...props }) => (_jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props }));
SheetHeader.displayName = "SheetHeader";
const SheetFooter = ({ className, ...props }) => (_jsx("div", { className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className), ...props }));
SheetFooter.displayName = "SheetFooter";
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (_jsx("h2", { ref: ref, className: cn("text-lg font-semibold text-foreground", className), ...props })));
SheetTitle.displayName = "SheetTitle";
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (_jsx("p", { ref: ref, className: cn("text-sm text-muted-foreground", className), ...props })));
SheetDescription.displayName = "SheetDescription";
export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, };
//# sourceMappingURL=Sheet.js.map