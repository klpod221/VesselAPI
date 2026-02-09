import { jsx as _jsx } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils";
const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground shadow-none hover:bg-primary/80 font-mono",
            secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
            destructive: "border-transparent bg-destructive text-destructive-foreground shadow-none hover:bg-destructive/80",
            outline: "text-foreground border-input",
            glass: "border-border bg-card text-muted-foreground",
            success: "border-transparent bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
            warning: "border-transparent bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
function Badge({ className, variant, ...props }) {
    return (_jsx("div", { className: cn(badgeVariants({ variant }), className), ...props }));
}
export { Badge, badgeVariants };
//# sourceMappingURL=Badge.js.map