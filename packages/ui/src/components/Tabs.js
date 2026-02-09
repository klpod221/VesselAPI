import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../lib/utils";
const TabsContext = React.createContext(null);
const Tabs = React.forwardRef(({ className, value, defaultValue, onValueChange, children, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(defaultValue || "");
    const currentValue = value ?? localValue;
    const changeHandler = onValueChange || setLocalValue;
    const contextValue = React.useMemo(() => ({
        value: currentValue,
        onValueChange: changeHandler
    }), [currentValue, changeHandler]);
    return (_jsx(TabsContext.Provider, { value: contextValue, children: _jsx("div", { ref: ref, className: cn("", className), ...props, children: children }) }));
});
Tabs.displayName = "Tabs";
const TabsList = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className), ...props })));
TabsList.displayName = "TabsList";
const TabsTrigger = React.forwardRef(({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isActive = context?.value === value;
    return (_jsx("button", { ref: ref, type: "button", role: "tab", "aria-selected": isActive, "data-state": isActive ? "active" : "inactive", onClick: () => context?.onValueChange(value), className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-[4px] px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary", className), ...props }));
});
TabsTrigger.displayName = "TabsTrigger";
const TabsContent = React.forwardRef(({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isActive = context?.value === value;
    if (!isActive)
        return null;
    return (_jsx("div", { ref: ref, role: "tabpanel", "data-state": isActive ? "active" : "inactive", className: cn("ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className), ...props }));
});
TabsContent.displayName = "TabsContent";
export { Tabs, TabsList, TabsTrigger, TabsContent };
//# sourceMappingURL=Tabs.js.map