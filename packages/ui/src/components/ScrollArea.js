import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../lib/utils";
const ScrollArea = React.forwardRef(({ className, children, orientation = "vertical", ...props }, ref) => (_jsx("div", { ref: ref, className: cn("relative overflow-auto", orientation === "vertical" && "overflow-y-auto overflow-x-hidden", orientation === "horizontal" && "overflow-x-auto overflow-y-hidden", orientation === "both" && "overflow-auto", className), ...props, children: children })));
ScrollArea.displayName = "ScrollArea";
export { ScrollArea };
//# sourceMappingURL=ScrollArea.js.map