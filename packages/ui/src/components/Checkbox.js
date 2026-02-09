import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../lib/utils";
const Checkbox = React.forwardRef(({ className, onCheckedChange, ...props }, ref) => {
    return (_jsxs("div", { className: "relative flex items-center justify-center", children: [_jsx("input", { type: "checkbox", className: cn("peer h-4 w-4 shrink-0 appearance-none rounded-[4px] border border-input bg-card ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:text-primary-foreground", className), ref: ref, onChange: (e) => onCheckedChange?.(e.target.checked), ...props }), _jsx(Check, { className: "pointer-events-none absolute h-3 w-3 text-primary-foreground font-bold opacity-0 peer-checked:opacity-100 transition-opacity" })] }));
});
Checkbox.displayName = "Checkbox";
export { Checkbox };
//# sourceMappingURL=Checkbox.js.map