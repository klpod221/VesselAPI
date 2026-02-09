import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
const AccordionContext = React.createContext(null);
const Accordion = React.forwardRef(({ className, type = "single", collapsible, value, defaultValue, onValueChange, children, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(defaultValue);
    const currentValue = value ?? localValue;
    const handleValueChange = (itemValue) => {
        const newValue = (currentValue === itemValue && collapsible) ? "" : itemValue;
        setLocalValue(newValue);
        onValueChange?.(newValue);
    };
    const contextValue = React.useMemo(() => ({
        value: currentValue,
        onValueChange: handleValueChange
    }), [currentValue, collapsible, onValueChange]);
    return (_jsx(AccordionContext.Provider, { value: contextValue, children: _jsx("div", { ref: ref, className: className, ...props, children: children }) }));
});
Accordion.displayName = "Accordion";
const AccordionItem = React.forwardRef(({ className, value, children, ...props }, ref) => {
    return (_jsx("div", { ref: ref, "data-value": value, className: cn("border-b border-border transition-all", className), ...props, children: React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { value });
            }
            return child;
        }) }));
});
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = React.forwardRef(({ className, children, value, onClick, ...props }, ref) => {
    const context = React.useContext(AccordionContext);
    const isOpen = context?.value === value;
    return (_jsx("div", { className: "flex", children: _jsxs("button", { ref: ref, type: "button", onClick: (e) => {
                onClick?.(e);
                if (value)
                    context?.onValueChange(value);
            }, "data-state": isOpen ? "open" : "closed", className: cn("flex flex-1 items-center justify-between py-4 font-medium transition-all hover:text-primary [&[data-state=open]>svg]:rotate-180", className), ...props, children: [children, _jsx(ChevronDown, { className: "h-4 w-4 shrink-0 transition-transform duration-200" })] }) }));
});
AccordionTrigger.displayName = "AccordionTrigger";
const AccordionContent = React.forwardRef(({ className, children, value, ...props }, ref) => {
    const context = React.useContext(AccordionContext);
    const isOpen = context?.value === value;
    return (_jsx("div", { ref: ref, "data-state": isOpen ? "open" : "closed", className: cn("overflow-hidden text-sm transition-all grid", // using grid for animation
        isOpen ? "animate-accordion-down grid-rows-[1fr]" : "animate-accordion-up grid-rows-[0fr]", className), ...props, children: _jsxs("div", { className: "min-h-0", children: [" ", _jsx("div", { className: "pb-4 pt-0", children: children })] }) }));
});
AccordionContent.displayName = "AccordionContent";
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
//# sourceMappingURL=Accordion.js.map