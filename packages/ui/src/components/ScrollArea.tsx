import * as React from "react"
import { cn } from "../lib/utils"

// Simple scroll area that hides default scrollbars and uses custom styles
export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: "vertical" | "horizontal" | "both";
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "vertical", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-auto",
        orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
        orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
        orientation === "both" && "overflow-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
