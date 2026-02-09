import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../lib/utils';
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
export const Select = forwardRef(({ className, children, error, ...props }, ref) => {
    return (_jsxs("div", { className: "relative", children: [_jsx("select", { className: cn("flex h-9 w-full items-center justify-between rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50", "appearance-none pr-8", "disabled:cursor-not-allowed disabled:opacity-50", error && "border-destructive/50 focus:border-destructive ring-destructive/20", className), ref: ref, ...props, children: children }), _jsx(ChevronDown, { className: "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" })] }));
});
Select.displayName = 'Select';
//# sourceMappingURL=Select.js.map