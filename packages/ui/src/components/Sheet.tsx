import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "../lib/utils"
import { Portal } from "./Portal"

const SheetContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
} | null>(null)

interface SheetProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
}
  
const Sheet = ({ open, onOpenChange, children }: SheetProps) => {
    const [localOpen, setLocalOpen] = React.useState(false)
    const isControlled = open !== undefined
    const isOpen = isControlled ? open : localOpen
    const setIsOpen = isControlled ? onOpenChange : setLocalOpen
  
    const contextValue = React.useMemo(() => ({
      open: !!isOpen,
      onOpenChange: setIsOpen!
    }), [isOpen, setIsOpen])
  
    return (
      <SheetContext.Provider value={contextValue}>
        {children}
      </SheetContext.Provider>
    )
}
  
const SheetTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, onClick, ...props }, ref) => {
      const context = React.useContext(SheetContext)
      return (
        <button
          ref={ref}
          type="button"
          onClick={(e) => {
            onClick?.(e)
            context?.onOpenChange(true)
          }}
          className={className}
          {...props}
        />
      )
    }
)
SheetTrigger.displayName = "SheetTrigger"

const sheetVariants = cva(
  "fixed z-50 gap-2 p-2 transition ease-in-out duration-300 bg-background border-l border-border animate-in slide-in-from-right",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b",
        bottom: "inset-x-0 bottom-0 border-t",
        left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-2/5 border-l sm:max-w-md", // Custom width for Vessel panels
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => {
    const context = React.useContext(SheetContext)
    if (!context?.open) return null

    return (
      <Portal>
        <div className="fixed inset-0 z-50 flex">
             {/* Overlay */}
           <button
              type="button"
              className="fixed inset-0 z-50 bg-black/80 border-0 p-0 cursor-default data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
              onClick={() => context?.onOpenChange(false)}
              onKeyDown={(e) => {
                   if (e.key === 'Escape') {
                      context?.onOpenChange(false)
                  }
              }}
              data-state={context.open ? "open" : "closed"}
              aria-label="Close sheet"
            />
           
           <div
            ref={ref}
            className={cn(sheetVariants({ side }), className)}
            {...props}
            >
            {children}
            <button
                type="button"
                onClick={() => context.onOpenChange(false)}
                className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none bg-secondary/50 p-1"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
            </div>
        </div>
      </Portal>
    )
  }
)
SheetContent.displayName = "SheetContent"

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </h2>
  )
)
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
