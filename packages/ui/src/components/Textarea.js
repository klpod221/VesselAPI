import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../lib/utils';
import { forwardRef } from 'react';
export const Textarea = forwardRef(({ className, error, ...props }, ref) => {
    return (_jsx("textarea", { className: cn("flex min-h-[80px] w-full rounded-lg px-3 py-2 text-sm", "flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", "disabled:cursor-not-allowed disabled:opacity-50", error && "border-destructive/50 focus:border-destructive ring-destructive/20", className), ref: ref, ...props }));
});
Textarea.displayName = 'Textarea';
//# sourceMappingURL=Textarea.js.map